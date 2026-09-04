import sys
import re

path = r'c:\Drivemate\drivemate-frontend\src\app\pages\documents\documents.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Renewal Modal to the end of the file
modal_html = """
  <!-- =========================================================
       RENEWAL MODAL
       ========================================================= -->
  @if (showRenewalModal && selectedDocumentForRenewal) {
    <div class="modal-backdrop" (click)="closeRenewalModal()">
      <div class="modal-container" (click)=".stopPropagation()" style="max-width: 600px;">
        <header class="modal-header">
          <h3>Request Document Renewal</h3>
          <button class="modal-close-btn" type="button" (click)="closeRenewalModal()">
            ×
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

          <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
              <div><span style="color: #a5a9b2; display: block;">Document:</span><strong style="color: #e8eaed;">{{ getDocumentTypeLabel(selectedDocumentForRenewal.documentType) }}</strong></div>
              <div><span style="color: #a5a9b2; display: block;">Registration:</span><strong style="color: #e8eaed;">{{ vehicle?.registrationNumber }}</strong></div>
              <div><span style="color: #a5a9b2; display: block;">Vehicle:</span><strong style="color: #e8eaed;">{{ vehicle?.make }} {{ vehicle?.model }}</strong></div>
              <div><span style="color: #a5a9b2; display: block;">Expiry Date:</span><strong style="color: #e8eaed;">{{ formatDate(selectedDocumentForRenewal.expiryDate) }}</strong></div>
              <div><span style="color: #a5a9b2; display: block;">Status:</span><strong style="color: #f53543;">Expired</strong></div>
            </div>
          </div>

          <p style="color: #a5a9b2; font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;">
            <strong>What happens next?</strong><br/>
            1. You submit the renewal request.<br/>
            2. A suitable DriveMate expert/provider receives and reviews it.<br/>
            3. They accept the request and handle the renewal.<br/>
            4. The renewed document is uploaded to your account.
          </p>

          <form (ngSubmit)="submitRenewalRequest()">
            <div class="form-field">
              <label>Preferred Assistance <span>*</span></label>
              <select [(ngModel)]="renewalProviderType" name="providerType" required>
                <option value="DRIVEMATE_EXPERT">DriveMate Expert (Certified DriveMate experts can help)</option>
                <option value="LOCAL_SHOP">Local Partner / Service Provider (A nearby registered partner)</option>
              </select>
            </div>

            <div class="form-field">
              <label>Preferred Date (Optional)</label>
              <input type="date" [(ngModel)]="renewalPreferredDate" name="preferredDate" />
            </div>

            <div class="form-field full-width">
              <label>Additional Notes (Optional)</label>
              <textarea rows="3" [(ngModel)]="renewalNotes" name="notes" placeholder="Please help me renew this document as soon as possible."></textarea>
            </div>
          </form>
        </div>

        <footer class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem;">
          <button class="secondary-button" type="button" (click)="closeRenewalModal()">Cancel</button>
          <button class="primary-button compact" type="button" [disabled]="submittingRenewal" (click)="submitRenewalRequest()">
            {{ submittingRenewal ? 'Submitting...' : 'Submit Renewal Request' }}
          </button>
        </footer>
      </div>
    </div>
  }
</div>
"""

# Find expired box
expired_box = """                  @if (vehicleDocument.complianceStatus === 'EXPIRED') {
                    <div class="expired-box">! This document has expired.</div>
                  }"""

new_expired_box = """                  @if (vehicleDocument.complianceStatus === 'EXPIRED') {
                    <div class="expired-box" style="display: flex; justify-content: space-between; align-items: center;">
                      <span>! This document has expired.</span>
                      @if (!hasActiveRenewal(vehicleDocument)) {
                        <button class="primary-button compact" type="button" (click)="openRenewalModal(vehicleDocument)">
                          Request Renewal
                        </button>
                      }
                    </div>
                  }
                  
                  @if (hasActiveRenewal(vehicleDocument)) {
                    <div class="warning-box" style="margin-top: 0.5rem;">
                      Renewal Status: {{ getRenewalStatus(vehicleDocument) }}
                      @if (getRenewalStatus(vehicleDocument) === 'COMPLETED') {
                        (Completed)
                      }
                    </div>
                  }"""

if 'Request Document Renewal' not in content:
    content = content.replace(expired_box, new_expired_box)
    
    # Remove final </div> and append modal
    content = content.rsplit('</div>', 1)[0]
    content += modal_html

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched documents.html")
else:
    print("Already patched documents.html")
