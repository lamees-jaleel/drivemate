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
  AuthenticatedUser,
  AuthService
} from '../../services/auth.service';


@Component({
  selector: 'app-compliance-dashboard',

  standalone: true,

  imports: [
    RouterLink
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


  currentUser:
    AuthenticatedUser |
    null = null;


  firstName =
    'Advisor';


  mobileSidebarOpen =
    false;


  /*
    Placeholder counters.

    We will connect these to the
    Compliance Advisor APIs later.
  */

  pendingReviews =
    0;


  expiringDocuments =
    0;


  activeCases =
    0;


  completedAdvisories =
    0;


  ngOnInit(): void {

    this.loadCurrentUser();

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