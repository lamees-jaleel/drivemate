import sys

path = r'c:\Drivemate\drivemate-frontend\src\app\pages\documents\documents.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Renewal State variables
new_state = """
  /* =======================================================
     RENEWAL MODAL STATE
  ======================================================= */
  showRenewalModal = false;
  selectedDocumentForRenewal: VehicleDocument | null = null;
  renewalProviderType = 'DRIVEMATE_EXPERT';
  renewalPreferredDate = '';
  renewalNotes = '';
  submittingRenewal = false;
  renewalErrorMessage = '';
  renewalSuccessMessage = '';

  openRenewalModal(doc: VehicleDocument): void {
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

  hasActiveRenewal(doc: VehicleDocument): boolean {
    if (!doc.renewals || doc.renewals.length === 0) return false;
    const activeStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS'];
    return activeStatuses.includes(doc.renewals[0].status);
  }

  getRenewalStatus(doc: VehicleDocument): string {
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
        next: (res) => {
          this.submittingRenewal = false;
          this.renewalSuccessMessage = 'Renewal request submitted successfully.';
          this.toast.show('Renewal request created.', 'success');
          this.loadDocuments();
          setTimeout(() => this.closeRenewalModal(), 1500);
        },
        error: (err) => {
          this.submittingRenewal = false;
          this.renewalErrorMessage = err.error?.message || 'Failed to submit renewal request.';
        }
      });
  }
"""

if 'showRenewalModal = false;' not in content:
    content = content.replace("  fileErrorMessage =\n    '';", "  fileErrorMessage =\n    '';\n" + new_state)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched documents.ts")
else:
    print("Already patched documents.ts")

