const fs = require('fs');

const htmlPath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.html";
let htmlContent = fs.readFileSync(htmlPath, "utf8");

// Revert
htmlContent = htmlContent.replace(/<article class="history-card booking-card-item" id="booking-card-\{\{ b\.id \}\}">/g, '<article class="history-card">');

// Now specifically target the bookings loop:
// It looks like:
// @for (b of bookings; track b.id) {
// 
//   <article class="history-card">

htmlContent = htmlContent.replace(
  /@for \(b of bookings; track b\.id\) \{\s*<article class="history-card">/g,
  '@for (b of bookings; track b.id) {\n\n                  <article class="history-card booking-card-item" id="booking-card-{{ b.id }}">'
);

fs.writeFileSync(htmlPath, htmlContent, "utf8");
console.log("Fixed HTML id issue");
