const fs = require('fs');

const portalCssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let portalCss = fs.readFileSync(portalCssPath, 'utf8');

// 1. Update hero tags
portalCss = portalCss.replace(
    /\.hero-tags span\s*\{[\s\S]*?\}/,
    `.hero-tags span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  line-height: 1;
  padding: 0 10px;
  border: 1px solid #292b32;
  border-radius: 6px;
  color: #878a93;
  background: #0b0c10;
  font-size: 11px;
  font-weight: 800;
}`
);

// 2. Add badge-soon
if (!portalCss.includes('.badge-soon')) {
    portalCss += `\n
/* =========================================================
   BADGES
========================================================= */
.badge-soon {
  background: rgba(255, 255, 255, 0.05);
  color: #858893;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.5px;
  border: 1px solid #202127;
}\n`;
}

// 3. Add dashboard-footer
if (!portalCss.includes('.dashboard-footer')) {
    portalCss += `\n
/* =========================================================
   DASHBOARD FOOTER
========================================================= */
.dashboard-footer {
  min-height: 85px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid #1c1d24;
  margin-top: 40px;
}
.dashboard-footer p {
  margin: 0;
  color: #656872;
  font-size: 10px;
}
.dashboard-footer span {
  color: #656872;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.3px;
}\n`;
}

fs.writeFileSync(portalCssPath, portalCss, 'utf8');
console.log("Portal CSS updated");
