import { __decorate } from "tslib";
import { OwnerTopbar } from '../../shared/owner-topbar/owner-topbar';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { VehicleService } from '../../services/vehicle.service';
/* =========================================================
   NON-BLANK VALIDATOR
========================================================= */
const nonBlankValidator = (control) => {
    const value = control.value;
    if (typeof value !==
        'string') {
        return null;
    }
    return value.trim().length > 0
        ? null
        : {
            blank: true
        };
};
/* =========================================================
   COMPONENT
========================================================= */
let AddVehicle = class AddVehicle {
    formBuilder = inject(FormBuilder);
    vehicleService = inject(VehicleService);
    authService = inject(AuthService);
    router = inject(Router);
    location = inject(Location);
    formValidationService = inject(FormValidationService);
    route = inject(ActivatedRoute);
    toast = inject(ToastService);
    vehicleId = null;
    isEditMode = false;
    submitted = false;
    isSubmitting = false;
    selectedFile = null;
    imagePreviewUrl = null;
    currentYear = new Date().getFullYear();
    maximumVehicleYear = this.currentYear + 1;
    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.vehicleId =
                Number(idParam);
            this.isEditMode =
                true;
            this.loadVehicleDetails(this.vehicleId);
        }
    }
    loadVehicleDetails(id) {
        this.vehicleService
            .getVehicleById(id)
            .subscribe({
            next: response => {
                const vehicle = response.vehicle;
                // Extract placeholder type if exists
                let placeholderType = 'CAR';
                if (vehicle.vehicleImagePath &&
                    vehicle.vehicleImagePath.startsWith('placeholder:')) {
                    placeholderType =
                        vehicle.vehicleImagePath.split(':')[1] || 'CAR';
                }
                else if (vehicle.vehicleImagePath) {
                    this.imagePreviewUrl =
                        `http://localhost:5000/${vehicle.vehicleImagePath}`;
                }
                this.vehicleForm.patchValue({
                    vehicleType: placeholderType,
                    registrationNumber: vehicle.registrationNumber,
                    make: vehicle.make,
                    model: vehicle.model,
                    variant: vehicle.variant ?? '',
                    manufacturingYear: vehicle.manufacturingYear,
                    fuelType: vehicle.fuelType,
                    transmission: vehicle.transmission ?? '',
                    color: vehicle.color ?? '',
                    vin: vehicle.vin ?? '',
                    engineNumber: vehicle.engineNumber ?? '',
                    odometerKm: vehicle.odometerKm,
                    purchaseDate: vehicle.purchaseDate
                        ? vehicle.purchaseDate.substring(0, 10)
                        : '',
                    ownershipType: vehicle.ownershipType
                });
            },
            error: (err) => {
                console.error('Unable to load vehicle details:', err);
                this.toast.show('Unable to load vehicle details. Redirecting to dashboard.', 'error');
                this.router.navigate([
                    '/owner-dashboard'
                ]);
            }
        });
    }
    /* =======================================================
       OPTIONS
    ======================================================= */
    fuelTypes = [
        {
            value: 'PETROL',
            label: 'Petrol'
        },
        {
            value: 'DIESEL',
            label: 'Diesel'
        },
        {
            value: 'CNG',
            label: 'CNG'
        },
        {
            value: 'LPG',
            label: 'LPG'
        },
        {
            value: 'ELECTRIC',
            label: 'Electric'
        },
        {
            value: 'HYBRID',
            label: 'Hybrid'
        },
        {
            value: 'OTHER',
            label: 'Other'
        }
    ];
    transmissionTypes = [
        {
            value: 'MANUAL',
            label: 'Manual'
        },
        {
            value: 'AUTOMATIC',
            label: 'Automatic'
        },
        {
            value: 'AMT',
            label: 'AMT'
        },
        {
            value: 'CVT',
            label: 'CVT'
        },
        {
            value: 'DCT',
            label: 'DCT'
        },
        {
            value: 'OTHER',
            label: 'Other'
        }
    ];
    ownershipTypes = [
        {
            value: 'OWNED',
            label: 'Owned'
        },
        {
            value: 'FINANCED',
            label: 'Financed'
        },
        {
            value: 'LEASED',
            label: 'Leased'
        }
    ];
    /* =======================================================
       FORM
    ======================================================= */
    vehicleForm = this.formBuilder.group({
        vehicleType: [
            'CAR',
            Validators.required
        ],
        registrationNumber: [
            '',
            [
                Validators.required,
                nonBlankValidator,
                Validators.maxLength(20)
            ]
        ],
        make: [
            '',
            [
                Validators.required,
                nonBlankValidator,
                Validators.maxLength(80)
            ]
        ],
        model: [
            '',
            [
                Validators.required,
                nonBlankValidator,
                Validators.maxLength(80)
            ]
        ],
        variant: [
            '',
            [
                Validators.maxLength(80)
            ]
        ],
        manufacturingYear: [
            null,
            [
                Validators.required,
                Validators.min(1900),
                Validators.max(this.maximumVehicleYear)
            ]
        ],
        fuelType: [
            '',
            Validators.required
        ],
        transmission: [
            ''
        ],
        color: [
            '',
            [
                Validators.maxLength(50)
            ]
        ],
        vin: [
            '',
            [
                Validators.maxLength(50),
                Validators.pattern(/^[A-Za-z0-9]*$/)
            ]
        ],
        engineNumber: [
            '',
            [
                Validators.maxLength(50),
                Validators.pattern(/^[A-Za-z0-9-]*$/)
            ]
        ],
        odometerKm: [
            0,
            [
                Validators.required,
                Validators.min(0),
                Validators.max(5000000)
            ]
        ],
        purchaseDate: [
            ''
        ],
        ownershipType: [
            'OWNED',
            Validators.required
        ]
    });
    get f() {
        return this.vehicleForm.controls;
    }
    /* =======================================================
       ERROR VISIBILITY
    ======================================================= */
    showError(control) {
        return (control.invalid &&
            (control.touched ||
                this.submitted));
    }
    /* =======================================================
       UPPERCASE REGISTRATION NUMBER
    ======================================================= */
    onRegistrationInput(event) {
        const input = event.target;
        const cleaned = input.value
            .toUpperCase()
            .replace(/[^A-Z0-9 -]/g, '');
        input.value =
            cleaned;
        this.f.registrationNumber
            .setValue(cleaned, {
            emitEvent: false
        });
    }
    /* =======================================================
       VIN
    ======================================================= */
    onVinInput(event) {
        const input = event.target;
        const cleaned = input.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
        input.value =
            cleaned;
        this.f.vin.setValue(cleaned, {
            emitEvent: false
        });
    }
    /* =======================================================
       ENGINE NUMBER
    ======================================================= */
    onEngineNumberInput(event) {
        const input = event.target;
        const cleaned = input.value
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '');
        input.value =
            cleaned;
        this.f.engineNumber
            .setValue(cleaned, {
            emitEvent: false
        });
    }
    /* =======================================================
       FILE UPLOAD HANDLERS
    ======================================================= */
    onFileSelected(event) {
        const input = event.target;
        if (!input.files ||
            input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        const allowedExtensions = /\.(jpg|jpeg|png)$/i;
        if (!allowedExtensions.test(file.name)) {
            this.toast.show('Only JPG, JPEG, and PNG files are allowed.', 'error');
            input.value = '';
            return;
        }
        if (file.size >
            5 * 1024 * 1024) {
            this.toast.show('File size must not exceed 5MB.', 'error');
            input.value = '';
            return;
        }
        this.selectedFile =
            file;
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreviewUrl =
                reader.result;
        };
        reader.readAsDataURL(file);
    }
    removeSelectedImage() {
        this.selectedFile =
            null;
        this.imagePreviewUrl =
            null;
        const fileInput = document.getElementById('vehicleImage');
        if (fileInput) {
            fileInput.value = '';
        }
    }
    /* =======================================================
       CANCEL
    ======================================================= */
    cancel() {
        this.router.navigate([
            '/owner-dashboard'
        ]);
    }
    /* =======================================================
       SUBMIT
    ======================================================= */
    goBack(event) {
        event.preventDefault();
        this.location.back();
    }
    submit() {
        if (this.isSubmitting) {
            return;
        }
        this.submitted =
            true;
        if (!this.formValidationService.validateAndScroll(this.vehicleForm)) {
            return;
        }
        const values = this.vehicleForm
            .getRawValue();
        const formData = new FormData();
        formData.append('registrationNumber', (values.registrationNumber ?? '').trim());
        formData.append('make', (values.make ?? '').trim());
        formData.append('model', (values.model ?? '').trim());
        formData.append('variant', (values.variant ?? '').trim());
        formData.append('manufacturingYear', String(values.manufacturingYear));
        formData.append('fuelType', values.fuelType ?? '');
        formData.append('transmission', values.transmission ?? '');
        formData.append('color', (values.color ?? '').trim());
        formData.append('vin', (values.vin ?? '').trim());
        formData.append('engineNumber', (values.engineNumber ?? '').trim());
        formData.append('odometerKm', String(values.odometerKm ?? 0));
        formData.append('purchaseDate', values.purchaseDate ?? '');
        formData.append('ownershipType', values.ownershipType ?? 'OWNED');
        if (this.selectedFile) {
            formData.append('vehicleImage', this.selectedFile);
        }
        else {
            formData.append('vehicleImagePath', 'placeholder:' + (values.vehicleType ?? 'CAR'));
        }
        this.isSubmitting =
            true;
        const request = this.isEditMode && this.vehicleId
            ? this.vehicleService.updateVehicle(this.vehicleId, formData)
            : this.vehicleService.addVehicle(formData);
        request.subscribe({
            next: response => {
                this.isSubmitting =
                    false;
                this.toast.show(response.message ||
                    (this.isEditMode ? 'Vehicle updated successfully.' : 'Vehicle added successfully.'), 'success');
                this.router.navigate([
                    this.isEditMode
                        ? `/owner-dashboard/vehicles/${this.vehicleId}`
                        : '/owner-dashboard'
                ]);
            },
            error: (error) => {
                this.isSubmitting =
                    false;
                console.error('Add vehicle failed:', error);
                /*
                  JWT missing / expired.
                */
                if (error.status ===
                    401) {
                    this.authService
                        .clearSession();
                    this.toast.show(error.error?.message ||
                        'Your login session has expired. Please sign in again.', 'error');
                    this.router.navigate([
                        '/login'
                    ]);
                    return;
                }
                const backendErrors = error.error?.errors;
                const detailedMessage = backendErrors
                    ? Object.values(backendErrors).join('\n')
                    : '';
                this.toast.show(detailedMessage ||
                    error.error?.message ||
                    'Unable to add vehicle. Please try again.', 'error');
            }
        });
    }
};
AddVehicle = __decorate([
    Component({
        selector: 'app-add-vehicle',
        standalone: true,
        imports: [
            OwnerTopbar,
            ReactiveFormsModule,
            RouterLink
        ],
        templateUrl: './add-vehicle.html',
        styleUrl: './add-vehicle.css'
    })
], AddVehicle);
export { AddVehicle };
