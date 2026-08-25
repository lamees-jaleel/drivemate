const fs = require('fs');

let ownerCss = fs.readFileSync('src/app/pages/owner-dashboard/owner-dashboard.css', 'utf8');
let expertCss = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', 'utf8');

// Extract the entire SIDEBAR section from ownerCss
let sidebarStart = ownerCss.indexOf('/* =========================================================\r\n   SIDEBAR');
if (sidebarStart === -1) sidebarStart = ownerCss.indexOf('/* =========================================================\n   SIDEBAR');
let mainStart = ownerCss.indexOf('/* =========================================================\r\n   MAIN AREA');
if (mainStart === -1) mainStart = ownerCss.indexOf('/* =========================================================\n   MAIN AREA');

if (sidebarStart !== -1 && mainStart !== -1) {
  let ownerSidebarSection = ownerCss.substring(sidebarStart, mainStart);
  
  // In expertCss, find where SIDEBAR starts and MAIN starts
  let exSidebarStart = expertCss.indexOf('/* =========================================================\r\n   SIDEBAR');
  if (exSidebarStart === -1) exSidebarStart = expertCss.indexOf('/* =========================================================\n   SIDEBAR');
  let exMainStart = expertCss.indexOf('/* =========================================================\r\n   MAIN');
  if (exMainStart === -1) exMainStart = expertCss.indexOf('/* =========================================================\n   MAIN');
  
  if (exSidebarStart !== -1 && exMainStart !== -1) {
    // Replace expert sidebar section with owner sidebar section
    expertCss = expertCss.substring(0, exSidebarStart) + ownerSidebarSection + expertCss.substring(exMainStart);
    fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.css', expertCss, 'utf8');
    console.log('Successfully aligned sidebar CSS.');
  } else {
    console.log('Could not find expert sidebar or main bounds');
  }
} else {
  console.log('Could not find owner sidebar or main bounds');
}
