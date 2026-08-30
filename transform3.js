const fs = require('fs');
const path = require('path');

const dash = 'admin';
const baseDir = 'c:/Drivemate/drivemate-frontend/src/app/pages';
const folder = path.join(baseDir, dash + '-dashboard');
const htmlPath = path.join(folder, dash + '-dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const roleLabel = "ADMIN PORTAL";
const topbarStart = html.indexOf('<header class="topbar">');
if (topbarStart !== -1) {
    const topbarEnd = html.indexOf('</header>', topbarStart) + 9;
    const topbarReplacement = `
<header class="topbar">
  <div class="topbar-left">
    <button class="menu-button" type="button" (click)="toggleSidebar()">?</button>
    <div>
      <p class="topbar-label">${roleLabel}</p>
      <h1>Dashboard</h1>
    </div>
  </div>
  <div class="topbar-right">
    <button class="notification-button" type="button">??</button>
    <div class="topbar-user">
      <div class="topbar-avatar">
        {{ firstName.charAt(0).toUpperCase() }}
      </div>
      <div class="topbar-user-text">
        <strong>{{ currentUser?.fullName }}</strong>
        <span>{{ currentUser?.email }}</span>
      </div>
    </div>
  </div>
</header>
<div class="dashboard-content">
`;
    html = html.substring(0, topbarStart) + topbarReplacement + html.substring(topbarEnd);
}

// Hero -> Welcome (for admin it has <p class="hero-text">)
html = html.replace(/<section class="hero">/g, '<section class="welcome-section">');
html = html.replace(/<div class="hero-copy">/g, '<div>');
html = html.replace(/class="hero-text"/g, 'class="welcome-copy"');

fs.writeFileSync(htmlPath, html, 'utf8');
