const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<section class="dashboard-grid"[^>]*>/, '<section class="workspace-grid">');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Restored workspace-grid");
