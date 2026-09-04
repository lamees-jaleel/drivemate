import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { VehicleService } from '../../services/vehicle.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { ExpenseService } from '../../services/expense.service';
import { DocumentService } from '../../services/document.service';
import { RoadsideService } from '../../services/roadside.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/toast/toast.service';
let OwnerDashboard = class OwnerDashboard {
    router = inject(Router);
    toast = inject(ToastService);
    authService = inject(AuthService);
    vehicleService = inject(VehicleService);
    maintenanceService = inject(MaintenanceService);
    expenseService = inject(ExpenseService);
    documentService = inject(DocumentService);
    roadsideService = inject(RoadsideService);
    currentUser = null;
    firstName = 'Owner';
    mobileSidebarOpen = false;
    /* =======================================================
       PROFILE & ROADSIDE MODALS STATE
       ======================================================= */
    showProfileModal = false;
    showRoadsideModal = false;
    selectedRoadsideVehicleId = null;
    roadsideIssueType = '';
    roadsideDescription = '';
    roadsideLocation = '';
    roadsideContactPhone = '';
    roadsideUrgency = '';
    activeRoadsideRequest = null;
    roadsideHistory = [];
    loadingActiveRequest = false;
    loadingRoadsideHistory = false;
    submittingRoadside = false;
    cancellingRoadside = false;
    roadsideError = '';
    roadsideSuccess = '';
    /* =======================================================
       VEHICLES
    ======================================================= */
    vehicles = [];
    vehicleCount = 0;
    loadingVehicles = true;
    /* =======================================================
       DASHBOARD COUNTERS
    ======================================================= */
    upcomingServices = 0;
    urgentServiceAlert = null;
    monthlyExpense = 0;
    complianceAlerts = 0;
    /* =======================================================
       INITIALIZE
    ======================================================= */
    ngOnInit() {
        this.loadCurrentUser();
        this.loadVehicles();
    }
    /* =======================================================
       CURRENT USER
    ======================================================= */
    loadCurrentUser() {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }
        const user = this.authService.getUser();
        if (!user || user.role !== 'VEHICLE_OWNER') {
            this.router.navigate(['/']);
            return;
        }
        this.currentUser = user;
        this.firstName = this.extractFirstName(user.fullName);
    }
    /* =======================================================
       LOAD VEHICLES
    ======================================================= */
    loadVehicles() {
        this.loadingVehicles = true;
        this.vehicleService.getMyVehicles().subscribe({
            next: (response) => {
                this.vehicles = response.vehicles;
                this.vehicleCount = response.count;
                this.loadingVehicles = false;
                /*
                    After vehicles are loaded,
                    fetch lifecycle information
                    for the dashboard.
                  */
                this.loadDashboardVehicleData();
            },
            error: (error) => {
                this.loadingVehicles = false;
                console.error('Unable to load vehicles:', error);
                if (error.status === 401) {
                    this.authService.clearSession();
                    this.router.navigate(['/login']);
                    return;
                }
                this.vehicles = [];
                this.vehicleCount = 0;
                this.upcomingServices = 0;
                this.urgentServiceAlert = null;
                this.monthlyExpense = 0;
                this.complianceAlerts = 0;
            },
        });
    }
    /* =======================================================
       DASHBOARD VEHICLE DATA
    ======================================================= */
    loadDashboardVehicleData() {
        if (this.vehicles.length === 0) {
            this.upcomingServices = 0;
            this.urgentServiceAlert = null;
            this.monthlyExpense = 0;
            this.complianceAlerts = 0;
            return;
        }
        /*
          For every vehicle fetch:
    
          1. Maintenance
          2. Expenses
          3. Documents / compliance
        */
        const requests = this.vehicles.map((vehicle) => {
            /* ===============================================
                   MAINTENANCE
                =============================================== */
            const maintenanceRequest = this.maintenanceService.getMaintenanceRecords(vehicle.id).pipe(map((response) => response.maintenanceRecords), catchError((error) => {
                console.error(`Unable to load maintenance for vehicle ${vehicle.id}:`, error);
                return of([]);
            }));
            /* ===============================================
                   EXPENSES
                =============================================== */
            const expenseRequest = this.expenseService.getExpenses(vehicle.id).pipe(map((response) => response.expenses), catchError((error) => {
                console.error(`Unable to load expenses for vehicle ${vehicle.id}:`, error);
                return of([]);
            }));
            /* ===============================================
                   DOCUMENT COMPLIANCE
                =============================================== */
            const documentRequest = this.documentService.getDocuments(vehicle.id).pipe(map((response) => response.complianceAlertCount), catchError((error) => {
                console.error(`Unable to load documents for vehicle ${vehicle.id}:`, error);
                return of(0);
            }));
            /* ===============================================
                   COMBINE VEHICLE DATA
                =============================================== */
            return forkJoin({
                maintenanceRecords: maintenanceRequest,
                expenses: expenseRequest,
                complianceAlertCount: documentRequest,
            }).pipe(map((result) => ({
                vehicle,
                maintenanceRecords: result.maintenanceRecords,
                expenses: result.expenses,
                complianceAlertCount: result.complianceAlertCount,
            })));
        });
        /* =====================================================
           COMBINE ALL VEHICLES
        ===================================================== */
        forkJoin(requests).subscribe((results) => {
            let upcomingServiceCount = 0;
            let currentMonthTotal = 0;
            let complianceAlertTotal = 0;
            for (const result of results) {
                /* =============================================
                       UPCOMING SERVICES
                    ============================================== */
                for (const record of result.maintenanceRecords) {
                    const statusObj = this.maintenanceService.computeMaintenanceStatus(record, result.vehicle.odometerKm, result.maintenanceRecords);
                    if (statusObj.urgent) {
                        upcomingServiceCount++;
                        // Just grab the first urgent one for the dashboard card
                        if (!this.urgentServiceAlert) {
                            this.urgentServiceAlert = {
                                title: record.title,
                                text: statusObj.text,
                                vehicle: `${result.vehicle.make} ${result.vehicle.model}`,
                                status: statusObj.status
                            };
                        }
                    }
                }
                /* =============================================
                       EXPENSES THIS MONTH
        
                       Maintenance cost is intentionally excluded
                       from this dashboard card. It belongs to the
                       Maintenance module, while Monthly Expenses
                       mirrors the Expenses page only.
                    ============================================== */
                for (const expense of result.expenses) {
                    if (this.isCurrentMonth(expense.expenseDate)) {
                        currentMonthTotal += Number(expense.amount);
                    }
                }
                /* =============================================
                       COMPLIANCE ALERTS
                    ============================================== */
                complianceAlertTotal += result.complianceAlertCount;
            }
            this.upcomingServices = upcomingServiceCount;
            this.monthlyExpense = currentMonthTotal;
            this.complianceAlerts = complianceAlertTotal;
        });
    }
    /* =======================================================
       CURRENT MONTH CHECK
    ======================================================= */
    isCurrentMonth(dateValue) {
        if (!dateValue) {
            return false;
        }
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return false;
        }
        const today = new Date();
        return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
    }
    /* =======================================================
       UPCOMING SERVICE CHECK
    ======================================================= */
    hasUpcomingReminder(vehicle, record, allRecords) {
        const status = this.maintenanceService.computeMaintenanceStatus(record, vehicle.odometerKm, allRecords);
        return status.urgent;
    }
    /* =======================================================
       FIRST NAME
    ======================================================= */
    extractFirstName(fullName) {
        const cleanName = fullName.trim();
        if (!cleanName) {
            return 'Owner';
        }
        return cleanName.split(/\s+/)[0] ?? 'Owner';
    }
    /* =======================================================
       SIDEBAR
    ======================================================= */
    toggleSidebar() {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
    }
    closeSidebar() {
        this.mobileSidebarOpen = false;
    }
    /* =======================================================
       ADD VEHICLE
    ======================================================= */
    addVehicle() {
        this.closeSidebar();
        this.router.navigate(['/owner-dashboard/add-vehicle']);
    }
    /* =======================================================
       MY VEHICLES
    ======================================================= */
    openMyVehicles() {
        this.closeSidebar();
        this.router.navigate(['/owner-dashboard/vehicles']);
    }
    /* =======================================================
       VEHICLE DETAILS
    ======================================================= */
    openVehicleDetails() {
        this.closeSidebar();
        if (this.vehicles.length === 0) {
            this.router.navigate(['/owner-dashboard/add-vehicle']);
            return;
        }
        if (this.vehicles.length === 1) {
            this.router.navigate(['/owner-dashboard/vehicles', this.vehicles[0].id]);
            return;
        }
        /*
          Multiple vehicles:
          choose which vehicle first.
        */
        this.openMyVehicles();
    }
    openVehicleDetailsForId(vehicleId) {
        this.closeSidebar();
        this.router.navigate(['/owner-dashboard/vehicles', vehicleId]);
    }
    /* =======================================================
       MAINTENANCE
    ======================================================= */
    openMaintenance() {
        this.closeSidebar();
        if (this.vehicles.length === 0) {
            this.router.navigate(['/owner-dashboard/add-vehicle']);
            return;
        }
        if (this.vehicles.length === 1) {
            this.router.navigate(['/owner-dashboard/vehicles', this.vehicles[0].id, 'maintenance']);
            return;
        }
        this.router.navigate(['/owner-dashboard/maintenance']);
    }
    /* =======================================================
       EXPENSES
    ======================================================= */
    openExpenses() {
        this.closeSidebar();
        if (this.vehicles.length === 0) {
            this.router.navigate(['/owner-dashboard/add-vehicle']);
            return;
        }
        if (this.vehicles.length === 1) {
            this.router.navigate(['/owner-dashboard/vehicles', this.vehicles[0].id, 'expenses']);
            return;
        }
        this.router.navigate(['/owner-dashboard/expenses']);
    }
    /* =======================================================
       DOCUMENTS / COMPLIANCE
    ======================================================= */
    openDocuments() {
        this.closeSidebar();
        if (this.vehicles.length === 0) {
            this.router.navigate(['/owner-dashboard/add-vehicle']);
            return;
        }
        if (this.vehicles.length === 1) {
            this.router.navigate(['/owner-dashboard/vehicles', this.vehicles[0].id, 'documents']);
            return;
        }
        /*
          Multiple vehicles:
          choose which vehicle first.
        */
        this.router.navigate(['/owner-dashboard/documents']);
    }
    /* =======================================================
       MODULE NAVIGATION
    ======================================================= */
    openModule(moduleName) {
        if (moduleName === 'My Vehicles') {
            this.openMyVehicles();
            return;
        }
        if (moduleName === 'Vehicle Details') {
            this.openVehicleDetails();
            return;
        }
        if (moduleName === 'Maintenance') {
            this.openMaintenance();
            return;
        }
        if (moduleName === 'Expenses') {
            this.openExpenses();
            return;
        }
        if (moduleName === 'Documents' || moduleName === 'Documents & Compliance') {
            this.openDocuments();
            return;
        }
        if (moduleName === 'Roadside Assistance') {
            this.closeSidebar();
            this.showRoadsideModal = true;
            this.loadRoadsideData();
            return;
        }
        if (moduleName === 'Profile') {
            this.closeSidebar();
            this.showProfileModal = true;
            return;
        }
        this.closeSidebar();
        /*
          Remaining modules are
          still being developed.
        */
        this.toast.show(`${moduleName} will be connected in the next DriveMate module.`, 'info');
    }
    /* =======================================================
       ROADSIDE DATA ACTIONS
       ======================================================= */
    loadRoadsideData() {
        this.loadingActiveRequest = true;
        this.loadingRoadsideHistory = true;
        this.roadsideError = '';
        this.roadsideSuccess = '';
        if (!this.roadsideContactPhone) {
            this.roadsideContactPhone = this.authService.getUser()?.phone || '';
        }
        this.roadsideService.getActiveRequest().subscribe({
            next: (res) => {
                this.activeRoadsideRequest = res.request;
                this.loadingActiveRequest = false;
            },
            error: (err) => {
                console.error('Error fetching active roadside request:', err);
                this.loadingActiveRequest = false;
            },
        });
        this.roadsideService.getOwnerHistory().subscribe({
            next: (res) => {
                this.roadsideHistory = res.history;
                this.loadingRoadsideHistory = false;
            },
            error: (err) => {
                console.error('Error fetching roadside history:', err);
                this.loadingRoadsideHistory = false;
            },
        });
    }
    submitRoadsideRequest() {
        if (!this.selectedRoadsideVehicleId) {
            this.roadsideError = 'Please select a vehicle.';
            return;
        }
        if (!this.roadsideIssueType) {
            this.roadsideError = 'Please select an issue type.';
            return;
        }
        if (!this.roadsideUrgency) {
            this.roadsideError = 'Please select urgency level.';
            return;
        }
        if (!this.roadsideLocation.trim()) {
            this.roadsideError = 'Please specify your current location.';
            return;
        }
        if (!this.roadsideContactPhone.trim()) {
            this.roadsideError = 'Please provide a contact phone number.';
            return;
        }
        if (!this.roadsideDescription.trim()) {
            this.roadsideError = 'Please describe the issue.';
            return;
        }
        this.submittingRoadside = true;
        this.roadsideError = '';
        this.roadsideSuccess = '';
        const payload = {
            vehicleId: Number(this.selectedRoadsideVehicleId),
            issueType: this.roadsideIssueType,
            description: this.roadsideDescription.trim(),
            location: this.roadsideLocation.trim(),
            contactPhone: this.roadsideContactPhone.trim(),
            urgency: this.roadsideUrgency,
        };
        this.roadsideService.createRequest(payload).subscribe({
            next: (res) => {
                this.submittingRoadside = false;
                this.roadsideSuccess = res.message || 'Roadside assistance requested successfully!';
                this.selectedRoadsideVehicleId = null;
                this.roadsideIssueType = '';
                this.roadsideUrgency = '';
                this.roadsideDescription = '';
                this.roadsideLocation = '';
                this.loadRoadsideData();
            },
            error: (err) => {
                this.submittingRoadside = false;
                this.roadsideError = err.error?.message || 'Unable to submit request. Please try again.';
            },
        });
    }
    cancelActiveRoadside(id) {
        if (!confirm('Are you sure you want to cancel this assistance request?')) {
            return;
        }
        this.cancellingRoadside = true;
        this.roadsideError = '';
        this.roadsideSuccess = '';
        this.roadsideService.cancelRequest(id).subscribe({
            next: (res) => {
                this.cancellingRoadside = false;
                this.roadsideSuccess = 'Request cancelled successfully.';
                this.loadRoadsideData();
            },
            error: (err) => {
                this.cancellingRoadside = false;
                this.roadsideError = err.error?.message || 'Unable to cancel request.';
            },
        });
    }
    getVehiclePlaceholderType(imagePath) {
        if (!imagePath || !imagePath.startsWith('placeholder:')) {
            return 'CAR';
        }
        return imagePath.split(':')[1] || 'CAR';
    }
    /* =======================================================
       LOGOUT
       ======================================================= */
    logout() {
        this.authService.clearSession();
        this.router.navigate(['/login']);
    }
};
OwnerDashboard = __decorate([
    Component({
        selector: 'app-owner-dashboard',
        standalone: true,
        imports: [RouterLink, FormsModule, CommonModule],
        templateUrl: './owner-dashboard.html',
        styleUrl: './owner-dashboard.css',
    })
], OwnerDashboard);
export { OwnerDashboard };
