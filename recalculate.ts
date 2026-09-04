import { prisma } from './drivemate-backend/src/lib/prisma.js';

export async function recalculateVehicleOdometer(vehicleId: number) {
    const maintenance = await prisma.maintenanceRecord.aggregate({
        where: { vehicleId, isDeleted: false },
        _max: { odometerKm: true }
    });
    const expenses = await prisma.expense.aggregate({
        where: { vehicleId },
        _max: { odometerKm: true }
    });
    // We don't have a reliable way to get the original vehicle purchase odometer if it's been overwritten, 
    // but we can query the current vehicle odometer and see if it's less than max.
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return;
    
    let newMax = Math.max(
        maintenance._max.odometerKm || 0,
        expenses._max.odometerKm || 0
    );
    // If the vehicle's current odometer is somehow higher (e.g. they set it manually, or from telematics), keep it? 
    // Actually, "Never allow the known vehicle odometer to accidentally move backwards". So we ONLY push it up.
    if (newMax > vehicle.odometerKm) {
        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { odometerKm: newMax }
        });
    }
}
