const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

const marker = '/* =========================================================\r\n   SIDEBAR LAYOUT FIXES';
const idx = css.indexOf(marker);
if (idx !== -1) {
  css = css.substring(0, idx);
} else {
    const marker2 = '/* =========================================================\n   SIDEBAR LAYOUT FIXES';
    const idx2 = css.indexOf(marker2);
    if (idx2 !== -1) css = css.substring(0, idx2);
}
fs.writeFileSync(cssPath, css, 'utf8');
console.log("Removed custom sidebar CSS");
