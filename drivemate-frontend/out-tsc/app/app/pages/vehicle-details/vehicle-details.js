import { __decorate } from "tslib";
import { OwnerTopbar } from '../../shared/owner-topbar/owner-topbar';
import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VehicleService } from '../../services/vehicle.service';
import { ToastService } from '../../shared/toast/toast.service';
let VehicleDetails = class VehicleDetails {
    router = inject(Router);
    location = inject(Location);
    route = inject(ActivatedRoute);
    authService = inject(AuthService);
    vehicleService = inject(VehicleService);
    toast = inject(ToastService);
    vehicle = null;
    loading = true;
    errorMessage = '';
    isDeleting = false;
    goBack(event) {
        event.preventDefault();
        this.location.back();
    }
    /* =======================================================
       INITIALIZE
    ======================================================= */
    ngOnInit() {
        this.loadVehicle();
    }
    /* =======================================================
       LOAD VEHICLE
    ======================================================= */
    loadVehicle() {
        const vehicleId = Number(this.route.snapshot
            .paramMap
            .get('id'));
        if (!Number.isInteger(vehicleId) ||
            vehicleId <= 0) {
            this.loading =
                false;
            this.errorMessage =
                'Invalid vehicle ID.';
            return;
        }
        this.loading =
            true;
        this.errorMessage =
            '';
        this.vehicleService
            .getVehicleById(vehicleId)
            .subscribe({
            next: response => {
                this.vehicle =
                    response.vehicle;
                this.loading =
                    false;
            },
            error: (error) => {
                this.loading =
                    false;
                console.error('Unable to load vehicle:', error);
                if (error.status ===
                    401) {
                    this.authService
                        .clearSession();
                    this.router.navigate([
                        '/login'
                    ]);
                    return;
                }
                if (error.status ===
                    404) {
                    this.errorMessage =
                        'Vehicle not found.';
                    return;
                }
                this.errorMessage =
                    error.error?.message ||
                        'Unable to load vehicle details.';
            }
        });
    }
    /* =======================================================
       OPEN MAINTENANCE
    ======================================================= */
    openMaintenance() {
        if (!this.vehicle) {
            return;
        }
        this.router.navigate([
            '/owner-dashboard/vehicles',
            this.vehicle.id,
            'maintenance'
        ]);
    }
    /* =======================================================
       OPEN EXPENSES
    ======================================================= */
    openExpenses() {
        if (!this.vehicle) {
            return;
        }
        this.router.navigate([
            '/owner-dashboard/vehicles',
            this.vehicle.id,
            'expenses'
        ]);
    }
    /* =======================================================
       OPEN DOCUMENTS
    ======================================================= */
    openDocuments() {
        if (!this.vehicle) {
            return;
        }
        this.router.navigate([
            '/owner-dashboard/vehicles',
            this.vehicle.id,
            'documents'
        ]);
    }
    /* =======================================================
       DATE FORMAT
    ======================================================= */
    formatDate(value) {
        if (!value) {
            return 'Not specified';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'Not specified';
        }
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }
    getVehiclePlaceholderType(imagePath) {
        if (!imagePath ||
            !imagePath.startsWith('placeholder:')) {
            return 'CAR';
        }
        return imagePath.split(':')[1] || 'CAR';
    }
    /* =======================================================
       BACK
    ======================================================= */
    backToVehicles() {
        this.router.navigate([
            '/owner-dashboard/vehicles'
        ]);
    }
    /* =======================================================
       EDIT / DELETE VEHICLE
    ======================================================= */
    editVehicle() {
        if (!this.vehicle) {
            return;
        }
        this.router.navigate([
            `/owner-dashboard/vehicles/${this.vehicle.id}/edit`
        ]);
    }
    deleteVehicle() {
        if (!this.vehicle) {
            return;
        }
        if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
            return;
        }
        this.isDeleting =
            true;
        this.vehicleService
            .deleteVehicle(this.vehicle.id)
            .subscribe({
            next: response => {
                this.isDeleting =
                    false;
                this.toast.show(response.message ||
                    'Vehicle deleted successfully.', 'success');
                this.router.navigate([
                    '/owner-dashboard/vehicles'
                ]);
            },
            error: (err) => {
                this.isDeleting =
                    false;
                console.error('Delete vehicle failed:', err);
                this.toast.show(err.error?.message ||
                    'Unable to delete vehicle. Please try again.', 'error');
            }
        });
    }
};
VehicleDetails = __decorate([
    Component({
        selector: 'app-vehicle-details',
        standalone: true,
        imports: [
            OwnerTopbar,
            RouterLink
        ],
        templateUrl: './vehicle-details.html',
        styleUrl: './vehicle-details.css'
    })
], VehicleDetails);
export { VehicleDetails };
