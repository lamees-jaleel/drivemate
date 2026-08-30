import { Component, OnInit, inject } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import { Router, RouterLink } from '@angular/router';

import { catchError, forkJoin, map, of } from 'rxjs';

import { AuthenticatedUser, AuthService } from '../../services/auth.service';

import { Vehicle, VehicleService } from '../../services/vehicle.service';

import { MaintenanceRecord, MaintenanceService } from '../../services/maintenance.service';

import { Expense, ExpenseService } from '../../services/expense.service';

import { DocumentService } from '../../services/document.service';

import { RoadsideService } from '../../services/roadside.service';

import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-owner-dashboard',

  standalone: true,

  imports: [RouterLink, FormsModule, CommonModule],

  templateUrl: './owner-dashboard.html',

  styleUrl: './owner-dashboard.css',
})
export class OwnerDashboard implements OnInit {
  private readonly router = inject(Router);

  private readonly toast = inject(ToastService);

  private readonly authService = inject(AuthService);

  private readonly vehicleService = inject(VehicleService);

  private readonly maintenanceService = inject(MaintenanceService);

  private readonly expenseService = inject(ExpenseService);

  private readonly documentService = inject(DocumentService);

  private readonly roadsideService = inject(RoadsideService);

  currentUser: AuthenticatedUser | null = null;

  firstName = 'Owner';

  mobileSidebarOpen = false;

  /* =======================================================
     PROFILE & ROADSIDE MODALS STATE
     ======================================================= */

  showProfileModal = false;

  showRoadsideModal = false;

  selectedRoadsideVehicleId: number | null = null;

  roadsideIssueType = '';

  roadsideDescription = '';

  roadsideLocation = '';
  roadsideContactPhone = '';

  roadsideUrgency = '';

  activeRoadsideRequest: any = null;

  roadsideHistory: any[] = [];

  loadingActiveRequest = false;

  loadingRoadsideHistory = false;

  submittingRoadside = false;

  cancellingRoadside = false;

  roadsideError = '';

  roadsideSuccess = '';

  /* =======================================================
     VEHICLES
  ======================================================= */

  vehicles: Vehicle[] = [];

  vehicleCount = 0;

  loadingVehicles = true;

  /* =======================================================
     DASHBOARD COUNTERS
  ======================================================= */

  upcomingServices = 0;

  monthlyExpense = 0;

  complianceAlerts = 0;

  /* =======================================================
     INITIALIZE
  ======================================================= */

  ngOnInit(): void {
    this.loadCurrentUser();

    this.loadVehicles();
  }

  /* =======================================================
     CURRENT USER
  ======================================================= */

  private loadCurrentUser(): void {
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

  private loadVehicles(): void {
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

      error: (error: HttpErrorResponse) => {
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

        this.monthlyExpense = 0;

        this.complianceAlerts = 0;
      },
    });
  }

  /* =======================================================
     DASHBOARD VEHICLE DATA
  ======================================================= */

  private loadDashboardVehicleData(): void {
    if (this.vehicles.length === 0) {
      this.upcomingServices = 0;

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

      const maintenanceRequest = this.maintenanceService.getMaintenanceRecords(vehicle.id).pipe(
        map((response) => response.maintenanceRecords),

        catchError((error) => {
          console.error(`Unable to load maintenance for vehicle ${vehicle.id}:`, error);

          return of([] as MaintenanceRecord[]);
        }),
      );

      /* ===============================================
             EXPENSES
          =============================================== */

      const expenseRequest = this.expenseService.getExpenses(vehicle.id).pipe(
        map((response) => response.expenses),

        catchError((error) => {
          console.error(`Unable to load expenses for vehicle ${vehicle.id}:`, error);

          return of([] as Expense[]);
        }),
      );

      /* ===============================================
             DOCUMENT COMPLIANCE
          =============================================== */

      const documentRequest = this.documentService.getDocuments(vehicle.id).pipe(
        map((response) => response.complianceAlertCount),

        catchError((error) => {
          console.error(`Unable to load documents for vehicle ${vehicle.id}:`, error);

          return of(0);
        }),
      );

      /* ===============================================
             COMBINE VEHICLE DATA
          =============================================== */

      return forkJoin({
        maintenanceRecords: maintenanceRequest,

        expenses: expenseRequest,

        complianceAlertCount: documentRequest,
      }).pipe(
        map((result) => ({
          vehicle,

          maintenanceRecords: result.maintenanceRecords,

          expenses: result.expenses,

          complianceAlertCount: result.complianceAlertCount,
        })),
      );
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
          if (this.hasUpcomingReminder(result.vehicle, record)) {
            upcomingServiceCount++;
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

  private isCurrentMonth(dateValue: string | null | undefined): boolean {
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

  private hasUpcomingReminder(vehicle: Vehicle, record: MaintenanceRecord): boolean {
    let upcomingByDate = false;

    /* -----------------------------------------------------
       DATE REMINDER
    ----------------------------------------------------- */

    if (record.nextServiceDate) {
      const nextDate = new Date(record.nextServiceDate);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (!Number.isNaN(nextDate.getTime()) && nextDate >= today) {
        upcomingByDate = true;
      }
    }

    /* -----------------------------------------------------
       ODOMETER REMINDER
    ----------------------------------------------------- */

    const upcomingByOdometer =
      record.nextServiceOdometerKm !== null && record.nextServiceOdometerKm > vehicle.odometerKm;

    return upcomingByDate || upcomingByOdometer;
  }

  /* =======================================================
     FIRST NAME
  ======================================================= */

  private extractFirstName(fullName: string): string {
    const cleanName = fullName.trim();

    if (!cleanName) {
      return 'Owner';
    }

    return cleanName.split(/\s+/)[0] ?? 'Owner';
  }

  /* =======================================================
     SIDEBAR
  ======================================================= */

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  /* =======================================================
     ADD VEHICLE
  ======================================================= */

  addVehicle(): void {
    this.closeSidebar();

    this.router.navigate(['/owner-dashboard/add-vehicle']);
  }

  /* =======================================================
     MY VEHICLES
  ======================================================= */

  private openMyVehicles(): void {
    this.closeSidebar();

    this.router.navigate(['/owner-dashboard/vehicles']);
  }

  /* =======================================================
     VEHICLE DETAILS
  ======================================================= */

  private openVehicleDetails(): void {
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

  openVehicleDetailsForId(vehicleId: number): void {
    this.closeSidebar();

    this.router.navigate(['/owner-dashboard/vehicles', vehicleId]);
  }

  /* =======================================================
     MAINTENANCE
  ======================================================= */

  private openMaintenance(): void {
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

  private openExpenses(): void {
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

  private openDocuments(): void {
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

  openModule(moduleName: string): void {
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

    if (moduleName === 'Documents') {
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

  loadRoadsideData(): void {
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

  submitRoadsideRequest(): void {
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

  cancelActiveRoadside(id: number): void {
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

  getVehiclePlaceholderType(imagePath: string | null | undefined): string {
    if (!imagePath || !imagePath.startsWith('placeholder:')) {
      return 'CAR';
    }

    return imagePath.split(':')[1] || 'CAR';
  }

  /* =======================================================
     LOGOUT
     ======================================================= */

  logout(): void {
    this.authService.clearSession();

    this.router.navigate(['/login']);
  }
}
