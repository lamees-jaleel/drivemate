const fs = require('fs');

const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.html';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('RENEWAL MODAL');
if (startIndex === -1) {
    console.log("Could not find renewal modal start.");
    process.exit(1);
}

// Rewind to the start of the comment block
const realStartIndex = content.lastIndexOf('<!--', startIndex);

const endIndex = content.lastIndexOf('</main>');
if (endIndex === -1) {
    console.log("Could not find main end.");
    process.exit(1);
}

const newModal = `<!-- =========================================================
       RENEWAL MODAL
       ========================================================= -->
  @if (showRenewalModal && selectedDocumentForRenewal) {
    <div class="modal-backdrop" (click)="closeRenewalModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h3>Request Document Renewal</h3>
          <button class="modal-close-btn" type="button" (click)="closeRenewalModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div class="modal-body">
          @if (renewalErrorMessage) {
            <div class="error-message" style="margin-bottom: 1rem;">
              {{ renewalErrorMessage }}
            </div>
          }
          @if (renewalSuccessMessage) {
            <div class="success-message" style="margin-bottom: 1rem;">
              ✓ {{ renewalSuccessMessage }}
            </div>
          }

          <div class="document-details" style="background: #111217; border: 1px solid #202127; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <div>
              <span> DOCUMENT </span>
              <strong>{{ getDocumentTypeLabel(selectedDocumentForRenewal.documentType) }}</strong>
            </div>

            <div>
              <span> REGISTRATION </span>
              <strong>{{ vehicle?.registrationNumber }}</strong>
            </div>

            <div>
              <span> VEHICLE </span>
              <strong>{{ vehicle?.make }} {{ vehicle?.model }}</strong>
            </div>

            <div>
              <span> EXPIRY DATE </span>
              <strong>{{ formatDate(selectedDocumentForRenewal.expiryDate) }}</strong>
            </div>

            <div>
              <span> STATUS </span>
              <strong style="color: #f53543;">Expired</strong>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="color: #858893; font-size: 13px; line-height: 1.6; margin: 0;">
              <strong style="color: #ffffff; display: block; margin-bottom: 8px;">What happens next?</strong>
              1. You submit the renewal request.<br/>
              2. A suitable DriveMate expert/provider receives and reviews it.<br/>
              3. They accept the request and handle the renewal.<br/>
              4. The renewed document is uploaded to your account.
            </p>
          </div>

          <form (ngSubmit)="submitRenewalRequest()">
            <div class="form-field">
              <label>Preferred Assistance <span style="color: #f53543;">*</span></label>
              <select [(ngModel)]="renewalProviderType" name="providerType" required>
                <option value="DRIVEMATE_EXPERT">DriveMate Expert (Recommended)</option>
                <option value="INSURANCE_PROVIDER">Insurance Provider</option>
                <option value="GOVERNMENT_PORTAL">Government Portal Agent</option>
              </select>
            </div>

            <div class="form-field">
              <label>Preferred Date (Optional)</label>
              <input type="date" [(ngModel)]="renewalPreferredDate" name="preferredDate" />
            </div>

            <div class="form-field">
              <label>Additional Notes (Optional)</label>
              <textarea rows="3" [(ngModel)]="renewalNotes" name="notes" placeholder="Any specific requirements..."></textarea>
            </div>
          </form>
        </div>

        <footer class="modal-footer">
          <button class="secondary-button" type="button" (click)="closeRenewalModal()">
            Cancel
          </button>
          <button class="primary-button compact" type="button" [disabled]="submittingRenewal" (click)="submitRenewalRequest()">
            {{ submittingRenewal ? 'Submitting...' : 'Submit Renewal Request' }}
          </button>
        </footer>
      </div>
    </div>
  }
</main>
`;

content = content.substring(0, realStartIndex) + newModal;
fs.writeFileSync(path, content, 'utf8');
console.log("Replaced modal HTML successfully!");
