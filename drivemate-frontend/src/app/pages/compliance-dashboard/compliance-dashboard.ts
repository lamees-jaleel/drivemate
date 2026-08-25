import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  CommonModule
} from '@angular/common';

import {
  AuthenticatedUser,
  AuthService
} from '../../services/auth.service';

import {
  ComplianceService
} from '../../services/compliance.service';


@Component({
  selector: 'app-compliance-dashboard',

  standalone: true,

  imports: [
    RouterLink,
    FormsModule,
    CommonModule
  ],

  templateUrl:
    './compliance-dashboard.html',

  styleUrl:
    './compliance-dashboard.css'
})
export class ComplianceDashboard
  implements OnInit {

  private readonly router =
    inject(Router);


  private readonly authService =
    inject(AuthService);


  private readonly complianceService =
    inject(ComplianceService);


  currentUser:
    AuthenticatedUser |
    null = null;


  firstName =
    'Advisor';


  mobileSidebarOpen =
    false;


  currentTab = 'DASHBOARD'; // DASHBOARD, REVIEWS, EXPIRY, VEHICLE_DOCUMENTS, REPORTS, PROFILE


  /* =======================================================
     COMPLIANCE METRICS
     ======================================================= */

  pendingReviews = 0;

  expiringDocuments = 0;

  activeCases = 0;

  completedAdvisories = 0;


  /* =======================================================
     WORKSPACE STATE
     ======================================================= */

  loading = false;

  documents: any[] = [];

  selectedDocument: any = null;

  reviewStatus = 'APPROVED';

  reviewNote = '';

  submittingReview = false;

  errorMessage = '';

  successMessage = '';


  ngOnInit(): void {

    this.loadCurrentUser();

    this.loadStats();

  }


  /* =======================================================
     CURRENT USER
     ======================================================= */

  private loadCurrentUser():
    void {

    if (
      !this.authService
        .isLoggedIn()
    ) {

      this.router.navigate(
        [
          '/login'
        ]
      );

      return;

    }


    const user =
      this.authService
        .getUser();


    if (
      !user ||
      user.role !==
        'COMPLIANCE_ADVISOR'
    ) {

      this.router.navigate(
        [
          '/'
        ]
      );

      return;

    }


    this.currentUser =
      user;


    this.firstName =
      this.extractFirstName(
        user.fullName
      );

  }


  /* =======================================================
     FIRST NAME
     ======================================================= */

  private extractFirstName(
    fullName: string
  ): string {

    const cleanName =
      fullName.trim();


    if (!cleanName) {

      return 'Advisor';

    }


    return (
      cleanName
        .split(/\s+/)[0] ??
      'Advisor'
    );

  }


  /* =======================================================
     LOAD COMPLIANCE STATS
     ======================================================= */

  loadStats(): void {

    this.complianceService.getStats().subscribe({

      next: (res) => {
        if (res.success && res.stats) {
          this.pendingReviews = res.stats.pendingReviews;
          this.expiringDocuments = res.stats.expiringDocuments;
          this.activeCases = res.stats.activeCases;
          this.completedAdvisories = res.stats.completedAdvisories;
        }
      },

      error: (err) => {
        console.error('Error fetching compliance stats:', err);
      }

    });

  }


  /* =======================================================
     TAB WORKSPACE SWITCHER
     ======================================================= */

  switchTab(tab: string): void {

    this.currentTab = tab;

    this.closeReviewPanel();

    this.mobileSidebarOpen = false;


    if (tab === 'DASHBOARD') {

      this.loadStats();

    } else if (tab === 'REVIEWS') {

      this.loadDocuments('PENDING');

    } else if (tab === 'EXPIRY') {

      // We load all documents and will filter in template for EXPIRING_SOON/EXPIRED
      this.loadDocuments();

    } else if (tab === 'VEHICLE_DOCUMENTS') {

      this.loadDocuments();

    } else if (tab === 'REPORTS') {

      // Advisory reports show approved and rejected reviews
      this.loadDocuments();

    }

  }


  /* =======================================================
     LOAD DOCUMENTS
     ======================================================= */

  loadDocuments(status?: string): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.complianceService.getDocuments(status).subscribe({

      next: (res) => {
        this.documents = res.documents || [];
        this.loading = false;
      },

      error: (err) => {
        console.error('Error loading documents:', err);
        this.errorMessage = err.error?.message || 'Unable to fetch vehicle documents.';
        this.loading = false;
      }

    });

  }


  /* =======================================================
     SELECT DOCUMENT FOR REVIEW
     ======================================================= */

  selectDocument(doc: any): void {

    this.selectedDocument = doc;

    this.reviewStatus = 'APPROVED';

    this.reviewNote = doc.verificationNote || '';

    this.errorMessage = '';

    this.successMessage = '';

  }


  closeReviewPanel(): void {

    this.selectedDocument = null;

    this.reviewNote = '';

  }


  /* =======================================================
     SUBMIT REVIEW
     ======================================================= */

  submitReview(): void {

    if (!this.selectedDocument) {

      return;

    }


    this.submittingReview = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.complianceService.reviewDocument(

      this.selectedDocument.id,

      this.reviewStatus,

      this.reviewNote.trim()

    ).subscribe({

      next: (res) => {
        this.submittingReview = false;
        this.successMessage = res.message || 'Review submitted successfully!';
        this.loadStats();
        
        // Refresh the document list based on current workspace tab
        if (this.currentTab === 'REVIEWS') {
          this.loadDocuments('PENDING');
        } else {
          this.loadDocuments();
        }

        // Close the panel after short timeout to let user see success
        setTimeout(() => {
          this.closeReviewPanel();
        }, 1500);
      },

      error: (err) => {
        this.submittingReview = false;
        this.errorMessage = err.error?.message || 'Failed to submit review.';
      }

    });

  }


  /* =======================================================
     SIDEBAR
     ======================================================= */

  toggleSidebar():
    void {

    this.mobileSidebarOpen =
      !this.mobileSidebarOpen;

  }


  closeSidebar():
    void {

    this.mobileSidebarOpen =
      false;

  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  logout():
    void {

    this.authService
      .clearSession();


    this.router.navigate(
      [
        '/login'
      ]
    );

  }

}