const fs = require('fs');
const tsPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.ts';
let ts = fs.readFileSync(tsPath, 'utf8');

ts = ts.replace(
    /if \(moduleName === 'Documents'\)/,
    "if (moduleName === 'Documents' || moduleName === 'Documents & Compliance')"
);

fs.writeFileSync(tsPath, ts, 'utf8');
console.log("TS fixed");
