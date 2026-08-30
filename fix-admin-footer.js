const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /Your vehicle lifecycle, intelligently managed\./,
    'Secure platform administration and professional oversight.'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed Admin footer text");
