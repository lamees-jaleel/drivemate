const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/\.workflow-item strong \{\s*font-size:\s*11px;\s*\}/s, '.workflow-item strong {\n  font-size: 15px;\n  color: #ffffff;\n}');
css = css.replace(/\.workflow-item p \{\s*margin:\s*6px 0 0;\s*color:\s*#71747d;\s*font-size:\s*9px;/s, '.workflow-item p {\n  margin: 6px 0 0;\n  color: #9396a0;\n  font-size: 13.5px;');
css = css.replace(/\.workflow-marker \{[^\}]*font-size:\s*7px;/s, match => match.replace('font-size: 7px;', 'font-size: 12px;'));

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Updated workflow typography");
