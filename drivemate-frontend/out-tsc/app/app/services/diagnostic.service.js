import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
let DiagnosticService = class DiagnosticService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api';
    getAuthHeaders() {
        const token = this.authService
            .getToken();
        return new HttpHeaders({
            Authorization: token ?
                `Bearer ${token}` :
                ''
        });
    }
    /* =======================================================
       OWNER BOOKING METHODS
    ======================================================= */
    bookSlot(vehicleId, payload) {
        return this.http
            .post(`${this.baseUrl}/vehicles/${vehicleId}/diagnostics`, payload, {
            headers: this.getAuthHeaders()
        });
    }
    getVehicleRequests(vehicleId) {
        return this.http
            .get(`${this.baseUrl}/vehicles/${vehicleId}/diagnostics`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       EXPERT / SERVICE PROVIDER METHODS
    ======================================================= */
    getExpertRequests(status) {
        return this.http
            .get(`${this.baseUrl}/diagnostics/expert`, {
            params: { status },
            headers: this.getAuthHeaders()
        });
    }
    acceptRequest(id) {
        return this.http
            .put(`${this.baseUrl}/diagnostics/expert/${id}/accept`, {}, {
            headers: this.getAuthHeaders()
        });
    }
    updateStatus(id, status) {
        return this.http
            .put(`${this.baseUrl}/diagnostics/expert/${id}/status`, { status }, {
            headers: this.getAuthHeaders()
        });
    }
    submitReport(id, reportData) {
        return this.http.post(`${this.baseUrl}/diagnostics/expert/${id}/report`, reportData, {
            headers: this.getAuthHeaders()
        });
    }
};
DiagnosticService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], DiagnosticService);
export { DiagnosticService };
