import { __decorate } from "tslib";
import { OwnerTopbar } from '../../shared/owner-topbar/owner-topbar';
import { Component, inject } from '@angular/core';
import { NgClass, Location } from '@angular/common';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VehicleService } from '../../services/vehicle.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { DiagnosticService } from '../../services/diagnostic.service';
import { ToastService } from '../../shared/toast/toast.service';
let Maintenance = class Maintenance {
    route = inject(ActivatedRoute);
    router = inject(Router);
    location = inject(Location);
    formValidationService = inject(FormValidationService);
    formBuilder = inject(FormBuilder);
    vehicleService = inject(VehicleService);
    maintenanceService = inject(MaintenanceService);
    authService = inject(AuthService);
    diagnosticService = inject(DiagnosticService);
    toast = inject(ToastService);
    vehicle = null;
    maintenanceRecords = [];
    /* =======================================================
       EDIT / DELETE STATE
    ======================================================= */
    activeActionMenu = null;
    isEditing = false;
    editingRecordId = null;
    vehicles = [];
    showVehicleSelector = false;
    activeTab = 'logs';
    bookings = [];
    loadingBookings = false;
    bookingSubmitting = false;
    bookingSuccess = '';
    bookingError = '';
    vehicleId = 0;
    isDirectRoute = false;
    loading = true;
    isSubmitting = false;
    submitted = false;
    pageErrorMessage = '';
    formErrorMessage = '';
    successMessage = '';
    /* =======================================================
       MAINTENANCE OPTIONS
    ======================================================= */
    maintenanceTypes = [
        {
            value: 'ROUTINE_SERVICE',
            label: 'Routine Service'
        },
        {
            value: 'OIL_CHANGE',
            label: 'Oil Change'
        },
        {
            value: 'REPAIR',
            label: 'Repair'
        },
        {
            value: 'TYRE_SERVICE',
            label: 'Tyre Service'
        },
        {
            value: 'BATTERY_SERVICE',
            label: 'Battery Service'
        },
        {
            value: 'INSPECTION',
            label: 'Inspection'
        },
        {
            value: 'OTHER',
            label: 'Other'
        }
    ];
    /* =======================================================
       FORM
    ======================================================= */
    maintenanceForm = this.formBuilder.group({
        maintenanceType: [
            '',
            Validators.required
        ],
        title: [
            '',
            [
                Validators.required,
                Validators.maxLength(120)
            ]
        ],
        serviceDate: [
            '',
            Validators.required
        ],
        odometerKm: [
            0,
            [
                Validators.required,
                Validators.min(0),
                Validators.max(5000000)
            ]
        ],
        serviceCenter: [
            '',
            [
                Validators.maxLength(150)
            ]
        ],
        description: [
            '',
            [
                Validators.maxLength(1000)
            ]
        ],
        cost: [
            0,
            [
                Validators.required,
                Validators.min(0)
            ]
        ],
        nextServiceDate: [
            ''
        ],
        nextServiceOdometerKm: [
            null,
            [
                Validators.min(0),
                Validators.max(5000000)
            ]
        ]
    });
    bookingForm = this.formBuilder.group({
        title: [
            '',
            [
                Validators.required,
                Validators.maxLength(120)
            ]
        ],
        concernType: [
            '',
            Validators.required
        ],
        urgency: [
            'NORMAL',
            Validators.required
        ],
        providerType: [
            'AUTHORIZED',
            Validators.required
        ],
        shopName: [
            ''
        ],
        symptoms: [
            '',
            [
                Validators.required,
                Validators.maxLength(1500)
            ]
        ],
        odometerKm: [
            null
        ]
    });
    get f() {
        return this.maintenanceForm
            .controls;
    }
    /* =======================================================
       SUMMARY VALUES
    ======================================================= */
    get recordCount() {
        return this.maintenanceRecords
            .length;
    }
    get totalMaintenanceCost() {
        return this.maintenanceRecords
            .reduce((total, record) => {
            return (total +
                Number(record.cost));
        }, 0);
    }
    /* =======================================================
       INITIALIZE
    ======================================================= */
    /* =======================================================
       EDIT / DELETE METHODS
    ======================================================= */
    toggleActionMenu(id) {
        if (this.activeActionMenu === id) {
            this.activeActionMenu = null;
        }
        else {
            this.activeActionMenu = id;
        }
    }
    editRecord(record) {
        this.activeActionMenu = null;
        this.isEditing = true;
        this.editingRecordId = record.id;
        // Fill form
        this.maintenanceForm.patchValue({
            maintenanceType: record.maintenanceType,
            title: record.title,
            serviceDate: record.serviceDate ? record.serviceDate.substring(0, 10) : '',
            odometerKm: record.odometerKm,
            serviceCenter: record.serviceCenter || '',
            description: record.description || '',
            cost: Number(record.cost),
            nextServiceDate: record.nextServiceDate ? record.nextServiceDate.substring(0, 10) : '',
            nextServiceOdometerKm: record.nextServiceOdometerKm || null
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    cancelEdit() {
        this.isEditing = false;
        this.editingRecordId = null;
        this.maintenanceForm.reset();
    }
    deleteRecord(record) {
        this.activeActionMenu = null;
        if (!this.vehicle)
            return;
        const confirmDelete = confirm(`Delete service record?\n\nThis will remove "${record.title}" from this vehicle's maintenance history.`);
        if (confirmDelete) {
            this.maintenanceService.deleteMaintenanceRecord(this.vehicle.id, record.id).subscribe({
                next: () => {
                    this.maintenanceRecords = this.maintenanceRecords.filter(r => r.id !== record.id);
                    // Just simple reload to recalculate everything properly including max odometer
                    this.loadMaintenance();
                    this.toast.show('Service record deleted successfully.', 'success');
                },
                error: (err) => {
                    console.error(err);
                    this.toast.show('Unable to delete service record. Please try again.', 'error');
                }
            });
        }
    }
    getRecordStatus(record) {
        if (!this.vehicle)
            return null;
        return this.maintenanceService.computeMaintenanceStatus(record, this.vehicle.odometerKm, this.maintenanceRecords);
    }
    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (!idParam) {
            this.isDirectRoute = false;
            this.loadAllVehicles();
            return;
        }
        this.isDirectRoute = true;
        const id = Number(idParam);
        if (!Number.isInteger(id) ||
            id <= 0) {
            this.loadAllVehicles();
            return;
        }
        this.vehicleId =
            id;
        this.loadVehicle();
    }
    loadAllVehicles() {
        this.loading =
            true;
        this.vehicleService
            .getMyVehicles()
            .subscribe({
            next: response => {
                this.vehicles =
                    response.vehicles;
                if (this.vehicles.length ===
                    0) {
                    this.pageErrorMessage =
                        'You do not have any registered vehicles yet.';
                    this.loading =
                        false;
                }
                else if (this.vehicles.length ===
                    1) {
                    this.vehicleId =
                        this.vehicles[0].id;
                    this.loadVehicle();
                }
                else {
                    this.showVehicleSelector =
                        true;
                    this.loading =
                        false;
                }
            },
            error: (err) => {
                this.loading =
                    false;
                this.pageErrorMessage =
                    'Unable to load your vehicles. Please try again.';
            }
        });
    }
    selectVehicle(vehicleId) {
        this.vehicleId =
            vehicleId;
        this.showVehicleSelector =
            false;
        this.loadVehicle();
    }
    /* =======================================================
       LOAD VEHICLE
    ======================================================= */
    goBack(event) {
        event.preventDefault();
        this.location.back();
    }
    clearSelection() {
        this.vehicle = null;
        this.vehicleId = 0;
        this.showVehicleSelector = true;
    }
    loadVehicle() {
        this.loading =
            true;
        this.vehicleService
            .getVehicleById(this.vehicleId)
            .subscribe({
            next: response => {
                this.vehicle =
                    response.vehicle;
                /*
                  Start new maintenance records
                  using the current vehicle
                  odometer.
                */
                this.f.odometerKm
                    .setValue(response.vehicle
                    .odometerKm);
                this.loadMaintenance();
                this.loadBookings();
            },
            error: (error) => {
                this.handlePageError(error);
            }
        });
    }
    /* =======================================================
       LOAD MAINTENANCE HISTORY
    ======================================================= */
    loadMaintenance() {
        this.maintenanceService
            .getMaintenanceRecords(this.vehicleId)
            .subscribe({
            next: response => {
                this.maintenanceRecords =
                    response
                        .maintenanceRecords;
                this.loading =
                    false;
            },
            error: (error) => {
                this.handlePageError(error);
            }
        });
    }
    /* =======================================================
       PAGE ERROR
    ======================================================= */
    handlePageError(error) {
        this.loading =
            false;
        console.error('Maintenance page error:', error);
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
            this.pageErrorMessage =
                'Vehicle not found.';
            return;
        }
        this.pageErrorMessage =
            error.error?.message ||
                'Unable to load maintenance information.';
    }
    /* =======================================================
       FORM ERROR VISIBILITY
    ======================================================= */
    showError(control) {
        return (control.invalid &&
            (control.touched ||
                this.submitted));
    }
    /* =======================================================
       SUBMIT
    ======================================================= */
    submit() {
        if (this.isSubmitting) {
            return;
        }
        this.submitted =
            true;
        this.formErrorMessage =
            '';
        this.successMessage =
            '';
        if (!this.formValidationService.validateAndScroll(this.maintenanceForm)) {
            return;
        }
        const values = this.maintenanceForm
            .getRawValue();
        const payload = {
            maintenanceType: values.maintenanceType,
            title: (values.title ??
                '').trim(),
            serviceDate: values.serviceDate ??
                '',
            odometerKm: Number(values.odometerKm ??
                0),
            serviceCenter: (values.serviceCenter ??
                '').trim(),
            description: (values.description ??
                '').trim(),
            cost: Number(values.cost ??
                0),
            nextServiceDate: values.nextServiceDate ??
                '',
            nextServiceOdometerKm: values.nextServiceOdometerKm
        };
        this.isSubmitting =
            true;
        this.maintenanceService
            .addMaintenanceRecord(this.vehicleId, payload)
            .subscribe({
            next: response => {
                this.isSubmitting =
                    false;
                this.submitted =
                    false;
                this.successMessage =
                    response.message;
                /*
                  New service record may
                  advance vehicle odometer.
                */
                const latestOdometer = payload.odometerKm;
                this.maintenanceForm
                    .reset({
                    maintenanceType: '',
                    title: '',
                    serviceDate: '',
                    odometerKm: latestOdometer,
                    serviceCenter: '',
                    description: '',
                    cost: 0,
                    nextServiceDate: '',
                    nextServiceOdometerKm: null
                });
                this.loadMaintenance();
            },
            error: (error) => {
                this.isSubmitting =
                    false;
                console.error('Add maintenance failed:', error);
                if (error.status ===
                    401) {
                    this.authService
                        .clearSession();
                    this.router.navigate([
                        '/login'
                    ]);
                    return;
                }
                const errors = error.error?.errors;
                this.formErrorMessage =
                    errors
                        ? Object.values(errors).join(' ')
                        : (error.error?.message ||
                            'Unable to save maintenance record.');
            }
        });
    }
    /* =======================================================
       FORMAT DATE
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
    /* =======================================================
       FORMAT COST
    ======================================================= */
    formatCost(value) {
        const amount = Number(value);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    }
    /* =======================================================
       MAINTENANCE LABEL
    ======================================================= */
    getMaintenanceLabel(type) {
        return (this.maintenanceTypes
            .find(item => item.value ===
            type)
            ?.label ??
            type);
    }
    /* =======================================================
       LIVE MAINTENANCE BOOKINGS
    ======================================================= */
    setTab(tab) {
        this.activeTab = tab;
        if (tab === 'bookings') {
            this.loadBookings();
        }
    }
    loadBookings() {
        if (!this.vehicleId)
            return;
        this.loadingBookings = true;
        this.diagnosticService
            .getVehicleRequests(this.vehicleId)
            .subscribe({
            next: response => {
                this.bookings = response.requests;
                this.loadingBookings = false;
            },
            error: () => {
                this.loadingBookings = false;
            }
        });
    }
    submitBooking() {
        if (!this.formValidationService.validateAndScroll(this.bookingForm)) {
            return;
        }
        this.bookingSubmitting = true;
        this.bookingError = '';
        const v = this.bookingForm.value;
        const payload = {
            title: v.title ?? '',
            concernType: v.concernType,
            urgency: (v.urgency ?? 'NORMAL'),
            providerType: (v.providerType ?? 'DRIVEMATE_EXPERT'),
            shopName: v.shopName?.trim() || undefined,
            symptoms: v.symptoms ?? '',
            odometerKm: v.odometerKm ? Number(v.odometerKm) : undefined
        };
        this.diagnosticService
            .bookSlot(this.vehicleId, payload)
            .subscribe({
            next: response => {
                this.bookingSuccess = 'Your maintenance slot booking was successfully submitted! A provider will accept it shortly.';
                this.bookingForm.reset({
                    urgency: 'NORMAL',
                    providerType: 'DRIVEMATE_EXPERT'
                });
                this.loadBookings();
                this.bookingSubmitting = false;
            },
            error: () => {
                this.bookingError = 'Failed to book slot. Please try again later.';
                this.bookingSubmitting = false;
            }
        });
    }
    getConcernLabel(type) {
        return type
            .replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }
    getProviderTypeLabel(type) {
        switch (type) {
            case 'AUTHORIZED_DEALER':
                return '🏢 Authorised Dealer';
            case 'LOCAL_SHOP':
                return '🔧 Local Shop';
            case 'MOBILE_MECHANIC':
                return '🚐 Mobile Mechanic';
            case 'DRIVEMATE_EXPERT':
                return '⭐ DriveMate Expert';
            default:
                return type;
        }
    }
    getProviderTypeClass(type) {
        switch (type) {
            case 'AUTHORIZED_DEALER':
                return 'provider-authorized';
            case 'LOCAL_SHOP':
                return 'provider-local';
            case 'MOBILE_MECHANIC':
                return 'provider-mobile';
            case 'DRIVEMATE_EXPERT':
                return 'provider-drivemate';
            default:
                return '';
        }
    }
    getUrgencyClass(urgency) {
        switch (urgency) {
            case 'LOW':
                return 'urgency-low';
            case 'NORMAL':
                return 'urgency-normal';
            case 'HIGH':
                return 'urgency-high';
            case 'CRITICAL':
                return 'urgency-critical';
            default:
                return 'urgency-normal';
        }
    }
    getStatusClass(status) {
        switch (status) {
            case 'PENDING':
                return 'status-pending';
            case 'ACCEPTED':
                return 'status-accepted';
            case 'IN_PROGRESS':
                return 'status-inprogress';
            case 'COMPLETED':
                return 'status-completed';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    }
};
Maintenance = __decorate([
    Component({
        selector: 'app-maintenance',
        standalone: true,
        imports: [
            OwnerTopbar,
            ReactiveFormsModule,
            RouterLink,
            NgClass
        ],
        templateUrl: './maintenance.html',
        styleUrl: './maintenance.css'
    })
], Maintenance);
export { Maintenance };
