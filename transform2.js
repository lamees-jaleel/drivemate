const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Drivemate/drivemate-frontend/src/app/pages';
const dashboards = ['expert', 'compliance', 'admin'];

const sidebarFooter = `
    <div class="sidebar-footer">
      <button class="logout-button" type="button" (click)="logout()">
        ? Sign Out
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
    
    // Replace sidebar footer
    const asideEndIdx = html.indexOf('</aside>');
    const navEndIdx = html.lastIndexOf('</nav>', asideEndIdx);
    
    if (navEndIdx !== -1 && asideEndIdx !== -1) {
        html = html.substring(0, navEndIdx + 6) + '\n' + sidebarFooter + '\n  ' + html.substring(asideEndIdx);
    }
    
    // Main wrapper
    html = html.replace('<main class="dashboard-main">', '<main class="main-area">');
    
    // Topbar
    const roleLabel = dash.toUpperCase() + " PORTAL";
    const topbarStart = html.indexOf('<section class="topbar">');
    if (topbarStart === -1) {
        const topbarHeaderStart = html.indexOf('<header class="topbar">');
        console.log(dash, "topbar header found?", topbarHeaderStart !== -1);
    } else {
        const topbarEnd = html.indexOf('</section>', topbarStart) + 10;
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
    
    // Hero -> Welcome
    html = html.replace(/<section class="hero">/g, '<section class="welcome-section">');
    html = html.replace(/<div class="hero-copy">/g, '<div>');
    html = html.replace(/class="hero-description"/g, 'class="welcome-copy"');
    
    // Append </div> before </main>
    html = html.replace('</main>', '  </div>\n  </main>');
    
    fs.writeFileSync(htmlPath, html, 'utf8');
    
    // CSS
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
        splitIdx = css.indexOf('.admin-visual');
        if (splitIdx === -1) splitIdx = css.indexOf('.admin-table');
        if (splitIdx === -1) splitIdx = css.indexOf('/* =========================================================\n   ADMIN DASHBOARD SPECIFIC');
    }
    
    if (splitIdx !== -1) {
        // preserve specific block
        const newCss = "@import '../../shared/styles/portal-layout.css';\n\n" + css.substring(splitIdx);
        fs.writeFileSync(cssPath, newCss, 'utf8');
    } else {
        console.log("Could not find split index for " + dash);
    }
}
console.log("Done");
