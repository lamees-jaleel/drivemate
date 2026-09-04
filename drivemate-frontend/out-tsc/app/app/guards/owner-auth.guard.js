import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
/* =========================================================
   VEHICLE OWNER ROUTE GUARD
========================================================= */
export const ownerAuthGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    /* =======================================================
       NOT LOGGED IN
    ======================================================= */
    if (!authService.isLoggedIn()) {
        return router.createUrlTree([
            '/login'
        ]);
    }
    /* =======================================================
       WRONG ROLE
    ======================================================= */
    if (!authService.hasRole('VEHICLE_OWNER')) {
        return router.createUrlTree([
            '/'
        ]);
    }
    /* =======================================================
       VEHICLE OWNER
    ======================================================= */
    return true;
};
