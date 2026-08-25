const fs = require('fs');
let css = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', 'utf8');

css = css.replace(/clamp\([\s\S]*?\)/, 'clamp(34px, 4vw, 56px)');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', css, 'utf8');
