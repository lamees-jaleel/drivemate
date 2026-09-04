import sys

with open('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Severity</label>
                <select class="form-control" [(ngModel)]="reportSeverity" name="severity">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div class="form-group">
                <label>Estimated Cost (?)</label>
                <input class="form-control" type="number" [(ngModel)]="reportEstimatedRepairCost" name="estimatedCost" placeholder="0.00">
              </div>
            </div>

            <div class="form-group checkbox-group" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="safeToDrive" [(ngModel)]="reportSafeToDrive" name="safeToDrive">
              <label for="safeToDrive" style="margin: 0;">Vehicle is safe to drive</label>
            </div>

            <div class="form-group">
              <label>Recommended Action *</label>
              <textarea class="form-control" [(ngModel)]="reportRecommendedAction" name="recommendedAction" required placeholder="What should the owner do next?"></textarea>
            </div>

            <div class="form-group checkbox-group" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="followUpRequired" [(ngModel)]="reportFollowUpRequired" name="followUpRequired">
              <label for="followUpRequired" style="margin: 0;">Follow-up required</label>
            </div>

            @if (reportFollowUpRequired) {
              <div class="form-group">
                <label>Follow-up Notes</label>
                <input class="form-control" type="text" [(ngModel)]="reportFollowUpNotes" name="followUpNotes" placeholder="When/why to follow up?">
              </div>
            }

            <footer class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #202127;">
              <button class="logout-button" style="width: auto; padding: 0 20px;" type="button" (click)="showReportModal = false">Cancel</button>
              <button class="primary-button compact" type="submit" [disabled]="submittingReport">
                {{ submittingReport ? 'Submitting...' : 'Submit Report' }}
              </button>
            </footer>'''

replacement = '''            <div class="form-row">
              <div class="form-group">
                <label>Severity</label>
                <select class="form-control" [(ngModel)]="reportSeverity" name="severity">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div class="form-group">
                <label>Estimated Cost (?)</label>
                <input class="form-control" type="number" [(ngModel)]="reportEstimatedRepairCost" name="estimatedCost" placeholder="0.00">
              </div>
            </div>

            <div class="form-group checkbox-group">
              <input type="checkbox" id="safeToDrive" [(ngModel)]="reportSafeToDrive" name="safeToDrive">
              <label for="safeToDrive">Vehicle is safe to drive</label>
            </div>

            <div class="form-group">
              <label>Recommended Action *</label>
              <textarea class="form-control" [(ngModel)]="reportRecommendedAction" name="recommendedAction" required placeholder="What should the owner do next?"></textarea>
            </div>

            <div class="form-group checkbox-group">
              <input type="checkbox" id="followUpRequired" [(ngModel)]="reportFollowUpRequired" name="followUpRequired">
              <label for="followUpRequired">Follow-up required</label>
            </div>

            @if (reportFollowUpRequired) {
              <div class="form-group">
                <label>Follow-up Notes</label>
                <input class="form-control" type="text" [(ngModel)]="reportFollowUpNotes" name="followUpNotes" placeholder="When/why to follow up?">
              </div>
            }

            <footer class="modal-footer">
              <button class="logout-button cancel-modal-btn" type="button" (click)="showReportModal = false">Cancel</button>
              <button class="primary-button compact submit-modal-btn" type="submit" [disabled]="submittingReport">
                {{ submittingReport ? 'Submitting...' : 'Submit Report' }}
              </button>
            </footer>'''

new_content = content.replace(target, replacement)
if new_content == content:
    print("No replacement made! Target not found.")
else:
    with open('c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully.")
