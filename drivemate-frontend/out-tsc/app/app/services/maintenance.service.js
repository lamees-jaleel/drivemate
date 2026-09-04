import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
/* =========================================================
   SERVICE
========================================================= */
let MaintenanceService = class MaintenanceService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = 'http://localhost:5000/api/vehicles';
    /* =======================================================
       AUTH HEADER
    ======================================================= */
    getAuthHeaders() {
        const token = this.authService
            .getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token ?? ''}`
        });
    }
    /* =======================================================
       GET MAINTENANCE HISTORY
    ======================================================= */
    getMaintenanceRecords(vehicleId) {
        return this.http
            .get(`${this.baseUrl}/${vehicleId}/maintenance`, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       ADD MAINTENANCE RECORD
    ======================================================= */
    addMaintenanceRecord(vehicleId, payload) {
        return this.http
            .post(`${this.baseUrl}/${vehicleId}/maintenance`, payload, {
            headers: this.getAuthHeaders()
        });
    }
    /* =======================================================
       UPDATE MAINTENANCE RECORD
    ======================================================= */
    updateMaintenanceRecord(vehicleId, recordId, payload) {
        return this.http.put(`${this.baseUrl}/${vehicleId}/maintenance/${recordId}`, payload, { headers: this.getAuthHeaders() });
    }
    /* =======================================================
       DELETE MAINTENANCE RECORD
    ======================================================= */
    deleteMaintenanceRecord(vehicleId, recordId) {
        return this.http.delete(`${this.baseUrl}/${vehicleId}/maintenance/${recordId}`, { headers: this.getAuthHeaders() });
    }
    /* =======================================================
       STATUS CALCULATION
    ======================================================= */
    computeMaintenanceStatus(record, latestOdometerKm, allRecords) {
        // 1. Is there a newer completed record of the same type?
        const hasNewer = allRecords.some(r => r.maintenanceType === record.maintenanceType &&
            new Date(r.serviceDate) > new Date(record.serviceDate));
        if (hasNewer) {
            return { status: 'COMPLETED', text: 'Completed', urgent: false };
        }
        // 2. Is there even a next service reminder?
        if (!record.nextServiceDate && !record.nextServiceOdometerKm) {
            return { status: 'UPCOMING', text: 'No reminder set', urgent: false };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let isDue = false;
        let isDueSoon = false;
        let isOverdue = false;
        let daysDiff = Infinity;
        if (record.nextServiceDate) {
            const nextDate = new Date(record.nextServiceDate);
            nextDate.setHours(0, 0, 0, 0);
            const msDiff = nextDate.getTime() - today.getTime();
            daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
            if (daysDiff < 0)
                isOverdue = true;
            else if (daysDiff <= 0)
                isDue = true;
            else if (daysDiff <= 30)
                isDueSoon = true;
        }
        let kmDiff = Infinity;
        if (record.nextServiceOdometerKm) {
            kmDiff = record.nextServiceOdometerKm - latestOdometerKm;
            if (kmDiff < 0)
                isOverdue = true;
            else if (kmDiff <= 0)
                isDue = true;
            else if (kmDiff <= 1000)
                isDueSoon = true;
        }
        if (isOverdue) {
            return { status: 'OVERDUE', text: 'Service Overdue', urgent: true };
        }
        if (isDue) {
            return { status: 'DUE', text: 'Service Due', urgent: true };
        }
        if (isDueSoon) {
            const msg = kmDiff <= 1000 && kmDiff < (daysDiff * 33) // approx check to see which is closer
                ? `${kmDiff} km remaining`
                : `${daysDiff} days remaining`;
            return { status: 'DUE SOON', text: msg, urgent: true };
        }
        return { status: 'UPCOMING', text: 'Upcoming', urgent: false };
    }
};
MaintenanceService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], MaintenanceService);
export { MaintenanceService };
