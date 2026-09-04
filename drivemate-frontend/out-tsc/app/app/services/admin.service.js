import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
/* =========================================================
   SERVICE
========================================================= */
let AdminService = class AdminService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api/admin';
    /* =======================================================
       AUTH HEADERS
    ======================================================= */
    getAuthHeaders() {
        const token = this.authService
            .getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`
        });
    }
    /* =======================================================
       GET PROFESSIONALS
    ======================================================= */
    getProfessionals(status) {
        const url = status
            ? `${this.baseUrl}/professionals?status=${status}`
            : `${this.baseUrl}/professionals`;
        return this.http
            .get(url, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       GET ONE PROFESSIONAL
    ======================================================= */
    getProfessionalById(profileId) {
        return this.http
            .get(`${this.baseUrl}/professionals/${profileId}`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       APPROVE
    ======================================================= */
    approveProfessional(profileId, note = '') {
        return this.http
            .patch(`${this.baseUrl}/professionals/${profileId}/approve`, {
            note
        }, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       REJECT
    ======================================================= */
    rejectProfessional(profileId, note) {
        return this.http
            .patch(`${this.baseUrl}/professionals/${profileId}/reject`, {
            note
        }, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       USER MANAGEMENT & REPORTS
       ======================================================= */
    getUsers(role) {
        const url = role ? `${this.baseUrl}/users?role=${role}` : `${this.baseUrl}/users`;
        return this.http.get(url, {
            headers: this.getAuthHeaders()
        });
    }
    updateUserStatus(userId, status) {
        return this.http.patch(`${this.baseUrl}/users/${userId}/status`, { status }, {
            headers: this.getAuthHeaders()
        });
    }
    getSystemReports() {
        return this.http.get(`${this.baseUrl}/reports`, {
            headers: this.getAuthHeaders()
        });
    }
};
AdminService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AdminService);
export { AdminService };
