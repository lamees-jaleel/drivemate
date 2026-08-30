const fs = require('fs');

const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('font-size: 13px;') && css.includes('.nav-item {\\n    width: 100%;')) {
    css = css.replace(
        /\.nav-item\s*\{/,
        '.nav-item {\n  font-size: 13px;\n  font-weight: 500;'
    );
    fs.writeFileSync(cssPath, css, 'utf8');
}

console.log("Fixed Portal Nav CSS");
