const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

const regex = /(\.shield-card\b[^}]*})/g;
let match;
while ((match = regex.exec(css)) !== null) {
  console.log(match[0]);
}
