const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add property
content = content.replace(
  /upcomingServices = 0;/,
  "upcomingServices = 0;\n  urgentServiceAlert: { title: string, text: string, vehicle: string, status: string } | null = null;"
);

content = content.replace(
  /this\.upcomingServices = 0;/g,
  "this.upcomingServices = 0;\n        this.urgentServiceAlert = null;"
);

// We need to capture the urgent service in the forkJoin subscribe
// Replace the exact calculation loop
const oldLoop = `        for (const record of result.maintenanceRecords) {
          if (this.hasUpcomingReminder(result.vehicle, record, result.maintenanceRecords)) {
            upcomingServiceCount++;
          }
        }`;

const newLoop = `        for (const record of result.maintenanceRecords) {
          const statusObj = this.maintenanceService.computeMaintenanceStatus(record, result.vehicle.odometerKm, result.maintenanceRecords);
          if (statusObj.urgent) {
            upcomingServiceCount++;
            
            // Just grab the first urgent one for the dashboard card
            if (!this.urgentServiceAlert) {
              this.urgentServiceAlert = {
                title: record.title,
                text: statusObj.text,
                vehicle: \`\${result.vehicle.make} \${result.vehicle.model}\`,
                status: statusObj.status
              };
            }
          }
        }`;

content = content.replace(oldLoop, newLoop);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched urgent service (Angular)");
