const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

const lines = css.split('\n');
let inside = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.sidebar {') || lines[i].includes('.sidebar-top {') || lines[i].includes('.brand {') || lines[i].includes('.role-badge {') || lines[i].includes('.navigation {') || lines[i].includes('.nav-item {')) {
    console.log(`--- Line ${i} ---`);
    for(let j=i; j<i+15; j++) {
      if(lines[j]) console.log(lines[j].trim());
    }
  }
}
