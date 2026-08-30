const fs = require('fs');

const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Remove summary-grid and summary-card
css = css.replace(/\.summary-grid\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.summary-card\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.summary-card:hover,[\s\S]*?\{[\s\S]*?\}/g, '');
css = css.replace(/\.summary-card > span\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.summary-card strong\s*\{[\s\S]*?\}/g, '');
css = css.replace(/\.summary-card small\s*\{[\s\S]*?\}/g, '');

// Update button styles
css = css.replace(
    /\.reject-button,\s*\.confirm-reject-button,\s*\.secondary-button\s*\{[\s\S]*?\}/,
    `.reject-button,
.confirm-reject-button,
.secondary-button {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Done CSS");
