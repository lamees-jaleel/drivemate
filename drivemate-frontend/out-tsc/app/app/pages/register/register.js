import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { ToastService } from '../../shared/toast/toast.service';
/* =========================================================
   REGULAR EXPRESSIONS
========================================================= */
const FULL_NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;
/*
  Qualification

  Allowed:
  B.Tech
  M.Sc
  Ph.D
  Ph.D/MD
  Automotive Engineering

  Characters allowed:
  letters
  spaces
  .
  /
*/
const QUALIFICATION_REGEX = /^(?=.*[A-Za-z])[A-Za-z./]+(?: [A-Za-z./]+)*$/;
/*
  Specialization

  Allowed:
  Engine Diagnostics
  EV Powertrain
  Engine-Tuning

  Only:
  letters
  spaces
  hyphens
*/
const SPECIALIZATION_REGEX = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
/*
  Service location

  Allowed:
  Mumbai, Maharashtra
  New York, NY
  Kochi, Kerala
  Winston-Salem, North Carolina

  Only:
  letters
  spaces
  commas
  hyphens
*/
const SERVICE_LOCATION_REGEX = /^[A-Za-z]+(?:[ -][A-Za-z]+)*(?:,\s*[A-Za-z]+(?:[ -][A-Za-z]+)*)*$/;
/*
  Licence / Certificate Number

  Allowed:
  letters
  numbers
  hyphens
*/
const CERTIFICATE_REGEX = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
/* =========================================================
   CUSTOM VALIDATORS
========================================================= */
const nonBlankValidator = (control) => {
    const value = control.value;
    if (typeof value !== 'string') {
        return null;
    }
    return value.trim().length > 0
        ? null
        : { blank: true };
};
function trimmedMinLength(minimumLength) {
    return (control) => {
        const value = control.value;
        if (value === null ||
            value === undefined ||
            value === '') {
            return null;
        }
        const actualLength = String(value).trim().length;
        return actualLength >= minimumLength
            ? null
            : {
                trimmedMinLength: {
                    requiredLength: minimumLength,
                    actualLength
                }
            };
    };
}
const passwordMatchValidator = (control) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) {
        return null;
    }
    return password === confirmPassword
        ? null
        : { passwordMismatch: true };
};
const verificationFileValidator = (control) => {
    const file = control.value;
    if (!file) {
        return null;
    }
    const allowedExtension = /\.(pdf|jpg|jpeg|png)$/i;
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png'
    ];
    if (!allowedExtension.test(file.name) ||
        (file.type !== '' &&
            !allowedMimeTypes.includes(file.type))) {
        return {
            invalidFileType: true
        };
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            fileTooLarge: true
        };
    }
    return null;
};
/* =========================================================
   COMPONENT
========================================================= */
let Register = class Register {
    formBuilder = inject(FormBuilder);
    http = inject(HttpClient);
    toast = inject(ToastService);
    formValidationService = inject(FormValidationService);
    submitted = false;
    isSubmitting = false;
    showPassword = false;
    showConfirmPassword = false;
    selectedRole = 'VEHICLE_OWNER';
    /* =======================================================
       FORM
    ======================================================= */
    registerForm = this.formBuilder.group({
        role: [
            'VEHICLE_OWNER',
            Validators.required
        ],
        fullName: [
            '',
            [
                Validators.required,
                Validators.minLength(2),
                Validators.pattern(FULL_NAME_REGEX)
            ]
        ],
        /*
          +91 is NOT stored here.

          This control stores only:
          9876543210
        */
        phone: [
            '',
            [
                Validators.required,
                Validators.pattern(PHONE_REGEX)
            ]
        ],
        email: [
            '',
            [
                Validators.required,
                Validators.pattern(EMAIL_REGEX)
            ]
        ],
        address: [
            '',
            [
                Validators.required,
                nonBlankValidator,
                trimmedMinLength(10)
            ]
        ],
        password: [
            '',
            [
                Validators.required,
                Validators.pattern(PASSWORD_REGEX)
            ]
        ],
        confirmPassword: [
            '',
            Validators.required
        ],
        /* ==========================
           PROFESSIONAL INFORMATION
        ========================== */
        qualification: [''],
        specialization: [''],
        yearsOfExperience: [''],
        organizationName: [''],
        certificateNumber: [''],
        serviceLocation: [''],
        verificationDocument: [
            null
        ],
        acceptTerms: [
            false,
            Validators.requiredTrue
        ]
    }, {
        validators: passwordMatchValidator
    });
    get f() {
        return this.registerForm.controls;
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
       GENERIC INPUT HELPERS
    ======================================================= */
    proposedValue(input, insertedText) {
        const start = input.selectionStart ??
            input.value.length;
        const end = input.selectionEnd ??
            input.value.length;
        return (input.value.substring(0, start) +
            insertedText +
            input.value.substring(end));
    }
    updateInputControl(input, control, value) {
        input.value = value;
        control.setValue(value, {
            emitEvent: false
        });
        control.markAsDirty();
    }
    trimTextControl(control) {
        const value = control.value ?? '';
        const trimmed = value.trim();
        if (value !== trimmed) {
            control.setValue(trimmed);
        }
    }
    /* =======================================================
       FULL NAME
    ======================================================= */
    onFullNameBeforeInput(event) {
        const inputEvent = event;
        if (inputEvent.inputType.startsWith('delete')) {
            return;
        }
        if (inputEvent.data === null) {
            return;
        }
        if (!/^[A-Za-z ]+$/.test(inputEvent.data)) {
            event.preventDefault();
            return;
        }
        const input = event.target;
        const candidate = this.proposedValue(input, inputEvent.data);
        if (candidate.startsWith(' ') ||
            candidate.includes('  ')) {
            event.preventDefault();
        }
    }
    onFullNameInput(event) {
        const input = event.target;
        const sanitized = input.value
            .replace(/[^A-Za-z ]/g, '')
            .replace(/ {2,}/g, ' ')
            .replace(/^ +/, '');
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.fullName, sanitized);
        }
    }
    onFullNamePaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = event.clipboardData
            ?.getData('text') ?? '';
        const cleaned = pasted
            .replace(/[^A-Za-z ]/g, '')
            .replace(/ {2,}/g, ' ');
        const finalValue = this.proposedValue(input, cleaned)
            .replace(/[^A-Za-z ]/g, '')
            .replace(/ {2,}/g, ' ')
            .replace(/^ +/, '');
        this.updateInputControl(input, this.f.fullName, finalValue);
    }
    /* =======================================================
       PHONE
    ======================================================= */
    onPhoneBeforeInput(event) {
        const inputEvent = event;
        if (inputEvent.inputType.startsWith('delete')) {
            return;
        }
        if (inputEvent.data === null) {
            return;
        }
        if (!/^\d+$/.test(inputEvent.data)) {
            event.preventDefault();
            return;
        }
        const input = event.target;
        const candidate = this.proposedValue(input, inputEvent.data);
        if (candidate.length > 10) {
            event.preventDefault();
        }
    }
    onPhoneInput(event) {
        const input = event.target;
        const sanitized = input.value
            .replace(/\D/g, '')
            .slice(0, 10);
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.phone, sanitized);
        }
    }
    onPhonePaste(event) {
        event.preventDefault();
        const input = event.target;
        const raw = (event.clipboardData
            ?.getData('text') ?? '').trim();
        let digits = '';
        /*
          Local:
          9876543210
    
          Full Indian:
          +919876543210
        */
        if (/^\d{1,10}$/.test(raw)) {
            digits = raw;
        }
        else if (/^\+91\d{10}$/.test(raw)) {
            digits =
                raw.substring(3);
        }
        else {
            this.f.phone
                .markAsTouched();
            return;
        }
        const candidate = this.proposedValue(input, digits);
        if (!/^\d{0,10}$/.test(candidate)) {
            return;
        }
        this.updateInputControl(input, this.f.phone, candidate);
    }
    /* =======================================================
       EMAIL
    ======================================================= */
    onEmailInput(event) {
        const input = event.target;
        const sanitized = input.value.replace(/\s+/g, '');
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.email, sanitized);
        }
    }
    onEmailPaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = (event.clipboardData
            ?.getData('text') ?? '').replace(/\s+/g, '');
        const candidate = this.proposedValue(input, pasted).replace(/\s+/g, '');
        this.updateInputControl(input, this.f.email, candidate);
    }
    /* =======================================================
       ADDRESS
    ======================================================= */
    onAddressInput(event) {
        const input = event.target;
        const sanitized = input.value
            .replace(/\s+/g, ' ')
            .replace(/^ +/, '');
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.address, sanitized);
        }
    }
    onAddressPaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = (event.clipboardData
            ?.getData('text') ?? '')
            .replace(/\s+/g, ' ');
        const candidate = this.proposedValue(input, pasted)
            .replace(/\s+/g, ' ')
            .replace(/^ +/, '');
        this.updateInputControl(input, this.f.address, candidate);
    }
    /* =======================================================
       YEARS OF EXPERIENCE
    ======================================================= */
    onExperienceBeforeInput(event) {
        const inputEvent = event;
        if (inputEvent.inputType.startsWith('delete')) {
            return;
        }
        if (inputEvent.data === null) {
            return;
        }
        if (!/^\d+$/.test(inputEvent.data)) {
            event.preventDefault();
            return;
        }
        const input = event.target;
        const candidate = this.proposedValue(input, inputEvent.data);
        if (candidate !== '' &&
            Number(candidate) > 60) {
            event.preventDefault();
        }
    }
    onExperienceInput(event) {
        const input = event.target;
        let sanitized = input.value.replace(/\D/g, '');
        if (sanitized !== '' &&
            Number(sanitized) > 60) {
            sanitized = '60';
        }
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.yearsOfExperience, sanitized);
        }
    }
    onExperiencePaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = (event.clipboardData
            ?.getData('text') ?? '').trim();
        if (!/^\d+$/.test(pasted)) {
            this.f.yearsOfExperience
                .markAsTouched();
            return;
        }
        const candidate = this.proposedValue(input, pasted);
        if (Number(candidate) > 60) {
            this.f.yearsOfExperience
                .markAsTouched();
            return;
        }
        this.updateInputControl(input, this.f.yearsOfExperience, candidate);
    }
    /* =======================================================
       QUALIFICATION
  
       Allowed:
       letters
       spaces
       dots
       slashes
    ======================================================= */
    onQualificationBeforeInput(event) {
        const inputEvent = event;
        if (inputEvent.inputType.startsWith('delete')) {
            return;
        }
        if (inputEvent.data === null) {
            return;
        }
        if (!/^[A-Za-z./ ]+$/.test(inputEvent.data)) {
            event.preventDefault();
            return;
        }
        const input = event.target;
        const candidate = this.proposedValue(input, inputEvent.data);
        if (candidate.startsWith(' ') ||
            candidate.includes('  ')) {
            event.preventDefault();
        }
    }
    onQualificationInput(event) {
        const input = event.target;
        const sanitized = input.value
            .replace(/[^A-Za-z./ ]/g, '')
            .replace(/ {2,}/g, ' ')
            .replace(/^ +/, '');
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.qualification, sanitized);
        }
    }
    onQualificationPaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = event.clipboardData
            ?.getData('text') ?? '';
        const cleaned = pasted
            .replace(/[^A-Za-z./ ]/g, '')
            .replace(/ {2,}/g, ' ');
        const candidate = this.proposedValue(input, cleaned)
            .replace(/[^A-Za-z./ ]/g, '')
            .replace(/ {2,}/g, ' ')
            .replace(/^ +/, '');
        this.updateInputControl(input, this.f.qualification, candidate);
    }
    /* =======================================================
       SPECIALIZATION
  
       Allowed:
       letters
       spaces
       hyphens
    ======================================================= */
    onSpecializationBeforeInput(event) {
        const inputEvent = event;
        if (inputEvent.inputType.startsWith('delete')) {
            return;
        }
        if (inputEvent.data === null) {
            return;
        }
        if (!/^[A-Za-z -]+$/.test(inputEvent.data)) {
            event.preventDefault();
            return;
        }
        const input = event.target;
        const candidate = this.proposedValue(input, inputEvent.data);
        if (candidate.startsWith(' ') ||
            candidate.includes('  ')) {
            event.preventDefault();
        }
    }
    onSpecializationInput(event) {
        const input = event.target;
        const sanitized = input.value
            .replace(/[^A-Za-z -]/g, '')
            .replace(/ {2,}/g, ' ')
            .replace(/^ +/, '');
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.specialization, sanitized);
        }
    }
    onSpecializationPaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = event.clipboardData
            ?.getData('text') ?? '';
        const cleaned = pasted
            .replace(/[^A-Za-z -]/g, '')
            .replace(/ {2,}/g, ' ');
        const candidate = this.proposedValue(input, cleaned)
            .replace(/[^A-Za-z -]/g, '')
            .replace(/ {2,}/g, ' ')
            .replace(/^ +/, '');
        this.updateInputControl(input, this.f.specialization, candidate);
    }
    /* =======================================================
       SERVICE LOCATION
  
       Allowed:
       letters
       spaces
       commas
       hyphens
    ======================================================= */
    onServiceLocationBeforeInput(event) {
        const inputEvent = event;
        if (inputEvent.inputType.startsWith('delete')) {
            return;
        }
        if (inputEvent.data === null) {
            return;
        }
        if (!/^[A-Za-z,\- ]+$/.test(inputEvent.data)) {
            event.preventDefault();
            return;
        }
    }
    onServiceLocationInput(event) {
        const input = event.target;
        const sanitized = this.sanitizeServiceLocation(input.value);
        if (sanitized !== input.value) {
            this.updateInputControl(input, this.f.serviceLocation, sanitized);
        }
    }
    onServiceLocationPaste(event) {
        event.preventDefault();
        const input = event.target;
        const pasted = event.clipboardData
            ?.getData('text') ?? '';
        const candidate = this.proposedValue(input, pasted);
        const sanitized = this.sanitizeServiceLocation(candidate);
        this.updateInputControl(input, this.f.serviceLocation, sanitized);
    }
    sanitizeServiceLocation(value) {
        return value
            .replace(/[^A-Za-z,\- ]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/,{2,}/g, ',')
            .replace(/^ +/, '');
    }
    /* =======================================================
       ROLE
    ======================================================= */
    selectRole(role) {
        this.selectedRole = role;
        this.f.role.setValue(role);
        this.configureProfessionalValidators();
    }
    /* =======================================================
       PROFESSIONAL VALIDATORS
    ======================================================= */
    configureProfessionalValidators() {
        if (this.selectedRole ===
            'VEHICLE_OWNER') {
            this.f.qualification
                .clearValidators();
            this.f.specialization
                .clearValidators();
            this.f.yearsOfExperience
                .clearValidators();
            this.f.organizationName
                .clearValidators();
            this.f.certificateNumber
                .clearValidators();
            this.f.serviceLocation
                .clearValidators();
            this.f.verificationDocument
                .clearValidators();
            this.updateProfessionalControls();
            return;
        }
        /* Qualification */
        this.f.qualification
            .setValidators([
            Validators.required,
            nonBlankValidator,
            Validators.pattern(QUALIFICATION_REGEX)
        ]);
        /* Specialization */
        this.f.specialization
            .setValidators([
            Validators.required,
            nonBlankValidator,
            Validators.pattern(SPECIALIZATION_REGEX)
        ]);
        /* Experience */
        this.f.yearsOfExperience
            .setValidators([
            Validators.required,
            Validators.pattern(/^\d+$/),
            Validators.min(0),
            Validators.max(60)
        ]);
        /* Organization */
        this.f.organizationName
            .setValidators([
            Validators.required,
            nonBlankValidator
        ]);
        /* Certificate */
        this.f.certificateNumber
            .setValidators([
            Validators.required,
            Validators.pattern(CERTIFICATE_REGEX)
        ]);
        /* Service Location */
        this.f.serviceLocation
            .setValidators([
            Validators.required,
            Validators.pattern(SERVICE_LOCATION_REGEX)
        ]);
        /* Verification Document */
        this.f.verificationDocument
            .setValidators([
            Validators.required,
            verificationFileValidator
        ]);
        this.updateProfessionalControls();
    }
    updateProfessionalControls() {
        this.f.qualification
            .updateValueAndValidity();
        this.f.specialization
            .updateValueAndValidity();
        this.f.yearsOfExperience
            .updateValueAndValidity();
        this.f.organizationName
            .updateValueAndValidity();
        this.f.certificateNumber
            .updateValueAndValidity();
        this.f.serviceLocation
            .updateValueAndValidity();
        this.f.verificationDocument
            .updateValueAndValidity();
    }
    /* =======================================================
       FILE
    ======================================================= */
    onFileSelected(event) {
        const input = event.target;
        const file = input.files?.item(0) ?? null;
        this.f.verificationDocument
            .setValue(file);
        this.f.verificationDocument
            .markAsTouched();
        this.f.verificationDocument
            .updateValueAndValidity();
        /*
          Remove an invalid file from
          the browser input as well.
        */
        if (this.f.verificationDocument
            .invalid &&
            file) {
            input.value = '';
        }
    }
    /* =======================================================
       PASSWORD
    ======================================================= */
    togglePassword() {
        this.showPassword =
            !this.showPassword;
    }
    toggleConfirmPassword() {
        this.showConfirmPassword =
            !this.showConfirmPassword;
    }
    /* =======================================================
       SUBMIT
    ======================================================= */
    submit() {
        if (this.isSubmitting) {
            return;
        }
        this.submitted = true;
        this.configureProfessionalValidators();
        if (!this.formValidationService.validateAndScroll(this.registerForm)) {
            return;
        }
        const values = this.registerForm
            .getRawValue();
        const formData = new FormData();
        /* =====================================================
           BASIC ACCOUNT INFORMATION
        ===================================================== */
        formData.append('role', values.role ??
            this.selectedRole);
        formData.append('fullName', (values.fullName ??
            '').trim());
        /*
          The form stores only the
          10-digit Indian phone number.
    
          The backend expects:
          +91XXXXXXXXXX
        */
        formData.append('phone', `+91${values.phone ?? ''}`);
        formData.append('email', (values.email ??
            '')
            .trim()
            .toLowerCase());
        formData.append('address', (values.address ??
            '').trim());
        formData.append('password', values.password ??
            '');
        formData.append('termsAccepted', String(values.acceptTerms === true));
        /* =====================================================
           PROFESSIONAL INFORMATION
        ===================================================== */
        if (this.selectedRole !==
            'VEHICLE_OWNER') {
            formData.append('qualification', (values.qualification ??
                '').trim());
            formData.append('specialization', (values.specialization ??
                '').trim());
            formData.append('yearsOfExperience', String(values.yearsOfExperience ??
                ''));
            formData.append('organizationName', (values.organizationName ??
                '').trim());
            formData.append('certificateNumber', (values.certificateNumber ??
                '').trim());
            formData.append('serviceLocation', (values.serviceLocation ??
                '').trim());
            const verificationDocument = values.verificationDocument;
            if (verificationDocument) {
                formData.append('verificationDocument', verificationDocument, verificationDocument.name);
            }
        }
        /* =====================================================
           SEND TO BACKEND
        ===================================================== */
        this.isSubmitting = true;
        this.http.post('http://localhost:5000/api/auth/register', formData)
            .subscribe({
            next: response => {
                this.isSubmitting = false;
                this.submitted = false;
                this.toast.show(response.message ||
                    'Registration successful.', 'success');
            },
            error: (error) => {
                this.isSubmitting = false;
                console.error('DriveMate registration failed:', error);
                const backendErrors = error.error?.errors;
                const detailedMessage = backendErrors
                    ? Object.values(backendErrors).join('\n')
                    : '';
                this.toast.show(detailedMessage ||
                    error.error?.message ||
                    'Registration failed. Please try again.', 'error');
            }
        });
    }
};
Register = __decorate([
    Component({
        selector: 'app-register',
        standalone: true,
        imports: [
            ReactiveFormsModule,
            RouterLink
        ],
        templateUrl: './register.html',
        styleUrl: './register.css'
    })
], Register);
export { Register };
