const fs = require('fs');
let html = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', 'utf8');

// Use sidebar-nav
html = html.replace(/<nav class="navigation">/g, '<nav class="sidebar-nav">');

// Remove spans around text in nav-item
html = html.replace(/<span>\s*(Dashboard)\s*<\/span>/g, '');
html = html.replace(/<span>\s*(Available Requests)\s*<\/span>/g, '');
html = html.replace(/<span>\s*(Active Cases)\s*<\/span>/g, '');
html = html.replace(/<span>\s*(Completed Reports)\s*<\/span>/g, '');
html = html.replace(/<span>\s*(Profile & Verification)\s*<\/span>/g, '');

// Change role-badge to just use owner-mini-profile style
html = html.replace(/<div class="sidebar-bottom">[\s\S]*?<\/div>\s*<\/aside>/, '</aside>');

let newProfile = \
    <div class="owner-mini-profile">
      <div class="avatar">
        {{ firstName.charAt(0).toUpperCase() }}
      </div>
      <div class="owner-mini-info">
        <strong>{{ currentUser?.fullName || 'Diagnostic Expert' }}</strong>
        <span>EXPERT PORTAL</span>
      </div>
    </div>
    <div class="sidebar-nav" style="margin-top: auto; padding-bottom: 20px;">
      <button class="nav-item" type="button" (click)="logout()">
        <span class="nav-icon"> ? </span>
        Sign Out
      </button>
    </div>
\;

html = html.replace(/<nav class="sidebar-nav">/, newProfile + '\\n    <nav class="sidebar-nav">');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.html', html, 'utf8');
console.log('Successfully aligned HTML.');
