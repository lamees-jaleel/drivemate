const fs = require('fs');

let css = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', 'utf8');

// 1. Fix .dashboard-shell
css = css.replace(/\.dashboard-shell \{[\s\S]*?\}/, '.dashboard-shell {\n  min-height: 100vh;\n  display: flex;\n  background: radial-gradient(circle at 70% 10%, rgba(245, 53, 67, 0.03) 0%, transparent 40%), #07080b;\n}');

// 2. Fix .dashboard-main
css = css.replace(/\.dashboard-main \{[\s\S]*?\}/, '.dashboard-main {\n  width: calc(100% - 270px);\n  min-height: 100vh;\n  margin-left: 270px;\n  padding: 0 46px 45px;\n}');

// 3. Fix media queries to handle the collapse cleanly
// We find all instances of margin-left: 0; or margin-left: 260px; and replace them with the 270px logic
css = css.replace(/margin-left:\s*260px;/g, 'margin-left: 270px;');
css = css.replace(/\.dashboard-main \{\s*margin-left:\s*0;/g, '.dashboard-main {\n      width: 100%;\n      margin-left: 0;');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', css, 'utf8');
console.log('Layout fixed');
