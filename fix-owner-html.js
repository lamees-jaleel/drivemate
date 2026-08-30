const fs = require('fs');
const htmlPath = 'c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Make stat cards buttons and route them
html = html.replace(/<article class="stat-card">/g, '<button class="stat-card" type="button">');
html = html.replace(/<\/article>\s*(?=\s*<button class="stat-card")|<\/article>\s*(?=\s*<\/section>)/g, '</button>\n');

// Then add (click) bindings to the new stat-card buttons
html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*?\s*<\/span>/, '<button class="stat-card" type="button" (click)="openModule(\'My Vehicles\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ? </span>');
html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*?\s*<\/span>/, '<button class="stat-card" type="button" (click)="openModule(\'Maintenance\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ? </span>');
html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*?\s*<\/span>/, '<button class="stat-card" type="button" (click)="openModule(\'Expenses\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ? </span>');
html = html.replace(/<button class="stat-card" type="button">\s*<div class="stat-card-top">\s*<span class="stat-icon">\s*!\s*<\/span>/, '<button class="stat-card" type="button" (click)="openModule(\'Documents & Compliance\')">\n          <div class="stat-card-top">\n            <span class="stat-icon"> ! </span>');


// 2. Clickable vehicle cards
html = html.replace(/<article class="garage-vehicle-card">/g, '<article class="garage-vehicle-card" (click)="openVehicleDetailsForId(vehicle.id)" style="cursor: pointer;">');
html = html.replace(/<button\s*class="primary-button compact"\s*type="button"\s*\(click\)="openVehicleDetailsForId\(vehicle\.id\)"\s*>/g, '<button\n                    class="primary-button compact"\n                    type="button"\n                    (click)="openVehicleDetailsForId(vehicle.id); $event.stopPropagation()"\n                  >');


// 3. Make naming consistent for Documents & Compliance
html = html.replace(/\(click\)="openModule\('Documents'\)"/g, `(click)="openModule('Documents & Compliance')"`);
html = html.replace(/<h3>Documents<\/h3>/g, '<h3>Documents & Compliance</h3>');


// 4. Update the "Feature Grid" empty states to use real data!
// Maintenance
html = html.replace(/<div class="empty-feature">\s*<span> No service records yet <\/span>\s*<\/div>/, 
    `<div class="empty-feature">
            @if (upcomingServices > 0) {
              <span style="color: #ffc107;"> {{ upcomingServices }} upcoming services due </span>
            } @else {
              <span style="color: #28a745;"> All services up to date </span>
            }
          </div>`);

// Expenses
html = html.replace(/<div class="expense-placeholder">\s*<div class="expense-line">\s*<span> This month <\/span>\s*<strong>\s*?0\s*<\/strong>\s*<\/div>\s*<\/div>/, 
    `<div class="expense-placeholder">
            <div class="expense-line">
              <span> This month </span>
              <strong> ?{{ monthlyExpense | number }} </strong>
            </div>
          </div>`);

// Documents
html = html.replace(/<div class="document-status-list">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, 
    `<div class="document-status-list">
            <div style="width: 100%; display: flex; justify-content: space-between;">
              <span> Status </span>
              @if (complianceAlerts > 0) {
                <span class="status-empty" style="color: #ff3545;"> {{ complianceAlerts }} alerts </span>
              } @else {
                <span class="status-empty" style="color: #28a745;"> Compliant </span>
              }
            </div>
          </div>`);


// 5. Accessible labels for icon-only buttons
html = html.replace(/<button class="menu-button" type="button" \(click\)="toggleSidebar\(\)">/, '<button class="menu-button" type="button" aria-label="Toggle Navigation Menu" (click)="toggleSidebar()">');
html = html.replace(/<button class="sidebar-close" type="button" \(click\)="closeSidebar\(\)">/, '<button class="sidebar-close" type="button" aria-label="Close Sidebar" (click)="closeSidebar()">');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("HTML replaced");
