import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
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


const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


interface LoginResponse {

  success: boolean;

  message: string;

  token: string;

  user: AuthenticatedUser;

}


interface GoogleCredentialResponse {

  credential: string;

  select_by?: string;

}


interface GoogleIdentityApi {

  initialize(config: {
    client_id: string;
    callback: (
      response: GoogleCredentialResponse
    ) => void;
  }): void;

  renderButton(
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline' | 'filled_blue' | 'filled_black';
      size: 'large' | 'medium' | 'small';
      text: 'signin_with' | 'signup_with' | 'continue_with';
      shape: 'rectangular' | 'pill';
      logo_alignment: 'left' | 'center';
      width: number;
    }
  ): void;

}


declare global {

  interface Window {

    google?: {
      accounts: {
        id: GoogleIdentityApi;
      };
    };

  }

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
export class Login
  implements AfterViewInit {

  private readonly formBuilder =
    inject(FormBuilder);


  private readonly http =
    inject(HttpClient);


  private readonly router =
    inject(Router);


  private readonly authService =
    inject(AuthService);


  @ViewChild(
    'googleButton'
  )
  private googleButton?:
    ElementRef<HTMLDivElement>;


  submitted =
    false;


  showPassword =
    false;


  isSubmitting =
    false;


  isGoogleSubmitting =
    false;


  googleErrorMessage =
    '';


  private googleRenderAttempts =
    0;


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


  ngAfterViewInit():
    void {

    this.renderGoogleButton();

  }


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
     GOOGLE BUTTON
  ======================================================= */

  private renderGoogleButton():
    void {

    const host =
      this.googleButton
        ?.nativeElement;


    if (!host) {

      return;

    }


    const clientId =
      document
        .querySelector<HTMLMetaElement>(
          'meta[name="google-client-id"]'
        )
        ?.content
        .trim() ??
      '';


    if (
      !clientId ||
      clientId ===
        'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    ) {

      this.googleErrorMessage =
        'Google Sign-In is not configured yet.';

      return;

    }


    if (!window.google?.accounts?.id) {

      if (
        this.googleRenderAttempts <
        20
      ) {

        this.googleRenderAttempts +=
          1;


        window.setTimeout(
          () =>
            this.renderGoogleButton(),
          250
        );

        return;

      }


      this.googleErrorMessage =
        'Unable to load Google Sign-In. Please refresh the page.';

      return;

    }


    this.googleErrorMessage =
      '';


    host.innerHTML =
      '';


    window.google.accounts.id.initialize({

      client_id:
        clientId,

      callback:
        response =>
          this.handleGoogleCredential(
            response
          )

    });


    window.google.accounts.id.renderButton(
      host,
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 400
      }
    );

  }


  private handleGoogleCredential(
    response: GoogleCredentialResponse
  ): void {

    if (
      this.isGoogleSubmitting ||
      !response.credential
    ) {

      return;

    }


    this.googleErrorMessage =
      '';


    this.isGoogleSubmitting =
      true;


    this.http
      .post<LoginResponse>(

        'http://localhost:5000/api/auth/google',

        {
          credential:
            response.credential
        }

      )
      .subscribe({

        next: loginResponse => {

          this.isGoogleSubmitting =
            false;


          this.authService
            .saveSession(

              loginResponse.token,

              loginResponse.user

            );


          this.redirectUser(
            loginResponse.user.role
          );

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isGoogleSubmitting =
            false;


          console.error(
            'DriveMate Google login failed:',
            error
          );


          this.googleErrorMessage =
            error.error?.message ||
            'Unable to continue with Google. Please try again.';

        }

      });

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


  /* =======================================================
     EMAIL / PASSWORD LOGIN
  ======================================================= */

  submit():
    void {

    if (
      this.isSubmitting
    ) {

      return;

    }


    this.submitted =
      true;


    this.loginForm
      .markAllAsTouched();


    if (
      this.loginForm.invalid
    ) {

      return;

    }


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

              response.user

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


          alert(
            message
          );

        }

      });

  }

}