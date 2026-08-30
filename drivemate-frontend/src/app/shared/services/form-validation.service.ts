import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  private toast = inject(ToastService);

  validateAndScroll(form: FormGroup): boolean {
    form.markAllAsTouched();

    if (form.invalid) {
      this.toast.show('Please fill in all required fields before continuing.', 'error');
      
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid[formControlName], .ng-invalid[formControl], .ng-invalid[ngModel], input.ng-invalid, select.ng-invalid, textarea.ng-invalid') as HTMLElement;
        
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
}
