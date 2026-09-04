const fs = require('fs');

const path = 'c:\\Drivemate\\drivemate-frontend\\src\\app\\pages\\expert-dashboard\\expert-dashboard.ts';
let content = fs.readFileSync(path, 'utf8');

const import_service = "import { ExpertRenewalService } from '../../services/expert-renewal.service';\n";

if (!content.includes('ExpertRenewalService')) {
    content = content.replace("import { ToastService } from '../../shared/toast/toast.service';", "import { ToastService } from '../../shared/toast/toast.service';\n" + import_service);
}

const inject_service = "  private readonly renewalService = inject(ExpertRenewalService);\n";
if (!content.includes('renewalService = inject')) {
    content = content.replace("private readonly diagnosticService =", inject_service + "  private readonly diagnosticService =");
}

const state_vars = `
  /* =======================================================
     RENEWALS STATE
  ======================================================= */
  renewals: any[] = [];
  renewalRequestsOpen = false;
  renewalTab: 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NEW';
  
  loadingRenewals = false;
  
  showCompleteRenewalModal = false;
  selectedRenewalId: number | null = null;
  renewalFile: File | null = null;
  renewalFileName = '';
  renewalDocNumber = '';
  renewalProvider = '';
  renewalIssueDate = '';
  renewalExpiryDate = '';
  renewalNotes = '';
  submittingRenewalComplete = false;

  loadRenewals(): void {
    this.loadingRenewals = true;
    let apiStatus = '';
    
    if (this.renewalTab === 'NEW') apiStatus = 'AVAILABLE';
    else if (this.renewalTab === 'ACCEPTED' || this.renewalTab === 'IN_PROGRESS') apiStatus = 'ACTIVE';
    else apiStatus = 'COMPLETED';

    this.renewalService.getRequests(apiStatus).subscribe({
      next: (res: any) => {
        if (this.renewalTab === 'ACCEPTED') {
          this.renewals = res.requests.filter((r: any) => r.status === 'ACCEPTED');
        } else if (this.renewalTab === 'IN_PROGRESS') {
          this.renewals = res.requests.filter((r: any) => r.status === 'IN_PROGRESS');
        } else {
          this.renewals = res.requests;
        }
        this.loadingRenewals = false;
      },
      error: () => {
        this.loadingRenewals = false;
      }
    });
  }

  setRenewalTab(tab: 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'): void {
    this.renewalTab = tab;
    this.loadRenewals();
  }

  acceptRenewal(id: number): void {
    this.renewalService.acceptRequest(id).subscribe({
      next: () => {
        this.toast.show('Renewal request accepted.', 'success');
        this.setRenewalTab('ACCEPTED');
      },
      error: () => {
        this.toast.show('Failed to accept request.', 'error');
      }
    });
  }

  startRenewal(id: number): void {
    this.renewalService.updateStatus(id, 'IN_PROGRESS').subscribe({
      next: () => {
        this.toast.show('Renewal started.', 'success');
        this.setRenewalTab('IN_PROGRESS');
      },
      error: () => {
        this.toast.show('Failed to start renewal.', 'error');
      }
    });
  }

  declineRenewal(id: number): void {
    if (!confirm('Are you sure you want to decline this request?')) return;
    this.renewalService.updateStatus(id, 'DECLINED').subscribe({
      next: () => {
        this.toast.show('Request declined.', 'success');
        this.loadRenewals();
      },
      error: () => {
        this.toast.show('Failed to decline request.', 'error');
      }
    });
  }

  openCompleteModal(id: number): void {
    this.selectedRenewalId = id;
    this.showCompleteRenewalModal = true;
    this.renewalFile = null;
    this.renewalFileName = '';
    this.renewalDocNumber = '';
    this.renewalProvider = '';
    this.renewalIssueDate = '';
    this.renewalExpiryDate = '';
    this.renewalNotes = '';
  }

  closeCompleteModal(): void {
    this.showCompleteRenewalModal = false;
    this.selectedRenewalId = null;
  }

  onRenewalFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.renewalFile = file;
      this.renewalFileName = file.name;
    }
  }

  submitCompleteRenewal(): void {
    if (!this.selectedRenewalId || !this.renewalFile) {
      this.toast.show('Please select a document file.', 'error');
      return;
    }

    this.submittingRenewalComplete = true;
    const formData = new FormData();
    formData.append('documentFile', this.renewalFile);
    formData.append('documentNumber', this.renewalDocNumber);
    formData.append('provider', this.renewalProvider);
    formData.append('issueDate', this.renewalIssueDate);
    formData.append('expiryDate', this.renewalExpiryDate);
    formData.append('notes', this.renewalNotes);

    this.renewalService.completeRenewal(this.selectedRenewalId, formData).subscribe({
      next: () => {
        this.submittingRenewalComplete = false;
        this.toast.show('Renewal completed successfully.', 'success');
        this.closeCompleteModal();
        this.setRenewalTab('COMPLETED');
      },
      error: (err: any) => {
        this.submittingRenewalComplete = false;
        this.toast.show(err?.error?.message || 'Failed to complete renewal.', 'error');
      }
    });
  }
`;

if (!content.includes('RENEWALS STATE')) {
    content = content.replace("  ngOnInit(): void {", state_vars + "\n  ngOnInit(): void {");
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched expert-dashboard.ts");
} else {
    console.log("Already patched expert-dashboard.ts");
}
