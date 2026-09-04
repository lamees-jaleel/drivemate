const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-backend/src/routes/maintenance.routes.ts";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /getMaintenanceRecords\n} from '\.\.\/controllers\/maintenance\.controller\.js';/,
  "getMaintenanceRecords,\n  updateMaintenanceRecord,\n  deleteMaintenanceRecord\n} from '../controllers/maintenance.controller.js';"
);

content += `

/* =========================================================
   UPDATE MAINTENANCE RECORD
========================================================= */
router.put('/:recordId', updateMaintenanceRecord);

/* =========================================================
   DELETE MAINTENANCE RECORD
========================================================= */
router.delete('/:recordId', deleteMaintenanceRecord);

`;

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched maintenance routes");
