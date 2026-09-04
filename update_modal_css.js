const fs = require('fs');
const cssPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.css';
let docCss = fs.readFileSync(cssPath, 'utf8');

docCss = docCss.replace(/z-index:\s*100;/, 'z-index: 9999;');
docCss = docCss.replace(/max-width:\s*600px;/, 'width: min(700px, calc(100vw - 40px));');
docCss = docCss.replace(/max-height:\s*90vh;/, 'max-height: calc(100vh - 40px);');

// Reduce vertical padding in modal body
docCss = docCss.replace(/\.modal-body\s*{\s*padding:\s*24px;/, '.modal-body {\n  padding: 16px 24px;');

// Reduce footer padding
docCss = docCss.replace(/\.modal-footer\s*{\s*padding:\s*16px 24px;/, '.modal-footer {\n  padding: 12px 24px;');

// Reduce header padding
docCss = docCss.replace(/\.modal-header\s*{\s*padding:\s*20px 24px;/, '.modal-header {\n  padding: 16px 24px;');

fs.writeFileSync(cssPath, docCss, 'utf8');
console.log("Updated documents.css");
