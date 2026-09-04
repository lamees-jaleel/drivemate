const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the document-details div with a more compact inline grid
const oldDetailsStart = html.indexOf('<div class="document-details" style="background: #111217; border: 1px solid #202127; padding: 16px; border-radius: 12px; margin-bottom: 24px;">');
const oldDetailsEnd = html.indexOf('</div>', html.indexOf('<span> STATUS </span>')) + 6;

if (oldDetailsStart > -1 && oldDetailsEnd > -1) {
    const compactDetails = `<div class="document-details compact-summary" style="background: #111217; border: 1px solid #202127; padding: 12px 16px; border-radius: 12px; margin-top: 0; margin-bottom: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
            <div style="min-height: 0;">
              <span> DOCUMENT </span>
              <strong>{{ getDocumentTypeLabel(selectedDocumentForRenewal.documentType) }}</strong>
            </div>

            <div style="min-height: 0;">
              <span> REGISTRATION </span>
              <strong>{{ vehicle?.registrationNumber }}</strong>
            </div>

            <div style="min-height: 0;">
              <span> VEHICLE </span>
              <strong>{{ vehicle?.make }} {{ vehicle?.model }}</strong>
            </div>

            <div style="min-height: 0;">
              <span> EXPIRY DATE </span>
              <strong>{{ formatDate(selectedDocumentForRenewal.expiryDate) }}</strong>
            </div>

            <div style="min-height: 0;">
              <span> STATUS </span>
              <strong style="color: #f53543;">Expired</strong>
            </div>
          </div>`;
          
    // The previous text had some spaces so we just replace the substring
    const before = html.substring(0, oldDetailsStart);
    const after = html.substring(oldDetailsEnd);
    html = before + compactDetails + after;
}

// Reduce margin-bottom of other elements to make modal more compact
html = html.replace(/margin-bottom: 24px;/g, 'margin-bottom: 16px;');

// Decrease the textarea size from rows="3" to rows="2"
html = html.replace(/<textarea rows="3"/g, '<textarea rows="2"');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Updated HTML for a more compact layout");
