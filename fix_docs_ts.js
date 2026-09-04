const fs = require('fs');
const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\documents\\documents.ts';
let content = fs.readFileSync(path, 'utf8');

const new_state = `
  /* =======================================================
     RENEWAL MODAL STATE
  ======================================================= */
  showRenewalModal = false;
  selectedDocumentForRenewal: any = null;
  renewalProviderType = 'DRIVEMATE_EXPERT';
  renewalPreferredDate = '';
  renewalNotes = '';
  submittingRenewal = false;
  renewalErrorMessage = '';
  renewalSuccessMessage = '';

  openRenewalModal(doc: any): void {
    if (this.hasActiveRenewal(doc)) return;
    this.selectedDocumentForRenewal = doc;
    this.showRenewalModal = true;
    this.renewalProviderType = 'DRIVEMATE_EXPERT';
    this.renewalPreferredDate = '';
    this.renewalNotes = '';
    this.renewalErrorMessage = '';
    this.renewalSuccessMessage = '';
  }

  closeRenewalModal(): void {
    this.showRenewalModal = false;
    this.selectedDocumentForRenewal = null;
  }

  hasActiveRenewal(doc: any): boolean {
    if (!doc.renewals || doc.renewals.length === 0) return false;
    const activeStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS'];
    return activeStatuses.includes(doc.renewals[0].status);
  }

  getRenewalStatus(doc: any): string {
    if (!doc.renewals || doc.renewals.length === 0) return '';
    return doc.renewals[0].status;
  }

  submitRenewalRequest(): void {
    if (!this.selectedDocumentForRenewal) return;
    
    this.submittingRenewal = true;
    this.renewalErrorMessage = '';
    
    const payload = {
      providerType: this.renewalProviderType,
      preferredDate: this.renewalPreferredDate || null,
      notes: this.renewalNotes
    };

    this.documentService.requestRenewal(this.vehicleId, this.selectedDocumentForRenewal.id, payload)
      .subscribe({
        next: (res: any) => {
          this.submittingRenewal = false;
          this.renewalSuccessMessage = 'Renewal request submitted successfully.';
          this.toast.show('Renewal request created.', 'success');
          this.loadDocuments();
          setTimeout(() => this.closeRenewalModal(), 1500);
        },
        error: (err: any) => {
          this.submittingRenewal = false;
          this.renewalErrorMessage = err?.error?.message || 'Failed to submit renewal request.';
        }
      });
  }
`;

if (!content.includes('showRenewalModal = false;')) {
    let lastBrace = content.lastIndexOf('}');
    content = content.substring(0, lastBrace) + new_state + '\n' + content.substring(lastBrace);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched documents.ts");
}
