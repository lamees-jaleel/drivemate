const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\compliance-dashboard\\compliance-dashboard.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace workspace-grid
css = css.replace(/grid-template-columns:\s*minmax\(0,\s*1\.7fr\)\s*minmax\(280px,\s*0\.8fr\);/s, 'grid-template-columns: 2fr 1fr;');
css = css.replace(/gap:\s*15px;/s, 'gap: 20px;');

// Add secondary-button
const secondaryBtnCSS = `
/* =========================================================
   BUTTONS
========================================================= */
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 15px;
  border: 1px solid #282930;
  border-radius: 8px;
  color: #b6b8bf;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  color: #ffffff;
  border-color: #454750;
  background: #14151a;
}
`;

css += '\n' + secondaryBtnCSS;

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Updated workspace-grid and added secondary-button to CSS");
