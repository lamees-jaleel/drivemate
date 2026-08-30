const fs = require('fs');

const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/\.application-card\s*\{[\s\S]*?\}/, `.application-card {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 16px;
  padding: 24px;
  border: 1px solid #202127;
  border-radius: 16px;
  background: #0d0e12;
}`);

css = css.replace(/\.admin-visual\s*\{[\s\S]*?\}/, `.admin-visual {
  min-width: 205px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid #202127;
  border-radius: 16px;
  background: #0d0e12;
}`);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Done application-card");
