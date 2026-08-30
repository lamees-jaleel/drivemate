const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">[\s\S]*?<\/span>\s*<span class="stat-label">\s*MY VEHICLES\s*<\/span>/,
    '<button class="stat-card" type="button" (click)="openModule(\'My Vehicles\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ? </span>\n            <span class="stat-label"> MY VEHICLES </span>'
);

html = html.replace(
    /<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">[\s\S]*?<\/span>\s*<span class="stat-label">\s*UPCOMING SERVICES\s*<\/span>/,
    '<button class="stat-card" type="button" (click)="openModule(\'Maintenance\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ? </span>\n            <span class="stat-label"> UPCOMING SERVICES </span>'
);

html = html.replace(
    /<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">[\s\S]*?<\/span>\s*<span class="stat-label">\s*MONTHLY EXPENSES\s*<\/span>/,
    '<button class="stat-card" type="button" (click)="openModule(\'Expenses\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ? </span>\n            <span class="stat-label"> MONTHLY EXPENSES </span>'
);

// The fourth one is already matched, but let's double check.

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed missing clicks");
