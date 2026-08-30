const fs = require('fs');

const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<span class="nav-icon">.*?<\/span>\s*Professional Verification/, '<span class="nav-icon">?</span>\n\n        Professional Verification');
html = html.replace(/<span class="nav-icon">.*?<\/span>\s*User Management/, '<span class="nav-icon">?</span>\n\n        User Management');
html = html.replace(/<span class="nav-icon">.*?<\/span>\s*System Reports/, '<span class="nav-icon">?</span>\n\n        System Reports');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed icons");
