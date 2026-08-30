const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
    /\.stat-card\s*\{([\s\S]*?)\}/,
    '.stat-card {$1\n  display: flex;\n  flex-direction: column;\n  text-align: left;\n  cursor: pointer;\n  width: 100%;\n}'
);

// Also remove cursor: pointer if we want to be clean, but button naturally has cursor default, actually we want cursor pointer for the button.

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Fixed Stat Card Alignment");
