const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<footer class="dashboard-footer">[\s\S]*?<\/footer>/, '');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Removed Admin footer");
