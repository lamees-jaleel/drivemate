const fs = require('fs');
const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/expert-dashboard/expert-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Fix workspace-section
css = css.replace(
    /\.workspace-section\s*\{[\s\S]*?\}/,
    `.workspace-section {
  background: #0d0e12;
  border: 1px solid #202127;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
}`
);

// 2. Fix workspace-header
css = css.replace(
    /\.workspace-header\s*\{[\s\S]*?\}/,
    `.workspace-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #202127;
  padding-bottom: 20px;
}`
);

css = css.replace(
    /\.workspace-header h2\s*\{[\s\S]*?\}/,
    `.workspace-header h2 {
  font-size: 20px;
  letter-spacing: -0.5px;
  font-weight: 850;
  color: #ffffff;
  margin: 5px 0 0;
}`
);

css = css.replace(
    /\.workspace-header p\s*\{[\s\S]*?\}/,
    `.workspace-header p {
  font-size: 13px;
  color: #858893;
  margin: 10px 0 0;
}`
);

// 3. Fix workspace-card
css = css.replace(
    /\.workspace-card\s*\{[\s\S]*?\}/,
    `.workspace-card {
  padding: 24px;
  border: 1px solid #202127;
  border-radius: 16px;
  background: #0d0e12;
}`
);

// 4. Fix section-title typography
css = css.replace(
    /\.section-title p\s*\{[\s\S]*?\}/,
    `.section-title p {
  margin: 0;
  color: #f53543;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.7px;
  text-transform: uppercase;
}`
);

css = css.replace(
    /\.section-title h3\s*\{[\s\S]*?\}/,
    `.section-title h3 {
  margin: 5px 0 0;
  font-size: 20px;
  letter-spacing: -0.5px;
  font-weight: 850;
  color: #ffffff;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Done updating expert CSS");
