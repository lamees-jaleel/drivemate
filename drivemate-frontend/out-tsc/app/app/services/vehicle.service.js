import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
/* =========================================================
   VEHICLE SERVICE
========================================================= */
let VehicleService = class VehicleService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    apiUrl = 'http://localhost:5000/api/vehicles';
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
       ADD VEHICLE
    ======================================================= */
    addVehicle(payload) {
        return this.http
            .post(this.apiUrl, payload, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       UPDATE VEHICLE
    ======================================================= */
    updateVehicle(id, payload) {
        return this.http
            .put(`${this.apiUrl}/${id}`, payload, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       DELETE VEHICLE
    ======================================================= */
    deleteVehicle(id) {
        return this.http
            .delete(`${this.apiUrl}/${id}`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       GET ALL MY VEHICLES
    ======================================================= */
    getMyVehicles() {
        return this.http
            .get(this.apiUrl, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       GET ONE VEHICLE
    ======================================================= */
    getVehicleById(vehicleId) {
        return this.http
            .get(`${this.apiUrl}/${vehicleId}`, {
            headers: this.getAuthHeaders()
        });
    }
};
VehicleService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], VehicleService);
export { VehicleService };
