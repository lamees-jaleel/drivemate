const fs = require('fs');
const path = require('path');

const pages = ['documents', 'expenses', 'maintenance'];

pages.forEach(page => {
  const tsPath = `src/app/pages/${page}/${page}.ts`;
  const htmlPath = `src/app/pages/${page}/${page}.html`;
  
  // 1. Update TS file
  let ts = fs.readFileSync(tsPath, 'utf8');
  if (!ts.includes('isDirectRoute')) {
    ts = ts.replace(/vehicleId =\s*0;/, 'vehicleId = 0;\n\n  isDirectRoute = false;\n');
    ts = ts.replace(/if \(!idParam\) {/, 'if (!idParam) {\n      this.isDirectRoute = false;');
    ts = ts.replace(/const id =(\s*)Number\(idParam\);/, 'this.isDirectRoute = true;\n\n    const id =$1Number(idParam);');
    
    // add clearSelection method
    const clearMethod = `
  clearSelection(): void {
    this.vehicle = null;
    this.vehicleId = 0;
    this.showVehicleSelector = true;
  }
`;
    // insert before loadVehicle or somewhere
    ts = ts.replace(/private loadVehicle\(\):/, `${clearMethod}\n  private loadVehicle():`);
    
    fs.writeFileSync(tsPath, ts, 'utf8');
    console.log('Updated TS for', page);
  }

  // 2. Update HTML file
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Find the top back-link
  // It looks like:
  /*
    @if (vehicle) {
      <a class="back-link" [routerLink]="['/owner-dashboard/vehicles', vehicle.id]">
        <svg ...>...</svg>
        <span>Vehicle Details</span>
      </a>
    }
  */
  const htmlRegex = /@if\s*\(vehicle\)\s*\{\s*<a[\s\S]*?class="back-link"[\s\S]*?\[routerLink\]="\s*\[[\s\S]*?'\/owner-dashboard\/vehicles'[\s\S]*?vehicle\.id[\s\S]*?\]"[\s\S]*?>([\s\S]*?)<\/a>\s*\}/;
  
  const match = html.match(htmlRegex);
  if (match) {
    const innerContent = match[1]; // this contains the svg and span
    
    // wait, we need to extract the SVG so we can reuse it
    const svgMatch = innerContent.match(/<svg[\s\S]*?<\/svg>/);
    const svg = svgMatch ? svgMatch[0] : '';
    
    const replacement = `@if (vehicle) {
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
    
    html = html.replace(htmlRegex, replacement);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Updated HTML for', page);
  }
});
