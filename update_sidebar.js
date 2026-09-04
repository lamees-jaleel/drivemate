const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the sidebar-top and role-badge with the correct structure
const newSidebarTop = `    <div class="sidebar-top">
      <a class="brand" (click)="switchTab('DASHBOARD')">
        <span class="brand-drive">Drive</span><span class="brand-mate">Mate</span>
      </a>
      <button class="sidebar-close" type="button" aria-label="Close Sidebar" (click)="closeSidebar()">×</button>
    </div>

    <div class="owner-mini-profile">
      <div class="avatar">
        {{ currentUser?.fullName?.charAt(0)?.toUpperCase() || 'C' }}
      </div>
      <div class="owner-mini-info">
        <strong>{{ currentUser?.fullName || 'Compliance Advisor' }}</strong>
        <span>COMPLIANCE ADVISOR</span>
      </div>
    </div>`;

// Find the start of sidebar-top
const startIdx = html.indexOf('<div class="sidebar-top">');
const endIdx = html.indexOf('</div>', html.indexOf('COMPLIANCE ADVISOR', startIdx)) + 6;

if (startIdx !== -1 && endIdx !== -1) {
  // wait, the role-badge has two closing divs after it?
  // let's just use regex to replace the whole block up to <nav class="navigation">
  const navIdx = html.indexOf('<nav class="navigation">');
  if (navIdx !== -1) {
    html = html.substring(0, startIdx) + newSidebarTop + '\n\n    ' + html.substring(navIdx);
  }
}

// Also change <nav class="navigation"> to <nav class="sidebar-nav">
html = html.replace('<nav class="navigation">', '<nav class="sidebar-nav">');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Updated HTML sidebar structure");
