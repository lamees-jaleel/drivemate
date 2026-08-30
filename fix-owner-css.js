const fs = require('fs');

const ownerCssPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.css';
let ownerCss = fs.readFileSync(ownerCssPath, 'utf8');

ownerCss = ownerCss.replace(/\.dashboard-footer\s*\{[\s\S]*?\}/g, '');
ownerCss = ownerCss.replace(/\.dashboard-footer p\s*\{[\s\S]*?\}/g, '');
ownerCss = ownerCss.replace(/\.dashboard-footer span\s*\{[\s\S]*?\}/g, '');

fs.writeFileSync(ownerCssPath, ownerCss, 'utf8');

const portalCssPath = 'c:/Drivemate/drivemate-frontend/src/app/shared/styles/portal-layout.css';
let portalCss = fs.readFileSync(portalCssPath, 'utf8');

if (!portalCss.includes('@media (max-width: 900px) { .dashboard-footer')) {
    portalCss += `
@media (max-width: 900px) {
  .dashboard-footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 20px 0;
  }
}
`;
}
fs.writeFileSync(portalCssPath, portalCss, 'utf8');

console.log("Owner CSS fixed");
