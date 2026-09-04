import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
let RoadsideService = class RoadsideService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api/roadside';
    getAuthHeaders() {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`
        });
    }
    /* =======================================================
       OWNER METHODS
       ======================================================= */
    createRequest(requestData) {
        return this.http.post(`${this.baseUrl}/requests`, requestData, {
            headers: this.getAuthHeaders()
        });
    }
    getActiveRequest() {
        return this.http.get(`${this.baseUrl}/requests/active`, {
            headers: this.getAuthHeaders()
        });
    }
    getOwnerHistory() {
        return this.http.get(`${this.baseUrl}/requests/history`, {
            headers: this.getAuthHeaders()
        });
    }
    cancelRequest(id) {
        return this.http.delete(`${this.baseUrl}/requests/${id}`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       RESPONDER METHODS
       ======================================================= */
    getAvailableRequests() {
        return this.http.get(`${this.baseUrl}/responder/available`, {
            headers: this.getAuthHeaders()
        });
    }
    getActiveAssistance() {
        return this.http.get(`${this.baseUrl}/responder/active`, {
            headers: this.getAuthHeaders()
        });
    }
    getCompletedRequests() {
        return this.http.get(`${this.baseUrl}/responder/completed`, {
            headers: this.getAuthHeaders()
        });
    }
    acceptRequest(id) {
        return this.http.patch(`${this.baseUrl}/responder/requests/${id}/accept`, {}, {
            headers: this.getAuthHeaders()
        });
    }
    updateStatus(id, status) {
        return this.http.patch(`${this.baseUrl}/responder/requests/${id}/status`, { status }, {
            headers: this.getAuthHeaders()
        });
    }
};
RoadsideService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], RoadsideService);
export { RoadsideService };
