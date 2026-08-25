const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>`;

const files = [
  'documents/documents.html',
  'expenses/expenses.html',
  'maintenance/maintenance.html'
].map(f => 'src/app/pages/' + f);

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  // Replace top bar navigation logic
  const topBarRegex = /@if\s*\(vehicle\)\s*\{\s*<a\s*class="back-link"\s*\[routerLink\]="\[\s*'\/owner-dashboard\/vehicles',\s*vehicle\.id\s*\]">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<span>Vehicle Details<\/span>\s*<\/a>\s*\}/;
  
  const topBarReplacement = `@if (vehicle) {
      @if (isDirectRoute) {
        <a class="back-link" [routerLink]="['/owner-dashboard/vehicles', vehicle.id]">
          ${svg}
          <span>Vehicle Details</span>
        </a>
      } @else {
        <button class="back-link" type="button" (click)="clearSelection()">
          ${svg}
          <span>Back to Select Vehicle</span>
        </button>
      }
    }`;
    
  html = html.replace(topBarRegex, topBarReplacement);

  // Replace empty state back button
  const emptyStateRegex = /<a\s*class="secondary-button"\s*routerLink="\/owner-dashboard">\s*← Back to Dashboard\s*<\/a>/g;
  
  const emptyStateReplacement = `<a class="back-link" routerLink="/owner-dashboard">\n              ${svg}\n              <span>Back to Dashboard</span>\n            </a>`;
  
  html = html.replace(emptyStateRegex, emptyStateReplacement);

  fs.writeFileSync(file, html, 'utf8');
});

// Also fix vehicle-details.html which has buttons with ← Back to My Vehicles
const vdFile = 'src/app/pages/vehicle-details/vehicle-details.html';
let vdHtml = fs.readFileSync(vdFile, 'utf8');

const vdButtonRegex1 = /<button\s*class="primary-button"\s*type="button"\s*\(click\)="backToVehicles\(\)">\s*← Back to My Vehicles\s*<\/button>/g;
const vdButtonRep1 = `<button class="primary-button" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;" type="button" (click)="backToVehicles()">\n          ${svg}\n          <span>Back to My Vehicles</span>\n        </button>`;

const vdButtonRegex2 = /<button\s*class="secondary-button"\s*type="button"\s*\(click\)="backToVehicles\(\)">\s*← Back to My Vehicles\s*<\/button>/g;
const vdButtonRep2 = `<button class="secondary-button" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;" type="button" (click)="backToVehicles()">\n          ${svg}\n          <span>Back to My Vehicles</span>\n        </button>`;

vdHtml = vdHtml.replace(vdButtonRegex1, vdButtonRep1);
vdHtml = vdHtml.replace(vdButtonRegex2, vdButtonRep2);

fs.writeFileSync(vdFile, vdHtml, 'utf8');

console.log("Done");
