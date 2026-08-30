const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
    /\.nav-item\s*\{([\s\S]*?)width:\s*100%;/,
    '.nav-item {$1width: 100%;\n  font-size: 13.5px;\n  font-weight: 500;'
);
fs.writeFileSync(cssPath, css, 'utf8');
console.log("Fixed Portal Nav CSS correctly");
