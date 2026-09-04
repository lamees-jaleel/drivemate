import type {
  Request,
  Response
} from 'express';

import {
  prisma
} from '../lib/prisma.js';

import {
  validateMaintenanceRecord
} from '../validators/maintenance.validator.js';


/* =========================================================
   TYPES
========================================================= */

interface AuthInfo {

  userId: number;

  role: string;

}


type MaintenanceTypeValue =
  | 'ROUTINE_SERVICE'
  | 'OIL_CHANGE'
  | 'REPAIR'
  | 'TYRE_SERVICE'
  | 'BATTERY_SERVICE'
  | 'INSPECTION'
  | 'OTHER';


/* =========================================================
   GET AUTH
========================================================= */

function getAuth(
  res: Response
): AuthInfo | null {

  const auth =
    res.locals.auth as
      AuthInfo |
      undefined;


  return auth ?? null;

}


/* =========================================================
   PARSE VEHICLE ID
========================================================= */

function getVehicleId(
  req: Request
): number {

  return Number(
    req.params.vehicleId
  );

}


/* =========================================================
   VERIFY VEHICLE OWNERSHIP
========================================================= */

async function findOwnedVehicle(
  vehicleId: number,
  ownerId: number
) {

  return prisma.vehicle
    .findFirst({

      where: {

        id:
          vehicleId,

        ownerId

      },


      select: {

        id: true,

        odometerKm: true,

        registrationNumber: true,

        make: true,

        model: true

      }

    });

}


/* =========================================================
   CREATE MAINTENANCE RECORD
========================================================= */

export async function createMaintenanceRecord(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    /* =====================================================
       VEHICLE ID
    ===================================================== */

    const vehicleId =
      getVehicleId(
        req
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    /* =====================================================
       VERIFY VEHICLE OWNERSHIP
    ===================================================== */

    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       VALIDATE MAINTENANCE DATA
    ===================================================== */

    const validation =
      validateMaintenanceRecord(
        req.body
      );


    if (!validation.valid) {

      res.status(400).json({

        success: false,

        message:
          'Maintenance validation failed.',

        errors:
          validation.errors

      });

      return;

    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    const maintenanceType =
      String(
        req.body.maintenanceType
      ).trim() as
        MaintenanceTypeValue;


    const title =
      String(
        req.body.title
      ).trim();


    const serviceDate =
      new Date(
        `${String(
          req.body.serviceDate
        ).trim()}T00:00:00.000Z`
      );


    const odometerKm =
      Number(
        req.body.odometerKm
      );


    const serviceCenterValue =
      String(
        req.body.serviceCenter ??
        ''
      ).trim();


    const descriptionValue =
      String(
        req.body.description ??
        ''
      ).trim();


    const cost =
      Number(
        req.body.cost ??
        0
      );


    const nextServiceDateValue =
      String(
        req.body.nextServiceDate ??
        ''
      ).trim();


    const nextServiceDate =
      nextServiceDateValue
        ? new Date(
            `${nextServiceDateValue}T00:00:00.000Z`
          )
        : null;


    const nextServiceOdometerRaw =
      req.body.nextServiceOdometerKm;


    const nextServiceOdometerKm =
      (
        nextServiceOdometerRaw ===
          undefined ||
        nextServiceOdometerRaw ===
          null ||
        String(
          nextServiceOdometerRaw
        ).trim() === ''
      )
        ? null
        : Number(
            nextServiceOdometerRaw
          );


    /* =====================================================
       CREATE RECORD
    ===================================================== */

    const maintenanceRecord =
      await prisma
        .maintenanceRecord
        .create({

          data: {

            vehicleId,

            maintenanceType,

            title,

            serviceDate,

            odometerKm,

            serviceCenter:
              serviceCenterValue ||
              null,

            description:
              descriptionValue ||
              null,

            cost,

            nextServiceDate,

            nextServiceOdometerKm

          },


          select: {

            id: true,

            vehicleId: true,

            maintenanceType: true,

            title: true,

            serviceDate: true,

            odometerKm: true,

            serviceCenter: true,

            description: true,

            cost: true,

            nextServiceDate: true,

            nextServiceOdometerKm: true,

            createdAt: true,

            updatedAt: true

          }

        });


    /* =====================================================
       UPDATE VEHICLE ODOMETER

       Only move the vehicle odometer forward.
    ===================================================== */

    if (
      odometerKm >
      vehicle.odometerKm
    ) {

      await prisma.vehicle
        .update({

          where: {

            id:
              vehicleId

          },

          data: {

            odometerKm

          }

        });

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    res.status(201).json({

      success: true,

      message:
        'Maintenance record added successfully.',

      maintenanceRecord

    });

  }

  catch (error) {

    console.error(
      'Create maintenance error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to add maintenance record. Please try again.'

    });

  }

}


/* =========================================================
   GET MAINTENANCE HISTORY
========================================================= */

export async function getMaintenanceRecords(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    const maintenanceRecords =
      await prisma
        .maintenanceRecord
        .findMany({

          where: {

            vehicleId,
            isDeleted: false
          },


          orderBy: [

            {
              serviceDate:
                'desc'
            },

            {
              createdAt:
                'desc'
            }

          ],


          select: {

            id: true,

            vehicleId: true,

            maintenanceType: true,

            title: true,

            serviceDate: true,

            odometerKm: true,

            serviceCenter: true,

            description: true,

            cost: true,

            nextServiceDate: true,

            nextServiceOdometerKm: true,

            createdAt: true,

            updatedAt: true

          }

        });


    res.status(200).json({

      success: true,

      vehicle: {

        id:
          vehicle.id,

        registrationNumber:
          vehicle.registrationNumber,

        make:
          vehicle.make,

        model:
          vehicle.model

      },

      count:
        maintenanceRecords.length,

      maintenanceRecords

    });

  }

  catch (error) {

    console.error(
      'Get maintenance records error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load maintenance history. Please try again.'

    });

  }

}


/* =========================================================
   GET ONE MAINTENANCE RECORD
========================================================= */

export async function getMaintenanceRecordById(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    const recordId =
      Number(
        req.params.recordId
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    if (
      !Number.isInteger(
        recordId
      ) ||
      recordId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid maintenance record ID.'

      });

      return;

    }


    /* =====================================================
       VERIFY VEHICLE BELONGS TO USER
    ===================================================== */

    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       FIND RECORD

       Both IDs must match.
    ===================================================== */

    const maintenanceRecord =
      await prisma
        .maintenanceRecord
        .findFirst({

          where: {

            id:
              recordId,

            vehicleId,
            isDeleted: false
          },


          select: {

            id: true,

            vehicleId: true,

            maintenanceType: true,

            title: true,

            serviceDate: true,

            odometerKm: true,

            serviceCenter: true,

            description: true,

            cost: true,

            nextServiceDate: true,

            nextServiceOdometerKm: true,

            createdAt: true,

            updatedAt: true

          }

        });


    if (!maintenanceRecord) {

      res.status(404).json({

        success: false,

        message:
          'Maintenance record not found.'

      });

      return;

    }


    res.status(200).json({

      success: true,

      maintenanceRecord

    });

  }

  catch (error) {

    console.error(
      'Get maintenance record error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load maintenance record. Please try again.'

    });

  }

}

/* =========================================================
   UPDATE MAINTENANCE RECORD
========================================================= */

export async function updateMaintenanceRecord(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const vehicleId = getVehicleId(req);
    const recordId = Number(req.params.recordId);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0 || !Number.isInteger(recordId) || recordId <= 0) {
      res.status(400).json({ success: false, message: 'Invalid ID.' });
      return;
    }

    const vehicle = await findOwnedVehicle(vehicleId, auth.userId);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }

    const existingRecord = await prisma.maintenanceRecord.findFirst({
      where: { id: recordId, vehicleId, isDeleted: false }
    });

    if (!existingRecord) {
      res.status(404).json({ success: false, message: 'Maintenance record not found.' });
      return;
    }

    const validation = validateMaintenanceRecord(req.body || {});
    if (!validation.valid) {
      res.status(400).json({ success: false, message: 'Invalid maintenance data.', errors: validation.errors });
      return;
    }

    const input = req.body;
    const maintenanceType = String(input.maintenanceType).trim() as any;
    const title = String(input.title).trim();
    const serviceDate = new Date(`${String(input.serviceDate).trim()}T00:00:00.000Z`);
    const odometerKm = Number(input.odometerKm);
    const serviceCenterValue = String(input.serviceCenter ?? '').trim();
    const descriptionValue = String(input.description ?? '').trim();
    const cost = Number(input.cost ?? 0);
    const nextServiceDateValue = String(input.nextServiceDate ?? '').trim();
    const nextServiceDate = nextServiceDateValue ? new Date(`${nextServiceDateValue}T00:00:00.000Z`) : null;
    const nextServiceOdometerRaw = input.nextServiceOdometerKm;
    const nextServiceOdometerKm = (nextServiceOdometerRaw === undefined || nextServiceOdometerRaw === null || String(nextServiceOdometerRaw).trim() === '') ? null : Number(nextServiceOdometerRaw);

    const updatedRecord = await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: {
        maintenanceType,
        title,
        serviceDate,
        odometerKm,
        serviceCenter: serviceCenterValue || null,
        description: descriptionValue || null,
        cost,
        nextServiceDate,
        nextServiceOdometerKm
      },
      select: {
        id: true, vehicleId: true, maintenanceType: true, title: true,
        serviceDate: true, odometerKm: true, serviceCenter: true,
        description: true, cost: true, nextServiceDate: true,
        nextServiceOdometerKm: true, createdAt: true, updatedAt: true
      }
    });

    // Recalculate max odometer safely
    const maxMaint = await prisma.maintenanceRecord.aggregate({
      where: { vehicleId, isDeleted: false },
      _max: { odometerKm: true }
    });
    const maxExp = await prisma.expense.aggregate({
      where: { vehicleId },
      _max: { odometerKm: true }
    });
    const newMax = Math.max(maxMaint._max.odometerKm || 0, maxExp._max.odometerKm || 0);

    if (newMax > 0 && newMax > vehicle.odometerKm) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { odometerKm: newMax }
        });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully.',
      maintenanceRecord: updatedRecord
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ success: false, message: 'Unable to update maintenance record.' });
  }
}

/* =========================================================
   DELETE MAINTENANCE RECORD
========================================================= */

export async function deleteMaintenanceRecord(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const vehicleId = getVehicleId(req);
    const recordId = Number(req.params.recordId);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0 || !Number.isInteger(recordId) || recordId <= 0) {
      res.status(400).json({ success: false, message: 'Invalid ID.' });
      return;
    }

    const vehicle = await findOwnedVehicle(vehicleId, auth.userId);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }

    const existingRecord = await prisma.maintenanceRecord.findFirst({
      where: { id: recordId, vehicleId, isDeleted: false }
    });

    if (!existingRecord) {
      res.status(404).json({ success: false, message: 'Maintenance record not found.' });
      return;
    }

    await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: { isDeleted: true }
    });

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully.'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({ success: false, message: 'Unable to delete maintenance record.' });
  }
}

