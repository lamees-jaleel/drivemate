const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-backend/src/controllers/maintenance.controller.ts";
let content = fs.readFileSync(filePath, "utf8");

// 1. Add isDeleted: false to getMaintenanceRecords
content = content.replace(
  "where: {\n\n            vehicleId\n\n          },",
  "where: {\n\n            vehicleId,\nisDeleted: false\n          },"
);

// 2. Add isDeleted: false to getMaintenanceRecordById
content = content.replace(
  "id:\n              recordId,\n\n            vehicleId\n\n          },",
  "id:\n              recordId,\n\n            vehicleId,\nisDeleted: false\n          },"
);


// 3. Add update and delete functions at the end
const newFuncs = `

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
    const serviceDate = new Date(\`\${String(input.serviceDate).trim()}T00:00:00.000Z\`);
    const odometerKm = Number(input.odometerKm);
    const serviceCenterValue = String(input.serviceCenter ?? '').trim();
    const descriptionValue = String(input.description ?? '').trim();
    const cost = Number(input.cost ?? 0);
    const nextServiceDateValue = String(input.nextServiceDate ?? '').trim();
    const nextServiceDate = nextServiceDateValue ? new Date(\`\${nextServiceDateValue}T00:00:00.000Z\`) : null;
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

`;

if (!content.includes("updateMaintenanceRecord")) {
    content += newFuncs;
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched maintenance controller (Node)");
