const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

const match = css.match(/\.topbar\s*\{[\s\S]*?\}/);
console.log(match ? match[0] : "Not found");
