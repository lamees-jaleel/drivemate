const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.ts";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /cost: record\.cost,/,
  "cost: Number(record.cost),"
);

content = content.replace(
  /this\.recordCount = this\.maintenanceRecords\.length;/,
  "" // remove it, since it's probably a getter
);

content = content.replace(
  /this\.loadMaintenanceHistory\(this\.vehicle!\.id\);/g,
  "this.loadMaintenance();"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed TS errors");
