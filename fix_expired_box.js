const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let content = fs.readFileSync(path, 'utf8');

const regex = /(@if\s*\(\s*vehicleDocument\.complianceStatus\s*===\s*'EXPIRED'\s*\)\s*\{\s*)<div class="expired-box">!\s*This document has expired\.<\/div>(\s*\})/;

const new_box = `$1<div class="expired-box" style="display: flex; justify-content: space-between; align-items: center;">
                      <span>! This document has expired.</span>
                      @if (!hasActiveRenewal(vehicleDocument)) {
                        <button class="primary-button compact" type="button" (click)="openRenewalModal(vehicleDocument)">
                          Request Renewal
                        </button>
                      }
                    </div>
                  }
                  
                  @if (hasActiveRenewal(vehicleDocument)) {
                    <div class="warning-box" style="margin-top: 0.5rem; background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid rgba(255, 193, 7, 0.2); padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500;">
                      Renewal Status: {{ getRenewalStatus(vehicleDocument) }}
                      @if (getRenewalStatus(vehicleDocument) === 'COMPLETED') {
                        (Completed)
                      }
                    </div>
                  $2`;

if (regex.test(content)) {
    content = content.replace(regex, new_box);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced the expired box!");
} else {
    console.log("Regex did not match!");
}
