const fs = require('fs');

const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html';
let content = fs.readFileSync(path, 'utf8');

const sidebar_nav = `      <button
        class="nav-item"
        [class.active]="activeTab === 'requests' || activeTab === 'active' || activeTab === 'completed'"
        type="button"
        (click)="setTab('requests')"
      >
        <span class="nav-icon"> ▤ </span>

        Diagnostic Requests
      </button>
      
      <button
        class="nav-item"
        [class.active]="renewalRequestsOpen"
        type="button"
        (click)="renewalRequestsOpen = true; activeTab = 'dashboard'; setRenewalTab('NEW')"
      >
        <span class="nav-icon"> 📄 </span>

        Renewal Requests
      </button>`;

if (!content.includes('Renewal Requests')) {
    // We just replace the Diagnostic Requests button with both buttons
    content = content.replace(/<button[^>]*class="nav-item"[^>]*\[class\.active\]="activeTab === 'requests'[^>]*>[^<]*<span[^>]*>[^<]*<\/span>[^D]*Diagnostic Requests[^<]*<\/button>/, sidebar_nav);
}

// Add the renewals UI view inside the dashboard-content
const renewals_view = `
      <!-- =================================================
           RENEWALS VIEW
      ================================================== -->
      @if (renewalRequestsOpen) {
        <section class="section-heading" style="margin-bottom: 2rem;">
          <div>
            <p class="section-kicker">DOCUMENT COMPLIANCE</p>
            <h2>Renewal Requests</h2>
          </div>
        </section>

        <div class="tabs-nav" style="margin-bottom: 2rem; display: flex; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <button [class.active-tab]="renewalTab === 'NEW'" (click)="setRenewalTab('NEW')" style="background: none; border: none; color: white; cursor: pointer; padding: 0.5rem 1rem; opacity: 0.7;" [style.border-bottom]="renewalTab === 'NEW' ? '2px solid #ef3038' : 'none'" [style.opacity]="renewalTab === 'NEW' ? '1' : '0.7'">New Requests</button>
          <button [class.active-tab]="renewalTab === 'ACCEPTED'" (click)="setRenewalTab('ACCEPTED')" style="background: none; border: none; color: white; cursor: pointer; padding: 0.5rem 1rem; opacity: 0.7;" [style.border-bottom]="renewalTab === 'ACCEPTED' ? '2px solid #ef3038' : 'none'" [style.opacity]="renewalTab === 'ACCEPTED' ? '1' : '0.7'">Accepted</button>
          <button [class.active-tab]="renewalTab === 'IN_PROGRESS'" (click)="setRenewalTab('IN_PROGRESS')" style="background: none; border: none; color: white; cursor: pointer; padding: 0.5rem 1rem; opacity: 0.7;" [style.border-bottom]="renewalTab === 'IN_PROGRESS' ? '2px solid #ef3038' : 'none'" [style.opacity]="renewalTab === 'IN_PROGRESS' ? '1' : '0.7'">In Progress</button>
          <button [class.active-tab]="renewalTab === 'COMPLETED'" (click)="setRenewalTab('COMPLETED')" style="background: none; border: none; color: white; cursor: pointer; padding: 0.5rem 1rem; opacity: 0.7;" [style.border-bottom]="renewalTab === 'COMPLETED' ? '2px solid #ef3038' : 'none'" [style.opacity]="renewalTab === 'COMPLETED' ? '1' : '0.7'">Completed</button>
        </div>

        @if (loadingRenewals) {
          <div class="empty-state">
            <h4>Loading renewal requests...</h4>
          </div>
        } @else if (renewals.length === 0) {
          <div class="empty-state">
            <h4>No renewal requests yet.</h4>
          </div>
        } @else {
          <div class="requests-grid">
            @for (req of renewals; track req.id) {
              <article class="request-card">
                <div class="request-card-header">
                  <span class="request-id">REQ-{{ req.id }}</span>
                  <span class="status-badge" [class]="getStatusClass(req.status)">
                    {{ req.status }}
                  </span>
                </div>

                <div class="request-card-content">
                  <div class="info-row">
                    <span class="info-label">OWNER</span>
                    <strong class="info-value">{{ req.owner?.fullName }}</strong>
                  </div>

                  <div class="info-row">
                    <span class="info-label">VEHICLE</span>
                    <strong class="info-value">{{ req.vehicle?.make }} {{ req.vehicle?.model }}</strong>
                  </div>

                  <div class="info-row">
                    <span class="info-label">REGISTRATION</span>
                    <strong class="info-value">{{ req.vehicle?.registrationNumber }}</strong>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">DOCUMENT</span>
                    <strong class="info-value">{{ req.document?.documentType }}</strong>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">EXPIRY DATE</span>
                    <strong class="info-value">{{ formatDate(req.document?.expiryDate) }}</strong>
                  </div>

                  <div class="info-row">
                    <span class="info-label">REQUESTED ON</span>
                    <strong class="info-value">{{ formatDate(req.createdAt) }}</strong>
                  </div>
                  
                  @if(req.notes) {
                    <div class="info-row full-width">
                      <span class="info-label">OWNER NOTES</span>
                      <p class="info-value">{{ req.notes }}</p>
                    </div>
                  }
                </div>

                <div class="request-card-actions">
                  @if (req.status === 'PENDING') {
                    <button class="primary-button compact" type="button" (click)="acceptRenewal(req.id)">
                      Accept Request
                    </button>
                    <button class="secondary-button compact" type="button" (click)="declineRenewal(req.id)">
                      Decline
                    </button>
                  }
                  
                  @if (req.status === 'ACCEPTED') {
                    <button class="primary-button compact" type="button" (click)="startRenewal(req.id)">
                      Start Renewal
                    </button>
                  }

                  @if (req.status === 'IN_PROGRESS') {
                    <button class="primary-button compact" type="button" (click)="openCompleteModal(req.id)">
                      Complete Renewal
                    </button>
                  }
                </div>
              </article>
            }
          </div>
        }
      }
`;

const complete_modal = `
  <!-- =========================================================
       COMPLETE RENEWAL MODAL
       ========================================================= -->
  @if (showCompleteRenewalModal) {
    <div class="modal-backdrop" (click)="closeCompleteModal()">
      <div class="modal-container" (click)="$event.stopPropagation()" style="max-width: 600px;">
        <header class="modal-header">
          <h3>Complete Renewal</h3>
          <button class="modal-close-btn" type="button" (click)="closeCompleteModal()">
            ×
          </button>
        </header>

        <div class="modal-body">
          <form (ngSubmit)="submitCompleteRenewal()">
            <div class="form-field full-width">
              <label>Upload Renewed Document <span>*</span></label>
              <label class="file-drop" for="renewalFile" style="border: 2px dashed rgba(255,255,255,0.2); padding: 1rem; text-align: center; border-radius: 8px; cursor: pointer; display: block;">
                <strong>Choose Document</strong>
                <span style="display: block; font-size: 0.8rem; color: #a5a9b2; margin-top: 0.5rem;">PDF, JPG, PNG · Max 5MB</span>
                @if (renewalFileName) {
                  <small style="display: block; margin-top: 0.5rem; color: #ef3038;">✓ {{ renewalFileName }}</small>
                }
              </label>
              <input id="renewalFile" type="file" style="display: none;" (change)="onRenewalFileSelected($event)" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
            </div>

            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
              <div class="form-field">
                <label>New Document Number</label>
                <input type="text" [(ngModel)]="renewalDocNumber" name="renewalDocNumber" placeholder="e.g. POL987654" />
              </div>

              <div class="form-field">
                <label>Provider / Issuer</label>
                <input type="text" [(ngModel)]="renewalProvider" name="renewalProvider" placeholder="e.g. HDFC ERGO" />
              </div>

              <div class="form-field">
                <label>New Issue Date</label>
                <input type="date" [(ngModel)]="renewalIssueDate" name="renewalIssueDate" />
              </div>

              <div class="form-field">
                <label>New Expiry Date</label>
                <input type="date" [(ngModel)]="renewalExpiryDate" name="renewalExpiryDate" />
              </div>
            </div>

            <div class="form-field full-width" style="margin-top: 1rem;">
              <label>Optional Notes</label>
              <textarea rows="3" [(ngModel)]="renewalNotes" name="renewalNotes" placeholder="Any comments regarding this renewal..."></textarea>
            </div>
          </form>
        </div>

        <footer class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1rem;">
          <button class="secondary-button" type="button" (click)="closeCompleteModal()">Cancel</button>
          <button class="primary-button compact" type="button" [disabled]="submittingRenewalComplete" (click)="submitCompleteRenewal()">
            {{ submittingRenewalComplete ? 'Uploading...' : 'Complete Renewal' }}
          </button>
        </footer>
      </div>
    </div>
  }
`;

if (!content.includes('RENEWALS VIEW')) {
    // Hide diagnostic content when renewalRequestsOpen is true
    content = content.replace(/@if \(activeTab === 'dashboard'\)/g, "@if (activeTab === 'dashboard' && !renewalRequestsOpen)");
    content = content.replace(/@if \(activeTab === 'requests'\)/g, "@if (activeTab === 'requests' && !renewalRequestsOpen)");
    content = content.replace(/@if \(activeTab === 'active'\)/g, "@if (activeTab === 'active' && !renewalRequestsOpen)");
    content = content.replace(/@if \(activeTab === 'completed'\)/g, "@if (activeTab === 'completed' && !renewalRequestsOpen)");
    
    // Also we need to make sure setTab turns off renewalRequestsOpen
    // I patched it via JS above: activeTab = 'dashboard'; setRenewalTab('NEW')
}

// Add the renewals view at the end of dashboard-content
if (!content.includes('RENEWALS VIEW')) {
    const dashboardEnd = '    </div>\n  </main>';
    content = content.replace(dashboardEnd, renewals_view + '\n' + dashboardEnd);
}

if (!content.includes('COMPLETE RENEWAL MODAL')) {
    const fileEnd = '</div>';
    let lastDiv = content.lastIndexOf(fileEnd);
    content = content.substring(0, lastDiv) + complete_modal + '\n' + fileEnd;
}

fs.writeFileSync(path, content, 'utf8');
console.log("Patched expert-dashboard.html");
