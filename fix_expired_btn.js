const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

htmlContent = htmlContent.replace('<button class="save-button" type="button" (click)="openRenewalModal(vehicleDocument)">', '<button class="save-button" style="min-height: 36px; padding: 0 16px; font-size: 13px; width: auto;" type="button" (click)="openRenewalModal(vehicleDocument)">');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log("Updated expired-box button styling");
