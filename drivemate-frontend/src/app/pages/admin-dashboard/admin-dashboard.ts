import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  CommonModule
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthenticatedUser,
  AuthService
} from '../../services/auth.service';

import {
  AdminService,
  ProfessionalProfile,
  ProfessionalVerificationStatus
} from '../../services/admin.service';


@Component({
  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],

  templateUrl:
    './admin-dashboard.html',

  styleUrl:
    './admin-dashboard.css'
})
export class AdminDashboard
  implements OnInit {

  private readonly router =
    inject(Router);


  private readonly authService =
    inject(AuthService);


  private readonly adminService =
    inject(AdminService);


  currentUser:
    AuthenticatedUser |
    null = null;


  firstName =
    'Admin';


  professionals:
    ProfessionalProfile[] = [];


  selectedProfessional:
    ProfessionalProfile |
    null = null;


  currentFilter:
    ProfessionalVerificationStatus |
    'ALL' = 'PENDING';


  pendingCount =
    0;


  approvedCount =
    0;


  rejectedCount =
    0;


  loading =
    true;


  detailsLoading =
    false;


  reviewing =
    false;


  errorMessage =
    '';


  successMessage =
    '';


  reviewNote =
    '';


  rejectionMode =
    false;


  mobileSidebarOpen =
    false;


  currentTab = 'VERIFICATIONS'; // VERIFICATIONS, USER_MANAGEMENT, SYSTEM_REPORTS


  /* =======================================================
     USER MANAGEMENT & REPORTS STATE
     ======================================================= */

  users: any[] = [];

  selectedUser: any = null;

  loadingUsers = false;

  userFilter = 'ALL';

  updatingUserStatus = false;

  reports: any = null;

  loadingReports = false;


  /* =======================================================
     INITIALIZE
  ======================================================= */

  ngOnInit(): void {

    this.loadCurrentUser();

    this.loadProfessionals(
      'PENDING'
    );

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
        'ADMIN'
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
     LOAD PROFESSIONALS
  ======================================================= */

  loadProfessionals(
    filter:
      ProfessionalVerificationStatus |
      'ALL'
  ): void {

    this.loading =
      true;


    this.errorMessage =
      '';


    this.successMessage =
      '';


    this.currentFilter =
      filter;


    this.selectedProfessional =
      null;


    this.rejectionMode =
      false;


    this.reviewNote =
      '';


    const status =
      filter === 'ALL'
        ? undefined
        : filter;


    this.adminService
      .getProfessionals(
        status
      )
      .subscribe({

        next: response => {

          this.professionals =
            response.professionals;


          this.pendingCount =
            response.summary.pending;


          this.approvedCount =
            response.summary.approved;


          this.rejectedCount =
            response.summary.rejected;


          this.loading =
            false;

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loading =
            false;


          console.error(
            'Unable to load professional applications:',
            error
          );


          if (
            error.status ===
            401
          ) {

            this.authService
              .clearSession();


            this.router.navigate(
              [
                '/login'
              ]
            );


            return;

          }


          if (
            error.status ===
            403
          ) {

            this.router.navigate(
              [
                '/'
              ]
            );


            return;

          }


          this.errorMessage =
            error.error?.message ||
            'Unable to load professional applications.';

        }

      });

  }


  /* =======================================================
     SELECT PROFESSIONAL
  ======================================================= */

  selectProfessional(
    profile:
      ProfessionalProfile
  ): void {

    this.detailsLoading =
      true;


    this.errorMessage =
      '';


    this.successMessage =
      '';


    this.rejectionMode =
      false;


    this.reviewNote =
      '';


    this.adminService
      .getProfessionalById(
        profile.id
      )
      .subscribe({

        next: response => {

          this.selectedProfessional =
            response.professional;


          this.detailsLoading =
            false;

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.detailsLoading =
            false;


          console.error(
            'Unable to load professional details:',
            error
          );


          this.errorMessage =
            error.error?.message ||
            'Unable to load application details.';

        }

      });

  }


  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  closeDetails():
    void {

    this.selectedProfessional =
      null;


    this.reviewNote =
      '';


    this.rejectionMode =
      false;


    this.errorMessage =
      '';


    this.successMessage =
      '';

  }


  /* =======================================================
     APPROVE
  ======================================================= */

  approveSelected():
    void {

    if (
      !this.selectedProfessional ||
      this.reviewing
    ) {

      return;

    }


    if (
      this.selectedProfessional
        .verificationStatus !==
      'PENDING'
    ) {

      return;

    }


    this.reviewing =
      true;


    this.errorMessage =
      '';


    this.successMessage =
      '';


    this.adminService
      .approveProfessional(

        this.selectedProfessional.id,

        this.reviewNote.trim()

      )
      .subscribe({

        next: response => {

          this.reviewing =
            false;


          this.successMessage =
            response.message;


          this.selectedProfessional =
            null;


          this.reviewNote =
            '';


          this.rejectionMode =
            false;


          this.refreshCurrentFilter();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.reviewing =
            false;


          console.error(
            'Approve professional failed:',
            error
          );


          this.errorMessage =
            error.error?.message ||
            'Unable to approve professional account.';

        }

      });

  }


  /* =======================================================
     REJECTION MODE
  ======================================================= */

  startReject():
    void {

    this.rejectionMode =
      true;


    this.reviewNote =
      '';


    this.errorMessage =
      '';


    this.successMessage =
      '';

  }


  cancelReject():
    void {

    this.rejectionMode =
      false;


    this.reviewNote =
      '';


    this.errorMessage =
      '';

  }


  /* =======================================================
     REJECT
  ======================================================= */

  rejectSelected():
    void {

    if (
      !this.selectedProfessional ||
      this.reviewing
    ) {

      return;

    }


    const note =
      this.reviewNote
        .trim();


    if (!note) {

      this.errorMessage =
        'Please enter a reason for rejection.';


      return;

    }


    if (
      note.length >
      500
    ) {

      this.errorMessage =
        'Rejection reason must not exceed 500 characters.';


      return;

    }


    this.reviewing =
      true;


    this.errorMessage =
      '';


    this.successMessage =
      '';


    this.adminService
      .rejectProfessional(

        this.selectedProfessional.id,

        note

      )
      .subscribe({

        next: response => {

          this.reviewing =
            false;


          this.successMessage =
            response.message;


          this.selectedProfessional =
            null;


          this.reviewNote =
            '';


          this.rejectionMode =
            false;


          this.refreshCurrentFilter();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.reviewing =
            false;


          console.error(
            'Reject professional failed:',
            error
          );


          this.errorMessage =
            error.error?.message ||
            'Unable to reject professional account.';

        }

      });

  }


  /* =======================================================
     REFRESH
  ======================================================= */

  private refreshCurrentFilter():
    void {

    const filter =
      this.currentFilter;


    this.adminService
      .getProfessionals(
        filter === 'ALL'
          ? undefined
          : filter
      )
      .subscribe({

        next: response => {

          this.professionals =
            response.professionals;


          this.pendingCount =
            response.summary.pending;


          this.approvedCount =
            response.summary.approved;


          this.rejectedCount =
            response.summary.rejected;


          this.loading =
            false;

        },


        error: error => {

          console.error(
            'Unable to refresh admin dashboard:',
            error
          );

        }

      });

  }


  /* =======================================================
     LABELS
  ======================================================= */

  getRoleLabel(
    role: string
  ): string {

    switch (role) {

      case 'DIAGNOSTIC_EXPERT':

        return 'Automotive Diagnostic Expert';


      case 'COMPLIANCE_ADVISOR':

        return 'Insurance & Compliance Advisor';


      case 'ROADSIDE_RESPONDER':

        return 'Roadside Assistance Responder';


      default:

        return role;

    }

  }


  getStatusLabel(
    status:
      ProfessionalVerificationStatus
  ): string {

    switch (status) {

      case 'APPROVED':

        return 'Approved';


      case 'REJECTED':

        return 'Rejected';


      default:

        return 'Pending Review';

    }

  }


  getStatusClass(
    status:
      ProfessionalVerificationStatus
  ): string {

    switch (status) {

      case 'APPROVED':

        return 'status-approved';


      case 'REJECTED':

        return 'status-rejected';


      default:

        return 'status-pending';

    }

  }


  /* =======================================================
     DATE
  ======================================================= */

  formatDate(
    value:
      string |
      null |
      undefined
  ): string {

    if (!value) {

      return 'Not available';

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return 'Not available';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit'
      }
    ).format(
      date
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

      return 'Admin';

    }


    return (
      cleanName
        .split(/\s+/)[0] ??
      'Admin'
    );

  }


  /* =======================================================
     MOBILE SIDEBAR
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
     TAB WORKSPACE SWITCHER
     ======================================================= */

  switchTab(tab: string): void {
    this.currentTab = tab;
    this.closeDetails();
    this.mobileSidebarOpen = false;

    if (tab === 'VERIFICATIONS') {
      this.loadProfessionals('PENDING');
    } else if (tab === 'USER_MANAGEMENT') {
      this.loadUsers();
    } else if (tab === 'SYSTEM_REPORTS') {
      this.loadReports();
    }
  }


  /* =======================================================
     USER MANAGEMENT METHODS
     ======================================================= */

  loadUsers(role?: string): void {
    this.loadingUsers = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (role) {
      this.userFilter = role;
    }

    const roleArg = this.userFilter === 'ALL' ? undefined : this.userFilter;

    this.adminService.getUsers(roleArg).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = err.error?.message || 'Unable to fetch users.';
        this.loadingUsers = false;
      }
    });
  }

  toggleUserStatus(user: any): void {
    const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    if (!confirm(`Are you sure you want to change this user's account status to ${newStatus.toLowerCase()}?`)) {
      return;
    }

    this.updatingUserStatus = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: (res) => {
        this.updatingUserStatus = false;
        this.successMessage = res.message || 'User status updated successfully!';
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating user status:', err);
        this.errorMessage = err.error?.message || 'Unable to update status.';
        this.updatingUserStatus = false;
      }
    });
  }


  /* =======================================================
     SYSTEM REPORTS METHODS
     ======================================================= */

  loadReports(): void {
    this.loadingReports = true;
    this.errorMessage = '';

    this.adminService.getSystemReports().subscribe({
      next: (res) => {
        this.reports = res.summary;
        this.loadingReports = false;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
        this.errorMessage = err.error?.message || 'Unable to fetch reports.';
        this.loadingReports = false;
      }
    });
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