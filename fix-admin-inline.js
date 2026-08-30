const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /padding: 20px; border-radius: 12px;/g,
    'padding: 24px; border-radius: 16px;'
);

html = html.replace(
    /font-size: 16px;/g,
    'font-size: 20px; font-weight: 850; letter-spacing: -0.5px;'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Done inline");
