const fs = require('fs');

const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// App stat cards
html = html.replace(/<span class="stat-icon">??<\/span>/, '<span class="stat-icon">\u25EF</span>'); // ?
html = html.replace(/<span class="stat-icon">?<\/span>/, '<span class="stat-icon">\u2713</span>');  // ?
html = html.replace(/<span class="stat-icon">?<\/span>/, '<span class="stat-icon">\u2715</span>');  // ?
html = html.replace(/<span class="stat-icon">??<\/span>/, '<span class="stat-icon">\u25A4</span>');  // ?

// Report stat cards
html = html.replace(/<span class="stat-icon">??<\/span>/, '<span class="stat-icon">\u25C7</span>'); // ?
html = html.replace(/<span class="stat-icon">??<\/span>/, '<span class="stat-icon">\u2699</span>'); // ?
html = html.replace(/<span class="stat-icon">??<\/span>/, '<span class="stat-icon">\u25A4</span>'); // ?
html = html.replace(/<span class="stat-icon">??<\/span>/, '<span class="stat-icon">\u20B9</span>'); // ?

// Also replace the ?? or  icons if any exist in the sidebar or elsewhere
// In the previous step I fixed the nav icons but let me double check just in case.

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Replaced emojis with geometric unicode");
