import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth.service';


/* =========================================================
   ROLE DASHBOARD ROUTES
========================================================= */

const ROLE_DASHBOARDS:
  Record<string, string> = {

  VEHICLE_OWNER:
    '/owner-dashboard',

  DIAGNOSTIC_EXPERT:
    '/expert-dashboard',

  COMPLIANCE_ADVISOR:
    '/compliance-dashboard',

  ROADSIDE_RESPONDER:
    '/responder-dashboard',

  ADMIN:
    '/admin-dashboard'

};


/* =========================================================
   ROLE AUTH GUARD
========================================================= */

export const roleAuthGuard:
  CanActivateFn = (
    route
  ) => {

    const authService =
      inject(AuthService);


    const router =
      inject(Router);


    /* =====================================================
       NOT LOGGED IN
    ===================================================== */

    if (
      !authService.isLoggedIn()
    ) {

      return router
        .createUrlTree(
          [
            '/login'
          ]
        );

    }


    /* =====================================================
       LOAD CURRENT USER
    ===================================================== */

    const user =
      authService.getUser();


    if (!user) {

      authService
        .clearSession();


      return router
        .createUrlTree(
          [
            '/login'
          ]
        );

    }


    /* =====================================================
       REQUIRED ROLE FROM ROUTE DATA
    ===================================================== */

    const requiredRole =
      route.data?.['role'] as
        string |
        undefined;


    /*
      If a route accidentally uses this
      guard without specifying a role,
      deny access instead of allowing it.
    */

    if (!requiredRole) {

      return router
        .createUrlTree(
          [
            '/'
          ]
        );

    }


    /* =====================================================
       CORRECT ROLE
    ===================================================== */

    if (
      user.role ===
      requiredRole
    ) {

      return true;

    }


    /* =====================================================
       WRONG ROLE

       Redirect the logged-in user back
       to their own dashboard.
    ===================================================== */

    const dashboard =
      ROLE_DASHBOARDS[
        user.role
      ];


    if (dashboard) {

      return router
        .createUrlTree(
          [
            dashboard
          ]
        );

    }


    /* =====================================================
       UNKNOWN ROLE
    ===================================================== */

    return router
      .createUrlTree(
        [
          '/'
        ]
      );

  };