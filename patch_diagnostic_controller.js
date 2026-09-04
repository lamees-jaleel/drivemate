const fs = require('fs');
const filePath = "c:/Drivemate/drivemate-backend/src/controllers/diagnostic.controller.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add odometer validation
const validationLogic = `
    if (odometerKm !== undefined && odometerKm !== null) {
      if (Number(odometerKm) < vehicle.odometerKm) {
        res.status(400).json({ success: false, message: \`Odometer reading cannot be lower than the vehicle's current reading of \${vehicle.odometerKm} km.\` });
        return;
      }
    }
`;

// Insert after vehicle check
content = content.replace(
  /if \(!vehicle\) {\s*res\.status\(404\)\.json\(\{\s*success: false,\s*message: 'Vehicle not found\.'\s*\}\);\s*return;\s*}/,
  "if (!vehicle) {\n      res.status(404).json({\n        success: false,\n        message: 'Vehicle not found.'\n      });\n      return;\n    }\n" + validationLogic
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched diagnostic controller");
