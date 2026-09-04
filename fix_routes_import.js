const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-backend/src/routes/maintenance.routes.ts";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /getMaintenanceRecords\n} from '\.\.\/controllers\/maintenance\.controller\.js';/,
  "getMaintenanceRecords,\n  updateMaintenanceRecord,\n  deleteMaintenanceRecord\n} from '../controllers/maintenance.controller.js';"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed imports in routes");
