const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-backend/src/routes/maintenance.routes.ts";
let content = fs.readFileSync(filePath, "utf8");

const importStr = "import {\n  updateMaintenanceRecord,\n  deleteMaintenanceRecord\n} from '../controllers/maintenance.controller.js';\n";

if (!content.includes('updateMaintenanceRecord,')) {
    content = importStr + content;
    fs.writeFileSync(filePath, content, "utf8");
}
console.log("Forced imports in routes");
