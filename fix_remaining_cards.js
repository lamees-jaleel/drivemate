const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<article class="workspace-card profile-card">/g, '<article class="dashboard-card">');
// Also check for any other workspace-card
html = html.replace(/<section class="workspace-card"/g, '<section class="dashboard-card"');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Updated remaining workspace cards");
