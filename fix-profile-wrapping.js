const fs = require('fs');

const cssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
    /\.owner-mini-info span\s*\{[\s\S]*?\}/,
    `.owner-mini-info span {
  color: #858893;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Fixed wrapping");
