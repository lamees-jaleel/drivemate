const fs = require('fs');

const filePath = "c:/Drivemate/drivemate-frontend/src/app/pages/owner-dashboard/owner-dashboard.html";
let content = fs.readFileSync(filePath, "utf8");

// The current HTML block:
const oldHtml = `<div class="empty-feature">
            @if (upcomingServices > 0) {
              <span style="color: #ffc107;"> {{ upcomingServices }} upcoming services due </span>
            } @else {
              <span style="color: #28a745;"> All services up to date </span>
            }
          </div>`;

const newHtml = `<div class="empty-feature" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
            @if (upcomingServices > 0 && urgentServiceAlert) {
              <span style="color: #f53543; font-weight: 600; font-size: 11px;">{{ urgentServiceAlert.status }}</span>
              <strong style="color: #e8eaed; font-size: 13px;">{{ urgentServiceAlert.vehicle }}</strong>
              <span style="color: #a5a9b2; font-size: 12px;">{{ urgentServiceAlert.title }}</span>
              <span style="color: #ffc107; font-size: 12px; margin-top: 2px;">{{ urgentServiceAlert.text }}</span>
              @if (upcomingServices > 1) {
                <span style="color: #a5a9b2; font-size: 11px; margin-top: 4px;">+ {{ upcomingServices - 1 }} other services</span>
              }
            } @else {
              <span style="color: #28a745;"> All services up to date </span>
            }
          </div>`;

content = content.replace(oldHtml, newHtml);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched urgent service HTML");
