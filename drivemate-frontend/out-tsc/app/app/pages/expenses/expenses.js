import { __decorate } from "tslib";
import { OwnerTopbar } from '../../shared/owner-topbar/owner-topbar';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VehicleService } from '../../services/vehicle.service';
import { ExpenseService } from '../../services/expense.service';
let Expenses = class Expenses {
    route = inject(ActivatedRoute);
    router = inject(Router);
    location = inject(Location);
    formValidationService = inject(FormValidationService);
    formBuilder = inject(FormBuilder);
    vehicleService = inject(VehicleService);
    expenseService = inject(ExpenseService);
    authService = inject(AuthService);
    vehicle = null;
    expenses = [];
    vehicles = [];
    showVehicleSelector = false;
    vehicleId = 0;
    isDirectRoute = false;
    loading = true;
    isSubmitting = false;
    submitted = false;
    pageErrorMessage = '';
    formErrorMessage = '';
    successMessage = '';
    /* =======================================================
       CATEGORY OPTIONS
    ======================================================= */
    categories = [
        {
            value: 'FUEL',
            label: 'Fuel'
        },
        {
            value: 'INSURANCE',
            label: 'Insurance'
        },
        {
            value: 'PARKING',
            label: 'Parking'
        },
        {
            value: 'TOLL',
            label: 'Toll'
        },
        {
            value: 'ROAD_TAX',
            label: 'Road Tax'
        },
        {
            value: 'EMISSION_TEST',
            label: 'Emission Test'
        },
        {
            value: 'ACCESSORIES',
            label: 'Accessories'
        },
        {
            value: 'WASH_CLEANING',
            label: 'Wash & Cleaning'
        },
        {
            value: 'OTHER',
            label: 'Other'
        }
    ];
    /* =======================================================
       FORM
    ======================================================= */
    expenseForm = this.formBuilder.group({
        category: [
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
        amount: [
            0,
            [
                Validators.required,
                Validators.min(0.01)
            ]
        ],
        expenseDate: [
            '',
            Validators.required
        ],
        odometerKm: [
            null,
            [
                Validators.min(0),
                Validators.max(5000000)
            ]
        ],
        merchant: [
            '',
            [
                Validators.maxLength(150)
            ]
        ],
        notes: [
            '',
            [
                Validators.maxLength(1000)
            ]
        ]
    });
    get f() {
        return this.expenseForm
            .controls;
    }
    /* =======================================================
       SUMMARY
    ======================================================= */
    get expenseCount() {
        return this.expenses
            .length;
    }
    get totalExpense() {
        return this.expenses
            .reduce((total, expense) => {
            return (total +
                Number(expense.amount));
        }, 0);
    }
    get currentMonthExpense() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return this.expenses
            .filter(expense => {
            const expenseDate = new Date(expense.expenseDate);
            return (expenseDate.getMonth() ===
                currentMonth &&
                expenseDate.getFullYear() ===
                    currentYear);
        })
            .reduce((total, expense) => {
            return (total +
                Number(expense.amount));
        }, 0);
    }
    /* =======================================================
       INIT
    ======================================================= */
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
                const fuelCategory = this.categories.find(c => c.value ===
                    'FUEL');
                if (fuelCategory) {
                    if (this.vehicle &&
                        this.vehicle.fuelType ===
                            'ELECTRIC') {
                        fuelCategory.label =
                            'Charging';
                    }
                    else {
                        fuelCategory.label =
                            'Fuel';
                    }
                }
                this.loadExpenses();
            },
            error: (error) => {
                this.handlePageError(error);
            }
        });
    }
    /* =======================================================
       LOAD EXPENSES
    ======================================================= */
    loadExpenses() {
        this.expenseService
            .getExpenses(this.vehicleId)
            .subscribe({
            next: response => {
                this.expenses =
                    response.expenses;
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
        console.error('Expense page error:', error);
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
                'Unable to load expense information.';
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
        if (!this.formValidationService.validateAndScroll(this.expenseForm)) {
            return;
        }
        const values = this.expenseForm
            .getRawValue();
        const payload = {
            category: values.category,
            title: (values.title ??
                '').trim(),
            amount: Number(values.amount ??
                0),
            expenseDate: values.expenseDate ??
                '',
            odometerKm: values.odometerKm,
            merchant: (values.merchant ??
                '').trim(),
            notes: (values.notes ??
                '').trim()
        };
        this.isSubmitting =
            true;
        this.expenseService
            .addExpense(this.vehicleId, payload)
            .subscribe({
            next: response => {
                this.isSubmitting =
                    false;
                this.submitted =
                    false;
                this.successMessage =
                    response.message;
                this.expenseForm
                    .reset({
                    category: '',
                    title: '',
                    amount: 0,
                    expenseDate: '',
                    odometerKm: null,
                    merchant: '',
                    notes: ''
                });
                this.loadExpenses();
            },
            error: (error) => {
                this.isSubmitting =
                    false;
                console.error('Add expense failed:', error);
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
                            'Unable to save expense.');
            }
        });
    }
    /* =======================================================
       CATEGORY LABEL
    ======================================================= */
    getCategoryLabel(category) {
        return (this.categories
            .find(item => item.value ===
            category)
            ?.label ??
            category);
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
    /* =======================================================
       CURRENCY FORMAT
    ======================================================= */
    formatCurrency(value) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(Number(value));
    }
};
Expenses = __decorate([
    Component({
        selector: 'app-expenses',
        standalone: true,
        imports: [
            OwnerTopbar,
            ReactiveFormsModule,
            RouterLink
        ],
        templateUrl: './expenses.html',
        styleUrl: './expenses.css'
    })
], Expenses);
export { Expenses };
