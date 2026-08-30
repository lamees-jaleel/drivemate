const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/<strong>.*?0\s*<\/strong>/g, '<strong> \u20B9{{ monthlyExpense | number }} </strong>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed owner expense zero");
