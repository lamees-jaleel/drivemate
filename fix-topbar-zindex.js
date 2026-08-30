const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
    /background:\s*rgba\(\s*7,\s*8,\s*11,\s*0\.95\s*\);\s*backdrop-filter:\s*blur\(16px\);/,
    'background: #07080b; /* Solid background as requested */\n  z-index: 90; /* increased z-index */'
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Fixed topbar CSS");
