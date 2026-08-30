const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/expert-dashboard/expert-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<span class="stat-icon">\s*\?\s*<\/span>\s*<span class="stat-label">REQUESTS<\/span>/, '<span class="stat-icon">\u25C9</span>\n          <span class="stat-label">REQUESTS</span>');
html = html.replace(/<span class="stat-icon">\s*\?\s*<\/span>\s*<span class="stat-label">ACCEPTED<\/span>/, '<span class="stat-icon">\u2713</span>\n          <span class="stat-label">ACCEPTED</span>');
html = html.replace(/<span class="stat-icon">\s*\?\s*<\/span>\s*<span class="stat-label">ACTIVE<\/span>/, '<span class="stat-icon">\u2699</span>\n          <span class="stat-label">ACTIVE</span>');
html = html.replace(/<span class="stat-icon">\s*\?\s*<\/span>\s*<span class="stat-label">REPORTS<\/span>/, '<span class="stat-icon">\u25A4</span>\n          <span class="stat-label">REPORTS</span>');

html = html.replace(/<div class="diagnostic-visual">/, '<div class="diagnostic-visual" style="transform: scale(0.8); transform-origin: right center;">');

html = html.replace(/<small style="margin-left: auto;">\s*SOON\s*<\/small>/, '<small class="badge-soon" style="margin-left: auto;">SOON</small>');

const newFooter = `<footer class="dashboard-footer">
      <p>© 2026 DriveMate. Your vehicle lifecycle, intelligently managed.</p>
      <span>AUTOMOTIVE DIAGNOSTIC EXPERT PORTAL</span>
    </footer>`;
html = html.replace(/<footer class="dashboard-footer">[\s\S]*?<\/footer>/, newFooter);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("HTML fixed");
