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
  selector: 'app-responder-dashboard',

  standalone: true,

  imports: [
    RouterLink
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


  currentUser:
    AuthenticatedUser |
    null = null;


  firstName =
    'Responder';


  mobileSidebarOpen =
    false;


  /*
    Dashboard placeholders only.

    Roadside Assistance APIs,
    maps and GPS will be connected later.
  */

  availableRequests =
    0;


  activeAssistance =
    0;


  completedRequests =
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