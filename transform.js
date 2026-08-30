const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Drivemate/drivemate-frontend/src/app/pages';
const dashboards = ['expert', 'compliance', 'admin'];

const sidebarFooter = `
    <div class="sidebar-footer">
      <button class="logout-button" type="button" (click)="logout()">
        <span class="nav-icon">?</span> Sign Out
      </button>
      <p>
        DRIVEMATE
        <span>•</span>
        YOUR ROAD. REIMAGINED.
      </p>
    </div>
`;

for (const dash of dashboards) {
    const folder = path.join(baseDir, dash + '-dashboard');
    const htmlPath = path.join(folder, dash + '-dashboard.html');
    const cssPath = path.join(folder, dash + '-dashboard.css');
    
    if (!fs.existsSync(htmlPath)) continue;
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    html = html.replace(/<div class="sidebar-nav"[^>]*margin-top:\s*auto[^>]*>[\s\S]*?<\/div>/, sidebarFooter);
    html = html.replace(/<div class="sidebar-bottom">[\s\S]*?<\/div>/, sidebarFooter);
    
    html = html.replace('<main class="dashboard-main">', '<main class="main-area">');
    
    const roleLabel = dash.toUpperCase() + " PORTAL";
    const topbarRegex = /<section class="topbar">[\s\S]*?<\/section>/;
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
    html = html.replace(topbarRegex, topbarReplacement);
    
    html = html.replace(/<section class="hero">/g, '<section class="welcome-section">');
    html = html.replace(/<div class="hero-copy">/g, '<div>');
    html = html.replace(/class="hero-description"/g, 'class="welcome-copy"');
    
    html = html.replace('</main>', '  </div>\n  </main>');
    
    fs.writeFileSync(htmlPath, html, 'utf8');
    
    const css = fs.readFileSync(cssPath, 'utf8');
    let splitIdx = -1;
    
    if (dash === 'expert') {
        splitIdx = css.indexOf('.compliance-visual');
        if (splitIdx === -1) splitIdx = css.indexOf('.scanner-card');
        if (splitIdx === -1) splitIdx = css.indexOf('.expert-requests-list');
    } else if (dash === 'compliance') {
        splitIdx = css.indexOf('.shield-card');
        if (splitIdx === -1) splitIdx = css.indexOf('.compliance-visual');
        if (splitIdx === -1) splitIdx = css.indexOf('/* =========================================================\n   COMPLIANCE STATS');
    } else if (dash === 'admin') {
        splitIdx = css.indexOf('.admin-table');
        if (splitIdx === -1) splitIdx = css.indexOf('/* =========================================================\n   ADMIN DASHBOARD SPECIFIC');
    }
    
    if (splitIdx !== -1) {
        const newCss = "@import '../../shared/styles/portal-layout.css';\n\n" + css.substring(splitIdx);
        fs.writeFileSync(cssPath, newCss, 'utf8');
    } else {
        console.log("Could not find split index for " + dash);
    }
}
console.log("Done");
