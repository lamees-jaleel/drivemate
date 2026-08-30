import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil, interval } from 'rxjs';

const API_URL = 'http://localhost:5000/api';
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

type RecoveryStep = 'IDENTIFY' | 'VERIFY' | 'RESET' | 'SUCCESS';

@Component({
  selector: 'app-account-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account-recovery.html',
  styleUrls: ['./account-recovery.css']
})
export class AccountRecovery implements OnInit, OnDestroy {
  step: RecoveryStep = 'IDENTIFY';
  
  identifyForm: FormGroup;
  verifyForm: FormGroup;
  resetForm: FormGroup;

  loading = false;
  errorMessage = '';

  sessionId = '';
  maskedEmail = '';
  
  resendCooldown = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
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

  showError(control: any): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  onIdentifySubmit() {
    if (this.identifyForm.invalid) {
      this.identifyForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    
    this.http.post<any>(`${API_URL}/auth/recovery/identify`, this.identifyForm.value)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.sessionId = res.sessionId;
          this.maskedEmail = res.maskedEmail;
          this.step = 'VERIFY';
          this.resendCooldown = 60;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to identify account.';
        }
      });
  }

  onVerifySubmit() {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const payload = {
      sessionId: this.sessionId,
      otp: this.verifyForm.value.otp
    };

    this.http.post<any>(`${API_URL}/auth/recovery/verify`, payload)
      .subscribe({
        next: () => {
          this.loading = false;
          this.step = 'RESET';
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Invalid OTP.';
        }
      });
  }

  onResendOTP() {
    if (this.resendCooldown > 0) return;
    
    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>(`${API_URL}/auth/recovery/resend`, { sessionId: this.sessionId })
      .subscribe({
        next: () => {
          this.loading = false;
          this.resendCooldown = 60;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to resend OTP.';
        }
      });
  }

  onResetSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const payload = {
      sessionId: this.sessionId,
      password: this.resetForm.value.password
    };

    this.http.post<any>(`${API_URL}/auth/recovery/reset`, payload)
      .subscribe({
        next: () => {
          this.loading = false;
          this.step = 'SUCCESS';
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to reset password.';
        }
      });
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
