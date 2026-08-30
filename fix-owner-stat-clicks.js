const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// The file currently has:
// <button class="stat-card" type="button">
//           <div class="stat-card-top">
//             <span class="stat-icon"> ? </span>
//             <span class="stat-label"> MY VEHICLES </span>

html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">[\s\S]*?<\/span>\s*<span class="stat-label">\s*MY VEHICLES\s*<\/span>/, 
    '<button class="stat-card" type="button" (click)="openModule(\'My Vehicles\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> \u25C7 </span>\n            <span class="stat-label"> MY VEHICLES </span>'
);

html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">[\s\S]*?<\/span>\s*<span class="stat-label">\s*UPCOMING SERVICES\s*<\/span>/, 
    '<button class="stat-card" type="button" (click)="openModule(\'Maintenance\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> \u2699 </span>\n            <span class="stat-label"> UPCOMING SERVICES </span>'
);

html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">[\s\S]*?<\/span>\s*<span class="stat-label">\s*MONTHLY EXPENSES\s*<\/span>/, 
    '<button class="stat-card" type="button" (click)="openModule(\'Expenses\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> \u20B9 </span>\n            <span class="stat-label"> MONTHLY EXPENSES </span>'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed clicks properly!");
