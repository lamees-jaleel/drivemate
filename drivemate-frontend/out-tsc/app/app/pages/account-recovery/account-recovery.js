import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { CommonModule } from '@angular/common';
import { Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
const API_URL = 'http://localhost:5000/api';
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
let AccountRecovery = class AccountRecovery {
    fb;
    router;
    route;
    http;
    formValidationService = inject(FormValidationService);
    step = 'IDENTIFY';
    identifyForm;
    verifyForm;
    resetForm;
    loading = false;
    errorMessage = '';
    sessionId = '';
    maskedEmail = '';
    resendCooldown = 0;
    destroy$ = new Subject();
    constructor(fb, router, route, http) {
        this.fb = fb;
        this.router = router;
        this.route = route;
        this.http = http;
        this.identifyForm = this.fb.group({
            email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]]
        });
        this.verifyForm = this.fb.group({
            otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
        });
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }
    ngOnInit() {
        // Read email from login page if passed via query params
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            if (params['email']) {
                this.identifyForm.patchValue({ email: params['email'] });
            }
        });
        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            if (this.resendCooldown > 0) {
                this.resendCooldown--;
            }
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    get fIdentify() { return this.identifyForm.controls; }
    get fVerify() { return this.verifyForm.controls; }
    get fReset() { return this.resetForm.controls; }
    showError(control) {
        return control.invalid && (control.dirty || control.touched);
    }
    onIdentifySubmit() {
        if (!this.formValidationService.validateAndScroll(this.identifyForm)) {
            return;
        }
        this.loading = true;
        this.errorMessage = '';
        this.http.post(`${API_URL}/auth/recovery/identify`, this.identifyForm.value)
            .subscribe({
            next: (res) => {
                this.loading = false;
                this.sessionId = res.sessionId;
                this.maskedEmail = res.maskedEmail;
                this.step = 'VERIFY';
                this.resendCooldown = 60;
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Failed to identify account.';
            }
        });
    }
    onVerifySubmit() {
        if (!this.formValidationService.validateAndScroll(this.verifyForm)) {
            return;
        }
        this.loading = true;
        this.errorMessage = '';
        const payload = {
            sessionId: this.sessionId,
            otp: this.verifyForm.value.otp
        };
        this.http.post(`${API_URL}/auth/recovery/verify`, payload)
            .subscribe({
            next: () => {
                this.loading = false;
                this.step = 'RESET';
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Invalid OTP.';
            }
        });
    }
    onResendOTP() {
        if (this.resendCooldown > 0)
            return;
        this.loading = true;
        this.errorMessage = '';
        this.http.post(`${API_URL}/auth/recovery/resend`, { sessionId: this.sessionId })
            .subscribe({
            next: () => {
                this.loading = false;
                this.resendCooldown = 60;
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Failed to resend OTP.';
            }
        });
    }
    onResetSubmit() {
        if (!this.formValidationService.validateAndScroll(this.resetForm)) {
            return;
        }
        this.loading = true;
        this.errorMessage = '';
        const payload = {
            sessionId: this.sessionId,
            password: this.resetForm.value.password
        };
        this.http.post(`${API_URL}/auth/recovery/reset`, payload)
            .subscribe({
            next: () => {
                this.loading = false;
                this.step = 'SUCCESS';
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Failed to reset password.';
            }
        });
    }
    goBackToLogin() {
        this.router.navigate(['/login']);
    }
};
AccountRecovery = __decorate([
    Component({
        selector: 'app-account-recovery',
        standalone: true,
        imports: [CommonModule, ReactiveFormsModule, RouterModule],
        templateUrl: './account-recovery.html',
        styleUrls: ['./account-recovery.css']
    })
], AccountRecovery);
export { AccountRecovery };
