const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /<button class="stat-card" type="button" \(click\)="openModule\('My Vehicles'\)">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*\?\s*<\/span>/,
    '<button class="stat-card" type="button" (click)="openModule(\'My Vehicles\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> \u25C7 </span>'
);

html = html.replace(
    /<button class="stat-card" type="button" \(click\)="openModule\('Maintenance'\)">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*\?\s*<\/span>/,
    '<button class="stat-card" type="button" (click)="openModule(\'Maintenance\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> \u2699 </span>'
);

html = html.replace(
    /<button class="stat-card" type="button" \(click\)="openModule\('Expenses'\)">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*\?\s*<\/span>/,
    '<button class="stat-card" type="button" (click)="openModule(\'Expenses\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> \u20B9 </span>'
);

// also fix the ? in the monthly expenses stat-value
html = html.replace(/<div class="stat-value expense">\?\??{{ monthlyExpense }}<\/div>/g, '<div class="stat-value expense">\u20B9{{ monthlyExpense }}</div>');
html = html.replace(/<div class="stat-value expense">\?\?,1{{ monthlyExpense }}<\/div>/g, '<div class="stat-value expense">\u20B9{{ monthlyExpense }}</div>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed owner icons");
