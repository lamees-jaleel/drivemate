import type {
  Request,
  Response
} from 'express';

import { relative } from 'node:path';

import {
  prisma
} from '../lib/prisma.js';

import {
  validateVehicle
} from '../validators/vehicle.validator.js';


/* =========================================================
   VEHICLE ENUM TYPES
========================================================= */

type FuelTypeValue =
  | 'PETROL'
  | 'DIESEL'
  | 'CNG'
  | 'LPG'
  | 'ELECTRIC'
  | 'HYBRID'
  | 'OTHER';


type TransmissionTypeValue =
  | 'MANUAL'
  | 'AUTOMATIC'
  | 'AMT'
  | 'CVT'
  | 'DCT'
  | 'OTHER';


type OwnershipTypeValue =
  | 'OWNED'
  | 'FINANCED'
  | 'LEASED';


/* =========================================================
   AUTH INFORMATION
========================================================= */

interface AuthInfo {

  userId: number;

  role: string;

}


/* =========================================================
   CREATE VEHICLE
========================================================= */

export async function createVehicle(
  req: Request,
  res: Response
): Promise<void> {

  try {

    /* =====================================================
       AUTHENTICATED OWNER
    ===================================================== */

    const auth =
      res.locals.auth as
        AuthInfo |
        undefined;


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    /* =====================================================
       VALIDATE INPUT
    ===================================================== */

    const validation =
      validateVehicle(
        req.body
      );


    if (!validation.valid) {

      res.status(400).json({

        success: false,

        message:
          'Vehicle validation failed.',

        errors:
          validation.errors

      });

      return;

    }


    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const registrationNumber =
      String(
        req.body.registrationNumber
      )
        .trim()
        .toUpperCase()
        .replace(
          /[\s-]+/g,
          ''
        );


    const make =
      String(
        req.body.make
      ).trim();


    const model =
      String(
        req.body.model
      ).trim();


    const variantValue =
      String(
        req.body.variant ??
        ''
      ).trim();


    const colorValue =
      String(
        req.body.color ??
        ''
      ).trim();


    const vinValue =
      String(
        req.body.vin ??
        ''
      )
        .trim()
        .toUpperCase()
        .replace(
          /\s+/g,
          ''
        );


    const engineNumberValue =
      String(
        req.body.engineNumber ??
        ''
      )
        .trim()
        .toUpperCase()
        .replace(
          /\s+/g,
          ''
        );


    const fuelType =
      String(
        req.body.fuelType
      ).trim() as
        FuelTypeValue;


    const transmissionValue =
      String(
        req.body.transmission ??
        ''
      ).trim();


    const transmission =
      transmissionValue
        ? transmissionValue as
            TransmissionTypeValue
        : null;


    const ownershipType =
      String(
        req.body.ownershipType ??
        'OWNED'
      ).trim() as
        OwnershipTypeValue;


    const manufacturingYear =
      Number(
        req.body.manufacturingYear
      );


    const odometerKm =
      Number(
        req.body.odometerKm ??
        0
      );


    /* =====================================================
       PURCHASE DATE
    ===================================================== */

    const purchaseDateValue =
      String(
        req.body.purchaseDate ??
        ''
      ).trim();


    const purchaseDate =
      purchaseDateValue
        ? new Date(
            `${purchaseDateValue}T00:00:00.000Z`
          )
        : null;


    const vehicleImagePath = req.file
      ? relative(
          process.cwd(),
          req.file.path
        )
          .replace(
            /\\/g,
            '/'
          )
      : (req.body.vehicleImagePath || null);


    /* =====================================================
       CREATE VEHICLE

       ownerId comes ONLY from JWT.
    ===================================================== */

    const vehicle =
      await prisma.vehicle.create({

        data: {

          ownerId:
            auth.userId,

          vehicleImagePath:
            vehicleImagePath || null,

          registrationNumber,

          make,

          model,

          variant:
            variantValue ||
            null,

          manufacturingYear,

          fuelType,

          transmission,

          color:
            colorValue ||
            null,

          vin:
            vinValue ||
            null,

          engineNumber:
            engineNumberValue ||
            null,

          odometerKm,

          purchaseDate,

          ownershipType

        },


        select: {

          id: true,

          registrationNumber: true,

          make: true,

          model: true,

          variant: true,

          manufacturingYear: true,

          fuelType: true,

          transmission: true,

          color: true,

          vehicleImagePath: true,

          vin: true,

          engineNumber: true,

          odometerKm: true,

          purchaseDate: true,

          ownershipType: true,

          status: true,

          createdAt: true,

          updatedAt: true

        }

      });


    /* =====================================================
       SUCCESS
    ===================================================== */

    res.status(201).json({

      success: true,

      message:
        'Vehicle added successfully.',

      vehicle

    });

  }

  catch (error) {

    console.error(
      'Create vehicle error:',
      error
    );


    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {

      res.status(409).json({

        success: false,

        message:
          'A vehicle with the same registration number, VIN, or engine number already exists.'

      });

      return;

    }


    res.status(500).json({

      success: false,

      message:
        'Unable to add vehicle. Please try again.'

    });

  }

}


/* =========================================================
   GET LOGGED-IN OWNER'S VEHICLES
========================================================= */

export async function getMyVehicles(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      res.locals.auth as
        AuthInfo |
        undefined;


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicles =
      await prisma.vehicle.findMany({

        where: {

          ownerId:
            auth.userId

        },


        orderBy: {

          createdAt:
            'desc'

        },


        select: {

          id: true,

          registrationNumber: true,

          make: true,

          model: true,

          variant: true,

          manufacturingYear: true,

          fuelType: true,

          transmission: true,

          color: true,

          vehicleImagePath: true,

          vin: true,

          engineNumber: true,

          odometerKm: true,

          purchaseDate: true,

          ownershipType: true,

          status: true,

          createdAt: true,

          updatedAt: true

        }

      });


    res.status(200).json({

      success: true,

      count:
        vehicles.length,

      vehicles

    });

  }

  catch (error) {

    console.error(
      'Get vehicles error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load vehicles. Please try again.'

    });

  }

}


/* =========================================================
   GET ONE VEHICLE
========================================================= */

export async function getVehicleById(
  req: Request,
  res: Response
): Promise<void> {

  try {

    /* =====================================================
       AUTHENTICATED OWNER
    ===================================================== */

    const auth =
      res.locals.auth as
        AuthInfo |
        undefined;


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
      Number(
        req.params.id
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
       FIND VEHICLE

       Important:
       We check BOTH vehicle ID
       and logged-in owner ID.
    ===================================================== */

    const vehicle =
      await prisma.vehicle.findFirst({

        where: {

          id:
            vehicleId,

          ownerId:
            auth.userId

        },


        select: {

          id: true,

          registrationNumber: true,

          make: true,

          model: true,

          variant: true,

          manufacturingYear: true,

          fuelType: true,

          transmission: true,

          color: true,

          vehicleImagePath: true,

          vin: true,

          engineNumber: true,

          odometerKm: true,

          purchaseDate: true,

          ownershipType: true,

          status: true,

          createdAt: true,

          updatedAt: true

        }

      });


    /* =====================================================
       NOT FOUND / NOT OWNED BY USER
    ===================================================== */

    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    res.status(200).json({

      success: true,

      vehicle

    });

  }

  catch (error) {

    console.error(
      'Get vehicle details error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load vehicle details. Please try again.'

    });

  }

}


/* =========================================================
   UPDATE VEHICLE
========================================================= */

export async function updateVehicle(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      res.locals.auth as
        AuthInfo |
        undefined;


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      Number(
        req.params.id
      );


    if (
      Number.isNaN(
        vehicleId
      )
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    const existingVehicle =
      await prisma.vehicle.findUnique({

        where: {
          id: vehicleId
        }

      });


    if (!existingVehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    if (
      existingVehicle.ownerId !==
      auth.userId
    ) {

      res.status(403).json({

        success: false,

        message:
          'Forbidden. You do not own this vehicle.'

      });

      return;

    }


    const validation =
      validateVehicle(
        req.body
      );


    if (!validation.valid) {

      res.status(400).json({

        success: false,

        message:
          'Vehicle validation failed.',

        errors:
          validation.errors

      });

      return;

    }


    const registrationNumber =
      String(
        req.body.registrationNumber
      )
        .trim()
        .toUpperCase()
        .replace(
          /[\s-]+/g,
          ''
        );


    const registrationConflict =
      await prisma.vehicle.findFirst({

        where: {

          registrationNumber,

          id: {
            not: vehicleId
          }

        }

      });


    if (registrationConflict) {

      res.status(400).json({

        success: false,

        message:
          'Vehicle validation failed.',

        errors: {

          registrationNumber:
            'Registration number is already registered to another vehicle.'

        }

      });

      return;

    }


    const make =
      String(
        req.body.make
      ).trim();


    const model =
      String(
        req.body.model
      ).trim();


    const variantValue =
      String(
        req.body.variant ??
        ''
      ).trim();


    const colorValue =
      String(
        req.body.color ??
        ''
      ).trim();


    const vinValue =
      String(
        req.body.vin ??
        ''
      )
        .trim()
        .toUpperCase()
        .replace(
          /\s+/g,
          ''
        );


    const engineNumberValue =
      String(
        req.body.engineNumber ??
        ''
      )
        .trim()
        .toUpperCase()
        .replace(
          /\s+/g,
          ''
        );


    const fuelType =
      String(
        req.body.fuelType
      ).trim() as
        FuelTypeValue;


    const transmissionValue =
      String(
        req.body.transmission ??
        ''
      ).trim();


    const transmission =
      transmissionValue
        ? transmissionValue as
            TransmissionTypeValue
        : null;


    const ownershipType =
      String(
        req.body.ownershipType ??
        'OWNED'
      ).trim() as
        OwnershipTypeValue;


    const manufacturingYear =
      Number(
        req.body.manufacturingYear
      );


    const odometerKm =
      Number(
        req.body.odometerKm ??
        0
      );


    const purchaseDateValue =
      String(
        req.body.purchaseDate ??
        ''
      ).trim();


    const purchaseDate =
      purchaseDateValue
        ? new Date(
            `${purchaseDateValue}T00:00:00.000Z`
          )
        : null;


    let vehicleImagePath =
      existingVehicle.vehicleImagePath;


    if (req.file) {

      vehicleImagePath =
        relative(
          process.cwd(),
          req.file.path
        )
          .replace(
            /\\/g,
            '/'
          );

    }

    else if (
      req.body.vehicleImagePath
    ) {

      vehicleImagePath =
        req.body.vehicleImagePath;

    }


    const updatedVehicle =
      await prisma.vehicle.update({

        where: {
          id: vehicleId
        },


        data: {

          registrationNumber,

          make,

          model,

          variant:
            variantValue ||
            null,

          manufacturingYear,

          fuelType,

          transmission,

          color:
            colorValue ||
            null,

          vehicleImagePath,

          vin:
            vinValue ||
            null,

          engineNumber:
            engineNumberValue ||
            null,

          odometerKm,

          purchaseDate,

          ownershipType

        },


        select: {

          id: true,

          registrationNumber: true,

          make: true,

          model: true,

          variant: true,

          manufacturingYear: true,

          fuelType: true,

          transmission: true,

          color: true,

          vehicleImagePath: true,

          vin: true,

          engineNumber: true,

          odometerKm: true,

          purchaseDate: true,

          ownershipType: true,

          status: true,

          createdAt: true,

          updatedAt: true

        }

      });


    res.status(200).json({

      success: true,

      message:
        'Vehicle updated successfully.',

      vehicle:
        updatedVehicle

    });

  }

  catch (error) {

    console.error(
      'Update vehicle error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Internal server error.'

    });

  }

}


/* =========================================================
   DELETE VEHICLE
========================================================= */

export async function deleteVehicle(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      res.locals.auth as
        AuthInfo |
        undefined;


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      Number(
        req.params.id
      );


    if (
      Number.isNaN(
        vehicleId
      )
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    const existingVehicle =
      await prisma.vehicle.findUnique({

        where: {
          id: vehicleId
        }

      });


    if (!existingVehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    if (
      existingVehicle.ownerId !==
      auth.userId
    ) {

      res.status(403).json({

        success: false,

        message:
          'Forbidden. You do not own this vehicle.'

      });

      return;

    }


    await prisma.vehicle.delete({

      where: {
        id: vehicleId
      }

    });


    res.status(200).json({

      success: true,

      message:
        'Vehicle deleted successfully.'

    });

  }

  catch (error) {

    console.error(
      'Delete vehicle error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Internal server error.'

    });

  }

}