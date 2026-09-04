const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.ts";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /private hasUpcomingReminder\(vehicle: Vehicle, record: MaintenanceRecord\): boolean \{[\s\S]*?\n  \}/,
  `private hasUpcomingReminder(vehicle: Vehicle, record: MaintenanceRecord, allRecords: MaintenanceRecord[]): boolean {
    const status = this.maintenanceService.computeMaintenanceStatus(record, vehicle.odometerKm, allRecords);
    return status.urgent;
  }`
);

// We need to update the caller!
content = content.replace(
  /if \(this\.hasUpcomingReminder\(result\.vehicle, record\)\) \{/,
  "if (this.hasUpcomingReminder(result.vehicle, record, result.maintenanceRecords)) {"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched owner dashboard (Angular)");
