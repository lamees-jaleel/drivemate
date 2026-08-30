const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/admin-dashboard/admin-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/\? Sign Out/, '\u2197 Sign Out');

fs.writeFileSync(htmlPath, html, 'utf8');

const expertPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/expert-dashboard/expert-dashboard.html';
let expertHtml = fs.readFileSync(expertPath, 'utf8');
expertHtml = expertHtml.replace(/\? Sign Out/, '\u2197 Sign Out');
fs.writeFileSync(expertPath, expertHtml, 'utf8');

const compPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/compliance-dashboard/compliance-dashboard.html';
let compHtml = fs.readFileSync(compPath, 'utf8');
compHtml = compHtml.replace(/\? Sign Out/, '\u2197 Sign Out');
fs.writeFileSync(compPath, compHtml, 'utf8');

console.log("Fixed Sign Out everywhere");
