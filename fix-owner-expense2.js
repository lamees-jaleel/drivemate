const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// fix the bad encoding character for expense stat-value
html = html.replace(/<div class="stat-value expense">.*?{{ monthlyExpense }}<\/div>/, '<div class="stat-value expense">\u20B9{{ monthlyExpense }}</div>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed expense format");
