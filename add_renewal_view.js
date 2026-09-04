const fs = require('fs');
const htmlPath = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html';
let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('@if (renewalRequestsOpen) {')) {
  const renewalView = `
    <!-- ===================================================
         RENEWAL REQUESTS WORKSPACE
    ==================================================== -->
    @if (renewalRequestsOpen) {
      <section class="workspace-section">
        <div class="workspace-header">
          <span class="eyebrow">DOCUMENT SERVICES</span>
          <h2>Renewal Requests</h2>
          <p>Manage and process document renewal requests from vehicle owners.</p>
        </div>

        @if (renewalRequests.length === 0) {
          <div class="empty-workspace-state">
            <div class="empty-state-icon">📄</div>
            <h3>No renewal requests</h3>
            <p>You do not have any pending document renewals to process.</p>
          </div>
        } @else {
          <div class="expert-requests-list">
            @for (req of renewalRequests; track req.id) {
              <div class="expert-request-card" [ngClass]="{'active-card': req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS', 'completed-card': req.status === 'COMPLETED'}">
                <div class="card-left">
                  <div class="status-indicator-bar" [ngClass]="getStatusClass(req.status)">
                    {{ req.status }}
                  </div>
                  <div class="request-meta">
                    <span class="vehicle-tag">
                      {{ req.vehicle?.make }} {{ req.vehicle?.model }} ({{ req.vehicle?.registrationNumber }})
                    </span>
                    <h3>{{ getDocumentTypeLabel(req.document?.documentType) }} Renewal</h3>
                    <p class="symptoms-text"><strong>Owner Notes:</strong> {{ req.notes || 'None provided' }}</p>
                    <p class="provider-info-text">
                      <strong>Current Expiry:</strong> {{ formatDate(req.document?.expiryDate) }}
                    </p>
                  </div>
                </div>

                <div class="card-right">
                  @if (req.status === 'PENDING') {
                    <button class="primary-button compact" (click)="acceptRenewal(req.id)">Accept Request</button>
                  }
                  @if (req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') {
                    <button class="primary-button compact" (click)="openCompleteModal(req)">Complete Renewal</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>
    }
`;

  // Find the closing div of dashboard-content
  const lastIndex = html.lastIndexOf('</div>\r\n  }\r\n\r\n</div>');
  if (lastIndex > -1) {
    html = html.substring(0, lastIndex) + renewalView + html.substring(lastIndex);
  } else {
    // try different line endings
    const lastIndex2 = html.lastIndexOf('</div>\n  }\n\n</div>');
    if (lastIndex2 > -1) {
      html = html.substring(0, lastIndex2) + renewalView + html.substring(lastIndex2);
    } else {
      // Just put it before the last </div>
      html = html.replace('    <!-- =========================================================\r\n       COMPLETE RENEWAL MODAL', renewalView + '\r\n    <!-- =========================================================\r\n       COMPLETE RENEWAL MODAL');
    }
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log("Added renewal requests view to expert-dashboard.html");
} else {
  console.log("Already has renewal view.");
}
