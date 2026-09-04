import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
/* =========================================================
   SERVICE
========================================================= */
let DocumentService = class DocumentService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api/vehicles';
    /* =======================================================
       AUTH
    ======================================================= */
    getAuthHeaders() {
        const token = this.authService
            .getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`
        });
    }
    /* =======================================================
       GET DOCUMENTS
    ======================================================= */
    getDocuments(vehicleId) {
        return this.http
            .get(`${this.baseUrl}/${vehicleId}/documents`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       ADD DOCUMENT
    ======================================================= */
    addDocument(vehicleId, formData) {
        /*
          Do NOT manually set Content-Type.
    
          The browser automatically creates
          the multipart/form-data boundary.
        */
        return this.http
            .post(`${this.baseUrl}/${vehicleId}/documents`, formData, {
            headers: this.getAuthHeaders()
        });
    }
};
DocumentService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], DocumentService);
export { DocumentService };
