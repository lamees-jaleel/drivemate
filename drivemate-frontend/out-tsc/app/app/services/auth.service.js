import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
/* =========================================================
   AUTH SERVICE
========================================================= */
let AuthService = class AuthService {
    /* =======================================================
       GET TOKEN
    ======================================================= */
    getToken() {
        return (localStorage.getItem('drivemate_token') ??
            sessionStorage.getItem('drivemate_token'));
    }
    /* =======================================================
       GET USER
    ======================================================= */
    getUser() {
        const storedUser = localStorage.getItem('drivemate_user') ??
            sessionStorage.getItem('drivemate_user');
        if (!storedUser) {
            return null;
        }
        try {
            return JSON.parse(storedUser);
        }
        catch {
            this.clearSession();
            return null;
        }
    }
    /* =======================================================
       IS LOGGED IN
    ======================================================= */
    isLoggedIn() {
        const token = this.getToken();
        const user = this.getUser();
        return Boolean(token &&
            user);
    }
    /* =======================================================
       CHECK ROLE
    ======================================================= */
    hasRole(requiredRole) {
        const user = this.getUser();
        return (user?.role ===
            requiredRole);
    }
    /* =======================================================
       SAVE SESSION
  
       We can also reuse this from login.ts later.
    ======================================================= */
    saveSession(token, user, rememberMe) {
        this.clearSession();
        const storage = rememberMe
            ? localStorage
            : sessionStorage;
        storage.setItem('drivemate_token', token);
        storage.setItem('drivemate_user', JSON.stringify(user));
    }
    /* =======================================================
       CLEAR SESSION
    ======================================================= */
    clearSession() {
        localStorage.removeItem('drivemate_token');
        localStorage.removeItem('drivemate_user');
        sessionStorage.removeItem('drivemate_token');
        sessionStorage.removeItem('drivemate_user');
    }
};
AuthService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthService);
export { AuthService };
