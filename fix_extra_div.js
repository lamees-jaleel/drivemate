const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace('</div>\r\n          </div>\r\n\r\n          <div style="margin-bottom: 16px;">', '</div>\r\n\r\n          <div style="margin-bottom: 16px;">');
html = html.replace('</div>\n          </div>\n\n          <div style="margin-bottom: 16px;">', '</div>\n\n          <div style="margin-bottom: 16px;">');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Fixed extra closing div");
