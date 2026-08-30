const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">(Professional Verification|User Management|System Reports)<\/span>/g,
    '<span style="white-space: nowrap; flex: 1; text-align: left; font-size: 13px; letter-spacing: -0.1px;">$1</span>'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed Admin Nav text wrapping");
