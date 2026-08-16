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
  selector: 'app-expert-dashboard',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl:
    './expert-dashboard.html',

  styleUrl:
    './expert-dashboard.css'
})
export class ExpertDashboard
  implements OnInit {

  private readonly router =
    inject(Router);


  private readonly authService =
    inject(AuthService);


  currentUser:
    AuthenticatedUser |
    null = null;


  firstName =
    'Expert';


  mobileSidebarOpen =
    false;


  /*
    These are dashboard placeholders for now.

    We will connect them to the Diagnostic
    Request API later.
  */

  pendingRequests =
    0;


  acceptedCases =
    0;


  activeCases =
    0;


  completedReports =
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
        'DIAGNOSTIC_EXPERT'
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

      return 'Expert';

    }


    return (
      cleanName
        .split(/\s+/)[0] ??
      'Expert'
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