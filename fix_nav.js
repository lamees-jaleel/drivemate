const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<button[^>]*>\s*<span class="nav-icon">.*?<\/span>\s*<span>Profile & Verification<\/span>\s*<\/button>/, '<div class="nav-divider"></div>\n\n        $&');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Added nav-divider");
