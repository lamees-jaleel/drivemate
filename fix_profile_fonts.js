const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/\.profile-role \{[^}]*font-size:\s*8px;/s, match => match.replace('font-size: 8px;', 'font-size: 13.5px;'));
css = css.replace(/\.profile-info span \{[^}]*font-size:\s*6px;/s, match => match.replace('font-size: 6px;', 'font-size: 11px;'));
css = css.replace(/\.profile-info strong \{[^}]*font-size:\s*9px;/s, match => match.replace('font-size: 9px;', 'font-size: 14px;'));
css = css.replace(/\.verification-note strong \{[^}]*font-size:\s*8px;/s, match => match.replace('font-size: 8px;', 'font-size: 14px;'));
css = css.replace(/\.verification-note p \{[^}]*font-size:\s*7px;/s, match => match.replace('font-size: 7px;', 'font-size: 12.5px;'));

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Updated profile font sizes");
