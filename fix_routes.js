const fs = require('fs');
const filePath = "c:/Drivemate/drivemate-backend/src/routes/maintenance.routes.ts";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(/export default router;[\s\S]*/, "");
content += `

/* =========================================================
   UPDATE MAINTENANCE RECORD
========================================================= */
router.put('/:recordId', updateMaintenanceRecord);

/* =========================================================
   DELETE MAINTENANCE RECORD
========================================================= */
router.delete('/:recordId', deleteMaintenanceRecord);

export default router;
`;

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed maintenance routes");
