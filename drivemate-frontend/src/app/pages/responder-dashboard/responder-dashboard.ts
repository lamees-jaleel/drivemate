import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  Router
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
  RoadsideService
} from '../../services/roadside.service';


@Component({
  selector: 'app-responder-dashboard',

  standalone: true,

  imports: [
    FormsModule,
    CommonModule
  ],

  templateUrl:
    './responder-dashboard.html',

  styleUrl:
    './responder-dashboard.css'
})
export class ResponderDashboard
  implements OnInit {

  private readonly router =
    inject(Router);


  private readonly authService =
    inject(AuthService);


  private readonly roadsideService =
    inject(RoadsideService);


  currentUser:
    AuthenticatedUser |
    null = null;


  firstName =
    'Responder';


  mobileSidebarOpen =
    false;


  currentTab = 'DASHBOARD'; // DASHBOARD, REQUESTS, NAVIGATION, ACTIVE, COMPLETED, PROFILE


  /* =======================================================
     RESPONDER METRICS
     ======================================================= */

  availableRequests = 0;

  activeAssistance = 0;

  completedRequests = 0;


  /* =======================================================
     WORKSPACE STATE
     ======================================================= */

  loading = false;

  requests: any[] = [];

  selectedRequest: any = null;

  successMessage = '';

  errorMessage = '';

  completingRequest = false;

  completionNote = '';


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
        'ROADSIDE_RESPONDER'
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

      return 'Responder';

    }


    return (
      cleanName
        .split(/\s+/)[0] ??
      'Responder'
    );

  }


  /* =======================================================
     LOAD METRICS / STATS
     ======================================================= */

  loadStats(): void {

    this.roadsideService.getAvailableRequests().subscribe({
      next: (res) => {
        this.availableRequests = res.requests?.length || 0;
      },
      error: (err) => console.error('Error available requests:', err)
    });

    this.roadsideService.getActiveAssistance().subscribe({
      next: (res) => {
        this.activeAssistance = res.requests?.length || 0;
      },
      error: (err) => console.error('Error active assistance:', err)
    });

    this.roadsideService.getCompletedRequests().subscribe({
      next: (res) => {
        this.completedRequests = res.requests?.length || 0;
      },
      error: (err) => console.error('Error completed requests:', err)
    });

  }


  /* =======================================================
     WORKSPACE TAB SWITCHER
     ======================================================= */

  switchTab(tab: string): void {

    this.currentTab = tab;

    this.selectedRequest = null;

    this.mobileSidebarOpen = false;

    this.errorMessage = '';

    this.successMessage = '';


    if (tab === 'DASHBOARD') {

      this.loadStats();

    } else if (tab === 'REQUESTS') {

      this.loadRequests('AVAILABLE');

    } else if (tab === 'ACTIVE') {

      this.loadRequests('ACTIVE');

    } else if (tab === 'COMPLETED') {

      this.loadRequests('COMPLETED');

    } else if (tab === 'NAVIGATION') {

      // For live GPS navigation, fetch active requests to navigate to
      this.loadRequests('ACTIVE');

    }

  }


  /* =======================================================
     LOAD REQUESTS
     ======================================================= */

  loadRequests(type: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED'): void {

    this.loading = true;

    this.errorMessage = '';


    let reqObservable;

    if (type === 'AVAILABLE') {

      reqObservable = this.roadsideService.getAvailableRequests();

    } else if (type === 'ACTIVE') {

      reqObservable = this.roadsideService.getActiveAssistance();

    } else {

      reqObservable = this.roadsideService.getCompletedRequests();

    }


    reqObservable.subscribe({

      next: (res) => {
        this.requests = res.requests || [];
        this.loading = false;
        this.loadStats();
      },

      error: (err) => {
        console.error('Error loading requests:', err);
        this.errorMessage = err.error?.message || 'Unable to fetch requests.';
        this.loading = false;
      }

    });

  }


  /* =======================================================
     ACCEPT REQUEST
     ======================================================= */

  acceptRequest(id: number): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.roadsideService.acceptRequest(id).subscribe({

      next: (res) => {
        this.successMessage = res.message || 'Emergency request accepted successfully!';
        this.loadStats();
        this.switchTab('ACTIVE');
      },

      error: (err) => {
        console.error('Error accepting request:', err);
        this.errorMessage = err.error?.message || 'Unable to accept request.';
      }

    });

  }


  /* =======================================================
     START ASSISTANCE (MARK IN_PROGRESS)
     ======================================================= */

  startAssistance(id: number): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.roadsideService.updateStatus(id, 'IN_PROGRESS').subscribe({

      next: (res) => {
        this.successMessage = 'Assistance started. Status is now In Progress.';
        this.loadRequests('ACTIVE');
      },

      error: (err) => {
        console.error('Error starting assistance:', err);
        this.errorMessage = err.error?.message || 'Unable to update status.';
      }

    });

  }


  /* =======================================================
     COMPLETE ASSISTANCE (MARK COMPLETED)
     ======================================================= */

  completeAssistance(id: number): void {

    this.errorMessage = '';

    this.successMessage = '';


    this.roadsideService.updateStatus(id, 'COMPLETED').subscribe({

      next: (res) => {
        this.successMessage = 'Roadside assistance operation completed successfully!';
        this.loadStats();
        this.switchTab('COMPLETED');
      },

      error: (err) => {
        console.error('Error completing request:', err);
        this.errorMessage = err.error?.message || 'Unable to complete request.';
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