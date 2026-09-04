const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const lastIndex = htmlContent.lastIndexOf('</main>');
if (lastIndex !== -1) {
    htmlContent = htmlContent.substring(0, lastIndex) + '</div>\n' + htmlContent.substring(lastIndex + 7);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log("Replaced the last </main> with </div>");
}
