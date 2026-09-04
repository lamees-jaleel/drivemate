const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/border-radius:\s*18px;/, 'border-radius: 50%;');
css = css.replace(/color:\s*#ffffff;/, 'color: #ffffff;\n  background: #f53543;\n  font-weight: 900;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Updated profile avatar");
