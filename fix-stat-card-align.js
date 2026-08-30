const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
    /\.stat-card\s*\{([\s\S]*?)display:\s*flex;([\s\S]*?)\}/,
    '.stat-card {$1display: flex;$2\n  align-items: flex-start;\n  justify-content: flex-start;\n}'
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Fixed Stat Card Flex Alignment");
