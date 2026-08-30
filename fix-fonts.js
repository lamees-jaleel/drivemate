const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/font-size:\s*6px/g, 'font-size: 10px');
css = css.replace(/font-size:\s*7px/g, 'font-size: 10px');
css = css.replace(/font-size:\s*8px/g, 'font-size: 11px');
css = css.replace(/font-size:\s*9px/g, 'font-size: 12px');
css = css.replace(/font-size:\s*10px/g, 'font-size: 12px');
// keep 11px and above mostly intact unless it's a small badge

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Bumped micro fonts in admin dashboard");
