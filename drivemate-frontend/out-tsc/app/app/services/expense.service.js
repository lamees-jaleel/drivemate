import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
/* =========================================================
   SERVICE
========================================================= */
let ExpenseService = class ExpenseService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api/vehicles';
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
       GET EXPENSES
    ======================================================= */
    getExpenses(vehicleId) {
        return this.http
            .get(`${this.baseUrl}/${vehicleId}/expenses`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       ADD EXPENSE
    ======================================================= */
    addExpense(vehicleId, payload) {
        return this.http
            .post(`${this.baseUrl}/${vehicleId}/expenses`, payload, {
            headers: this.getAuthHeaders()
        });
    }
};
ExpenseService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ExpenseService);
export { ExpenseService };
