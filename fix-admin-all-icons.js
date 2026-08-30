const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Sidebar Nav Icons
html = html.replace(/<span class="nav-icon">\??<\/span>\s*Professional Verification/, '<span class="nav-icon">\u25C8</span>\n        Professional Verification');
html = html.replace(/<span class="nav-icon">\??<\/span>\s*User Management/, '<span class="nav-icon">\u25CE</span>\n        User Management');
html = html.replace(/<span class="nav-icon">\??<\/span>\s*System Reports/, '<span class="nav-icon">\u25A4</span>\n        System Reports');

// 2. Menu button topbar
html = html.replace(/<button class="menu-button" type="button" \(click\)="toggleSidebar\(\)">\??<\/button>/, '<button class="menu-button" type="button" (click)="toggleSidebar()">\u2630</button>');

// 3. Menu button mobile header
html = html.replace(/<button\s*class="menu-button"\s*type="button"\s*\(click\)="toggleSidebar\(\)">\s*\?\??\s*<\/button>/, `<button
      class="menu-button"
      type="button"
      (click)="toggleSidebar()">

      \u2630

    </button>`);

// 4. Admin visual
html = html.replace(/<div class="admin-visual"><span>\??<\/span>/, '<div class="admin-visual"><span>\u25C8</span>');

// 5. Stat cards (App stats)
// Since they might be ?? or ?, we can target them by the stat-label right below them
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">PENDING<\/span>/, '<span class="stat-icon">\u25EF</span>\n            <span class="stat-label">PENDING</span>');
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">APPROVED<\/span>/, '<span class="stat-icon">\u2713</span>\n            <span class="stat-label">APPROVED</span>');
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">REJECTED<\/span>/, '<span class="stat-icon">\u2715</span>\n            <span class="stat-label">REJECTED</span>');
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">ALL<\/span>/, '<span class="stat-icon">\u25A4</span>\n            <span class="stat-label">ALL</span>');

// 6. Stat cards (Report stats)
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">TOTAL VEHICLES<\/span>/, '<span class="stat-icon">\u25C7</span>\n                <span class="stat-label">TOTAL VEHICLES</span>');
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">MAINTENANCE<\/span>/, '<span class="stat-icon">\u2699</span>\n                <span class="stat-label">MAINTENANCE</span>');
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">EXPENSES<\/span>/, '<span class="stat-icon">\u25A4</span>\n                <span class="stat-label">EXPENSES</span>');
html = html.replace(/<span class="stat-icon">\??\??<\/span>\s*<span class="stat-label">EXPENSES SUM<\/span>/, '<span class="stat-icon">\u20B9</span>\n                <span class="stat-label">EXPENSES SUM</span>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed all ? icons in admin");
