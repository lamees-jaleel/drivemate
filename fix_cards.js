const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace workspace-grid and workspace-card
html = html.replace(/<section class="workspace-grid">/, '<section class="dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px;">');
html = html.replace(/<article class="workspace-card">/g, '<article class="dashboard-card">');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Updated workspace grid and cards");
