const fs = require('fs');

const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /(<span class="nav-icon">[\s\S]*?<\/span>)\s*Professional Verification/g,
    '$1\n        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">Professional Verification</span>'
);

html = html.replace(
    /(<span class="nav-icon">[\s\S]*?<\/span>)\s*User Management/g,
    '$1\n        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">User Management</span>'
);

html = html.replace(
    /(<span class="nav-icon">[\s\S]*?<\/span>)\s*System Reports/g,
    '$1\n        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">System Reports</span>'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed Admin Nav wrap");
