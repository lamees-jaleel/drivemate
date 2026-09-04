const fs = require('fs');

// 1. Update documents.html to use save-button and cancel-button
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

htmlContent = htmlContent.replace(/class="secondary-button"/g, 'class="cancel-button"');
htmlContent = htmlContent.replace(/class="primary-button compact"/g, 'class="save-button"');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log("Updated buttons in documents.html");

// 2. Append cancel-button to documents.css
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.cancel-button {')) {
    cssContent += `\n
.cancel-button {
  min-height: 48px;
  padding: 0 24px;
  border: 1px solid #202127;
  border-radius: 8px;
  background: transparent;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.05);
}
`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log("Appended cancel-button styles to documents.css");
}
