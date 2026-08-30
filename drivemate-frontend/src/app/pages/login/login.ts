import {
  Component,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthenticatedUser,
  AuthService
} from '../../services/auth.service';

import { FormValidationService } from '../../shared/services/form-validation.service';
import { ToastService } from '../../shared/toast/toast.service';


const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


interface LoginResponse {

  success: boolean;

  message: string;

  token: string;

  user: AuthenticatedUser;

}


@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './login.html',

  styleUrl:
    './login.css'
})
export class Login {

  private readonly formBuilder =
    inject(FormBuilder);


  private readonly http =
    inject(HttpClient);


  private readonly router =
    inject(Router);


  private readonly authService =
    inject(AuthService);

  private readonly toast = inject(ToastService);
  private readonly formValidationService = inject(FormValidationService);

  submitted =
    false;


  showPassword =
    false;


  isSubmitting =
    false;


  loginForm =
    this.formBuilder.group({

      email: [
        '',
        [
          Validators.required,

          Validators.pattern(
            EMAIL_REGEX
          )
        ]
      ],


      password: [
        '',
        [
          Validators.required
        ]
      ]
    });


  get f() {

    return this.loginForm.controls;

  }


  showError(
    control: AbstractControl
  ): boolean {

    return (
      control.invalid &&
      (
        control.touched ||
        this.submitted
      )
    );

  }


  onEmailInput(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    const sanitized =
      input.value.replace(
        /\s+/g,
        ''
      );


    if (
      sanitized !==
      input.value
    ) {

      input.value =
        sanitized;


      this.f.email
        .setValue(
          sanitized,
          {
            emitEvent: false
          }
        );


      this.f.email
        .markAsDirty();

    }

  }


  onEmailPaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as
        HTMLInputElement;


    const pastedText =
      (
        event.clipboardData
          ?.getData('text') ??
        ''
      )
        .replace(
          /\s+/g,
          ''
        );


    const start =
      input.selectionStart ??
      input.value.length;


    const end =
      input.selectionEnd ??
      input.value.length;


    const finalValue =
      (
        input.value.substring(
          0,
          start
        ) +

        pastedText +

        input.value.substring(
          end
        )
      )
        .replace(
          /\s+/g,
          ''
        );


    input.value =
      finalValue;


    this.f.email
      .setValue(
        finalValue,
        {
          emitEvent: false
        }
      );


    this.f.email
      .markAsDirty();

  }


  togglePassword():
    void {

    this.showPassword =
      !this.showPassword;

  }


  /* =======================================================
     ROLE-BASED DASHBOARD REDIRECT
  ======================================================= */

  private redirectUser(
    role: string
  ): void {

    switch (role) {

      case 'VEHICLE_OWNER':

        this.router.navigate(
          [
            '/owner-dashboard'
          ]
        );

        return;


      case 'DIAGNOSTIC_EXPERT':

        this.router.navigate(
          [
            '/expert-dashboard'
          ]
        );

        return;


      case 'COMPLIANCE_ADVISOR':

        this.router.navigate(
          [
            '/compliance-dashboard'
          ]
        );

        return;


      case 'ROADSIDE_RESPONDER':

        this.router.navigate(
          [
            '/responder-dashboard'
          ]
        );

        return;


      case 'ADMIN':

        this.router.navigate(
          [
            '/admin-dashboard'
          ]
        );

        return;


      default:

        this.router.navigate(
          [
            '/'
          ]
        );

        return;

    }

  }


  submit():
    void {

    if (
      this.isSubmitting
    ) {

      return;

    }


    this.submitted =
      true;


    if (!this.formValidationService.validateAndScroll(this.loginForm)) { return; }


    const values =
      this.loginForm
        .getRawValue();


    const email =
      (
        values.email ??
        ''
      )
        .trim()
        .toLowerCase();


    const password =
      values.password ??
      '';


    const rememberMe = true;


    const loginPayload = {

      email,

      password

    };


    this.isSubmitting =
      true;


    this.http
      .post<LoginResponse>(

        'http://localhost:5000/api/auth/login',

        loginPayload

      )
      .subscribe({

        next: response => {

          this.isSubmitting =
            false;


          this.submitted =
            false;


          this.authService
            .saveSession(

              response.token,

              response.user,

              rememberMe

            );


          this.redirectUser(
            response.user.role
          );

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isSubmitting =
            false;


          console.error(
            'DriveMate login failed:',
            error
          );


          const backendErrors =
            error.error?.errors as
              Record<string, string> |
              undefined;


          const detailedMessage =
            backendErrors
              ? Object.values(
                  backendErrors
                ).join('\n')
              : '';


          const message =
            detailedMessage ||
            error.error?.message ||
            'Unable to sign in. Please try again.';


          this.toast.show(
            message,
            'error'
          );

        }

      });

  }

}
