const fs = require('fs');
let ts = fs.readFileSync('src/app/pages/expert-dashboard/expert-dashboard.ts', 'utf8');

const fields = \
  showReportModal = false;
  currentReportId: number | null = null;
  reportFindings = '';
  reportSuspectedCause = '';
  reportSeverity = 'MEDIUM';
  reportSafeToDrive = true;
  reportRecommendedAction = '';
  reportEstimatedRepairCost: number | null = null;
  reportFollowUpRequired = false;
  reportFollowUpNotes = '';
  submittingReport = false;
\;

ts = ts.replace('completedReports =\\n    0;', 'completedReports =\\n    0;\\n' + fields);

const methods = \
  openReportModal(id: number): void {
    this.currentReportId = id;
    this.showReportModal = true;
    this.reportFindings = '';
    this.reportSuspectedCause = '';
    this.reportSeverity = 'MEDIUM';
    this.reportSafeToDrive = true;
    this.reportRecommendedAction = '';
    this.reportEstimatedRepairCost = null;
    this.reportFollowUpRequired = false;
    this.reportFollowUpNotes = '';
  }

  submitReport(): void {
    if (!this.currentReportId) return;
    if (!this.reportFindings || !this.reportRecommendedAction) {
      alert('Findings and recommended action are required.');
      return;
    }

    this.submittingReport = true;
    const payload = {
      findings: this.reportFindings,
      suspectedCause: this.reportSuspectedCause,
      severity: this.reportSeverity,
      safeToDrive: this.reportSafeToDrive,
      recommendedAction: this.reportRecommendedAction,
      estimatedRepairCost: this.reportEstimatedRepairCost,
      followUpRequired: this.reportFollowUpRequired,
      followUpNotes: this.reportFollowUpNotes
    };

    this.diagnosticService.submitReport(this.currentReportId, payload).subscribe({
      next: () => {
        this.submittingReport = false;
        this.showReportModal = false;
        this.loadRequests();
        this.activeTab = 'completed';
      },
      error: () => {
        this.submittingReport = false;
        alert('Failed to submit report.');
      }
    });
  }
\;

ts = ts.replace('completeService(id: number): void {', methods + '\\n\\n  completeService(id: number): void {');

fs.writeFileSync('src/app/pages/expert-dashboard/expert-dashboard.ts', ts);
console.log('Done');
