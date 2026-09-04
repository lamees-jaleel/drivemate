import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
let ComplianceService = class ComplianceService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api/compliance';
    getAuthHeaders() {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`
        });
    }
    getDocuments(status) {
        const url = status ? `${this.baseUrl}/documents?status=${status}` : `${this.baseUrl}/documents`;
        return this.http.get(url, {
            headers: this.getAuthHeaders()
        });
    }
    reviewDocument(id, status, note) {
        return this.http.patch(`${this.baseUrl}/documents/${id}/review`, { status, note }, {
            headers: this.getAuthHeaders()
        });
    }
    getStats() {
        return this.http.get(`${this.baseUrl}/stats`, {
            headers: this.getAuthHeaders()
        });
    }
};
ComplianceService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ComplianceService);
export { ComplianceService };
