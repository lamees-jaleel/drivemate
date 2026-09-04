import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ToastService } from '../toast/toast.service';
let FormValidationService = class FormValidationService {
    toast = inject(ToastService);
    validateAndScroll(form) {
        form.markAllAsTouched();
        if (form.invalid) {
            this.toast.show('Please fill in all required fields before continuing.', 'error');
            setTimeout(() => {
                const firstInvalidControl = document.querySelector('.ng-invalid[formControlName], .ng-invalid[formControl], .ng-invalid[ngModel], input.ng-invalid, select.ng-invalid, textarea.ng-invalid');
                if (firstInvalidControl) {
                    firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (firstInvalidControl.focus) {
                        firstInvalidControl.focus({ preventScroll: true });
                    }
                }
            }, 50);
            return false;
        }
        return true;
    }
};
FormValidationService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], FormValidationService);
export { FormValidationService };
