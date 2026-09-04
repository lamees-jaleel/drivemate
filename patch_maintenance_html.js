const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/maintenance/maintenance.html";
let content = fs.readFileSync(filePath, "utf8");

// Add three-dot menu to history-top
const menuHTML = `
                      <div class="record-actions" style="position: relative;">
                        <button type="button" class="action-menu-btn" (click)="toggleActionMenu(record.id); $event.stopPropagation()" style="background:none;border:none;color:#a5a9b2;font-size:20px;cursor:pointer;padding:4px 8px;">
                          &#8942;
                        </button>
                        @if (activeActionMenu === record.id) {
                          <div class="action-dropdown" style="position:absolute;right:0;top:100%;background:#18191e;border:1px solid #25262d;border-radius:6px;min-width:120px;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
                            <button type="button" (click)="editRecord(record); $event.stopPropagation()" style="display:block;width:100%;text-align:left;padding:10px 15px;background:none;border:none;color:#e8eaed;cursor:pointer;font-size:13px;border-bottom:1px solid #25262d;">Edit</button>
                            <button type="button" (click)="deleteRecord(record); $event.stopPropagation()" style="display:block;width:100%;text-align:left;padding:10px 15px;background:none;border:none;color:#f53543;cursor:pointer;font-size:13px;">Delete</button>
                          </div>
                        }
                      </div>
`;

// Insert after the h3 inside history-top (for maintenance records, not bookings)
// The HTML has:
// <h3>
//   {{ record.title }}
// </h3>
// </div>
// <strong class="cost">
content = content.replace(
  /<h3>\s*\{\{\s*record\.title\s*\}\}\s*<\/h3>\s*<\/div>/,
  `<h3>\n                          {{ record.title }}\n                        </h3>\n                      </div>\n${menuHTML}`
);

// We need to close the menu if clicking outside. I'll just add (click)="activeActionMenu = null" to the main tag
if (!content.includes('(click)="activeActionMenu = null"')) {
    content = content.replace(/<main class="page-container">/, '<main class="page-container" (click)="activeActionMenu = null">');
}

// Enhance NEXT SERVICE rendering
// Look for NEXT SERVICE block inside history-card
const nextServiceOld = `
                      <div>
                        <span> NEXT SERVICE </span>
                        <strong>
                          @if (record.nextServiceDate) {
                            {{ formatDate(record.nextServiceDate) }}
                          } @else {
                            -
                          }
                        </strong>
                        <small>
                          @if (record.nextServiceOdometerKm) {
                            OR {{ record.nextServiceOdometerKm }} KM
                          }
                        </small>
                      </div>
`;
// Replace with the dynamic status version!
const nextServiceNew = `
                      <div>
                        <span> NEXT SERVICE </span>
                        <strong>
                          @if (record.nextServiceDate) {
                            {{ formatDate(record.nextServiceDate) }}
                          } @else if (record.nextServiceOdometerKm) {
                            {{ record.nextServiceOdometerKm }} KM
                          } @else {
                            -
                          }
                        </strong>
                        <small>
                          @if (record.nextServiceDate && record.nextServiceOdometerKm) {
                            OR {{ record.nextServiceOdometerKm }} KM
                          }
                        </small>

                        <!-- Dynamic Status -->
                        @if (getRecordStatus(record); as statusObj) {
                            <div style="margin-top: 6px; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;"
                                 [style.color]="statusObj.urgent ? '#f53543' : (statusObj.status === 'COMPLETED' ? '#28a745' : '#ffc107')"
                                 [style.background]="statusObj.urgent ? 'rgba(245, 53, 67, 0.1)' : (statusObj.status === 'COMPLETED' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)')"
                            >
                              {{ statusObj.status }}
                              @if (statusObj.text && statusObj.status !== 'COMPLETED' && statusObj.status !== 'UPCOMING') {
                                <span style="display:block; font-size:10px; font-weight:400; text-transform:none; opacity:0.8;">{{ statusObj.text }}</span>
                              }
                            </div>
                        }
                      </div>
`;
content = content.replace(
  /<div>\s*<span>\s*NEXT SERVICE\s*<\/span>\s*<strong>\s*@if \(record\.nextServiceDate\) \{\s*\{\{\s*formatDate\(record\.nextServiceDate\)\s*\}\}\s*\} @else \{\s*-\s*\}\s*<\/strong>\s*<small>\s*@if \(record\.nextServiceOdometerKm\) \{\s*OR \{\{\s*record\.nextServiceOdometerKm\s*\}\} KM\s*\}\s*<\/small>\s*<\/div>/g,
  nextServiceNew
);

// Update submit button text dynamically based on edit mode
content = content.replace(
    /Add Service Record\s*<\/button>\s*<\/div>\s*<\/form>/,
    `{{ isEditing ? 'Update Service Record' : 'Add Service Record' }}
                </button>
                @if (isEditing) {
                  <button type="button" class="secondary-button" (click)="cancelEdit()">Cancel Edit</button>
                }
              </div>
            </form>`
);

content = content.replace(
    /<h2>\s*Add Service Record\s*<\/h2>/,
    `<h2>\n              {{ isEditing ? 'Edit Service Record' : 'Add Service Record' }}\n            </h2>`
);


fs.writeFileSync(filePath, content, "utf8");
console.log("Patched maintenance html (Angular)");
