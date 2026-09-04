const fs = require('fs');
const filePath = "c:/Drivemate/drivemate-backend/src/controllers/maintenance.controller.ts";
let content = fs.readFileSync(filePath, "utf8");

// Fix findMany in getMaintenanceRecords
content = content.replace(
    /findMany\(\{\s*where:\s*\{\s*vehicleId\s*\},/g,
    "findMany({\n\n          where: {\n\n            vehicleId,\n            isDeleted: false\n          },"
);

// Fix findFirst in getMaintenanceRecordById
// Currently it might be:
// findFirst({
//   where: {
//     id: recordId,
//     vehicleId
//   },
content = content.replace(
    /findFirst\(\{\s*where:\s*\{\s*id:\s*recordId,\s*vehicleId\s*\},/g,
    "findFirst({\n\n          where: {\n\n            id:\n              recordId,\n\n            vehicleId,\n            isDeleted: false\n          },"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed GET queries");
