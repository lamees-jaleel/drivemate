import { __decorate } from "tslib";
import { OwnerTopbar } from '../../shared/owner-topbar/owner-topbar';
import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VehicleService } from '../../services/vehicle.service';
let MyVehicles = class MyVehicles {
    vehicleService = inject(VehicleService);
    location = inject(Location);
    authService = inject(AuthService);
    router = inject(Router);
    vehicles = [];
    loading = true;
    errorMessage = '';
    /* =======================================================
       INITIALIZE
    ======================================================= */
    goBack(event) {
        event.preventDefault();
        this.location.back();
    }
    ngOnInit() {
        this.loadVehicles();
    }
    /* =======================================================
       LOAD VEHICLES
    ======================================================= */
    loadVehicles() {
        this.loading =
            true;
        this.errorMessage =
            '';
        this.vehicleService
            .getMyVehicles()
            .subscribe({
            next: response => {
                this.vehicles =
                    response.vehicles;
                this.loading =
                    false;
            },
            error: (error) => {
                this.loading =
                    false;
                console.error('Unable to load vehicles:', error);
                if (error.status === 401) {
                    this.authService
                        .clearSession();
                    this.router.navigate([
                        '/login'
                    ]);
                    return;
                }
                this.errorMessage =
                    error.error?.message ||
                        'Unable to load your vehicles.';
            }
        });
    }
    /* =======================================================
       ADD VEHICLE
    ======================================================= */
    addVehicle() {
        this.router.navigate([
            '/owner-dashboard/add-vehicle'
        ]);
    }
    /* =======================================================
       VEHICLE DETAILS
  
       The details page is our next step.
    ======================================================= */
    viewVehicle(vehicleId) {
        this.router.navigate([
            '/owner-dashboard/vehicles',
            vehicleId
        ]);
    }
    getVehiclePlaceholderType(imagePath) {
        if (!imagePath ||
            !imagePath.startsWith('placeholder:')) {
            return 'CAR';
        }
        return imagePath.split(':')[1] || 'CAR';
    }
};
MyVehicles = __decorate([
    Component({
        selector: 'app-my-vehicles',
        standalone: true,
        imports: [
            OwnerTopbar,
            RouterLink
        ],
        templateUrl: './my-vehicles.html',
        styleUrl: './my-vehicles.css'
    })
], MyVehicles);
export { MyVehicles };
