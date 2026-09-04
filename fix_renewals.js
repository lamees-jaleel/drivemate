const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/renewalRequests/g, 'renewals');
// but wait, I just added `@if (renewalRequestsOpen)`. Let's change that back to renewalRequestsOpen!
html = html.replace(/renewalsOpen/g, 'renewalRequestsOpen');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed renewals property in HTML");
