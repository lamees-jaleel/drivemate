const fs = require('fs');

const ownerCss = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\owner-dashboard\\owner-dashboard.css', 'utf8');

const startIndex = ownerCss.indexOf('MODAL DIALOG / BACKDROP STYLES');
const endIndex = ownerCss.indexOf('Alerts inside modals');

if (startIndex > -1 && endIndex > -1) {
    const modalStyles = '/* ' + ownerCss.substring(startIndex, endIndex - 3);
    let docCss = fs.readFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.css', 'utf8');
    
    if (!docCss.includes('MODAL DIALOG / BACKDROP STYLES')) {
        docCss += '\n\n' + modalStyles;
        fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.css', docCss, 'utf8');
        console.log("Appended modal styles to documents.css");
    } else {
        console.log("Already appended.");
    }
} else {
    console.log("Could not find modal styles block.");
}
