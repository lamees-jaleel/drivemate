import { Component, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { ToastService } from '../../shared/toast/toast.service';


type RegistrationRole =
  | 'VEHICLE_OWNER'
  | 'DIAGNOSTIC_EXPERT'
  | 'COMPLIANCE_ADVISOR';


/* =========================================================
   REGULAR EXPRESSIONS
========================================================= */

const FULL_NAME_REGEX =
  /^[A-Za-z]+(?: [A-Za-z]+)*$/;


const PHONE_REGEX =
  /^\d{10}$/;


const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;


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
const QUALIFICATION_REGEX =
  /^(?=.*[A-Za-z])[A-Za-z./]+(?: [A-Za-z./]+)*$/;


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
const SPECIALIZATION_REGEX =
  /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;


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
const SERVICE_LOCATION_REGEX =
  /^[A-Za-z]+(?:[ -][A-Za-z]+)*(?:,\s*[A-Za-z]+(?:[ -][A-Za-z]+)*)*$/;


/*
  Licence / Certificate Number

  Allowed:
  letters
  numbers
  hyphens
*/
const CERTIFICATE_REGEX =
  /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;


/* =========================================================
   CUSTOM VALIDATORS
========================================================= */

const nonBlankValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const value = control.value;

  if (typeof value !== 'string') {
    return null;
  }

  return value.trim().length > 0
    ? null
    : { blank: true };
};


function trimmedMinLength(
  minimumLength: number
): ValidatorFn {

  return (
    control: AbstractControl
  ): ValidationErrors | null => {

    const value = control.value;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const actualLength =
      String(value).trim().length;

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


const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const password =
    control.get('password')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;


  if (!password || !confirmPassword) {
    return null;
  }


  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};


const verificationFileValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const file =
    control.value as File | null;


  if (!file) {
    return null;
  }


  const allowedExtension =
    /\.(pdf|jpg|jpeg|png)$/i;


  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ];


  if (
    !allowedExtension.test(file.name) ||
    (
      file.type !== '' &&
      !allowedMimeTypes.includes(file.type)
    )
  ) {

    return {
      invalidFileType: true
    };
  }


  const maxSize =
    5 * 1024 * 1024;


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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private readonly formBuilder =
    inject(FormBuilder);


  private readonly http =
    inject(HttpClient);

  private readonly toast = inject(ToastService);
  private readonly formValidationService = inject(FormValidationService);

  submitted = false;

  isSubmitting = false;

  showPassword = false;

  showConfirmPassword = false;


  selectedRole: RegistrationRole =
    'VEHICLE_OWNER';


  /* =======================================================
     FORM
  ======================================================= */

  registerForm =
    this.formBuilder.group(
      {

        role: [
          'VEHICLE_OWNER' as RegistrationRole,
          Validators.required
        ],


        fullName: [
          '',
          [
            Validators.required,

            Validators.minLength(2),

            Validators.pattern(
              FULL_NAME_REGEX
            )
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

            Validators.pattern(
              PHONE_REGEX
            )
          ]
        ],


        email: [
          '',
          [
            Validators.required,

            Validators.pattern(
              EMAIL_REGEX
            )
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

            Validators.pattern(
              PASSWORD_REGEX
            )
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
          null as File | null
        ],


        acceptTerms: [
          false,
          Validators.requiredTrue
        ]

      },
      {
        validators:
          passwordMatchValidator
      }
    );


  get f() {
    return this.registerForm.controls;
  }


  /* =======================================================
     ERROR VISIBILITY
  ======================================================= */

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


  /* =======================================================
     GENERIC INPUT HELPERS
  ======================================================= */

  private proposedValue(
    input: HTMLInputElement,
    insertedText: string
  ): string {

    const start =
      input.selectionStart ??
      input.value.length;

    const end =
      input.selectionEnd ??
      input.value.length;


    return (
      input.value.substring(0, start) +
      insertedText +
      input.value.substring(end)
    );
  }


  private updateInputControl(
    input: HTMLInputElement,
    control: FormControl<string | null>,
    value: string
  ): void {

    input.value = value;

    control.setValue(
      value,
      {
        emitEvent: false
      }
    );

    control.markAsDirty();
  }


  trimTextControl(
    control: FormControl<string | null>
  ): void {

    const value =
      control.value ?? '';


    const trimmed =
      value.trim();


    if (value !== trimmed) {

      control.setValue(
        trimmed
      );
    }
  }


  /* =======================================================
     FULL NAME
  ======================================================= */

  onFullNameBeforeInput(
    event: Event
  ): void {

    const inputEvent =
      event as InputEvent;


    if (
      inputEvent.inputType.startsWith(
        'delete'
      )
    ) {
      return;
    }


    if (inputEvent.data === null) {
      return;
    }


    if (
      !/^[A-Za-z ]+$/.test(
        inputEvent.data
      )
    ) {

      event.preventDefault();

      return;
    }


    const input =
      event.target as HTMLInputElement;


    const candidate =
      this.proposedValue(
        input,
        inputEvent.data
      );


    if (
      candidate.startsWith(' ') ||
      candidate.includes('  ')
    ) {

      event.preventDefault();
    }
  }


  onFullNameInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      input.value

        .replace(
          /[^A-Za-z ]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.fullName,
        sanitized
      );
    }
  }


  onFullNamePaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      event.clipboardData
        ?.getData('text') ?? '';


    const cleaned =
      pasted

        .replace(
          /[^A-Za-z ]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        );


    const finalValue =
      this.proposedValue(
        input,
        cleaned
      )

        .replace(
          /[^A-Za-z ]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    this.updateInputControl(
      input,
      this.f.fullName,
      finalValue
    );
  }


  /* =======================================================
     PHONE
  ======================================================= */

  onPhoneBeforeInput(
    event: Event
  ): void {

    const inputEvent =
      event as InputEvent;


    if (
      inputEvent.inputType.startsWith(
        'delete'
      )
    ) {
      return;
    }


    if (inputEvent.data === null) {
      return;
    }


    if (
      !/^\d+$/.test(
        inputEvent.data
      )
    ) {

      event.preventDefault();

      return;
    }


    const input =
      event.target as HTMLInputElement;


    const candidate =
      this.proposedValue(
        input,
        inputEvent.data
      );


    if (
      candidate.length > 10
    ) {

      event.preventDefault();
    }
  }


  onPhoneInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      input.value
        .replace(/\D/g, '')
        .slice(0, 10);


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.phone,
        sanitized
      );
    }
  }


  onPhonePaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const raw =
      (
        event.clipboardData
          ?.getData('text') ?? ''
      ).trim();


    let digits = '';


    /*
      Local:
      9876543210

      Full Indian:
      +919876543210
    */
    if (
      /^\d{1,10}$/.test(raw)
    ) {

      digits = raw;

    }

    else if (
      /^\+91\d{10}$/.test(raw)
    ) {

      digits =
        raw.substring(3);

    }

    else {

      this.f.phone
        .markAsTouched();

      return;
    }


    const candidate =
      this.proposedValue(
        input,
        digits
      );


    if (
      !/^\d{0,10}$/.test(
        candidate
      )
    ) {

      return;
    }


    this.updateInputControl(
      input,
      this.f.phone,
      candidate
    );
  }


  /* =======================================================
     EMAIL
  ======================================================= */

  onEmailInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      input.value.replace(
        /\s+/g,
        ''
      );


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.email,
        sanitized
      );
    }
  }


  onEmailPaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      (
        event.clipboardData
          ?.getData('text') ?? ''
      ).replace(
        /\s+/g,
        ''
      );


    const candidate =
      this.proposedValue(
        input,
        pasted
      ).replace(
        /\s+/g,
        ''
      );


    this.updateInputControl(
      input,
      this.f.email,
      candidate
    );
  }


  /* =======================================================
     ADDRESS
  ======================================================= */

  onAddressInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      input.value

        .replace(
          /\s+/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.address,
        sanitized
      );
    }
  }


  onAddressPaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      (
        event.clipboardData
          ?.getData('text') ?? ''
      )

        .replace(
          /\s+/g,
          ' '
        );


    const candidate =
      this.proposedValue(
        input,
        pasted
      )

        .replace(
          /\s+/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    this.updateInputControl(
      input,
      this.f.address,
      candidate
    );
  }


  /* =======================================================
     YEARS OF EXPERIENCE
  ======================================================= */

  onExperienceBeforeInput(
    event: Event
  ): void {

    const inputEvent =
      event as InputEvent;


    if (
      inputEvent.inputType.startsWith(
        'delete'
      )
    ) {
      return;
    }


    if (inputEvent.data === null) {
      return;
    }


    if (
      !/^\d+$/.test(
        inputEvent.data
      )
    ) {

      event.preventDefault();

      return;
    }


    const input =
      event.target as HTMLInputElement;


    const candidate =
      this.proposedValue(
        input,
        inputEvent.data
      );


    if (
      candidate !== '' &&
      Number(candidate) > 60
    ) {

      event.preventDefault();
    }
  }


  onExperienceInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    let sanitized =
      input.value.replace(
        /\D/g,
        ''
      );


    if (
      sanitized !== '' &&
      Number(sanitized) > 60
    ) {

      sanitized = '60';
    }


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.yearsOfExperience,
        sanitized
      );
    }
  }


  onExperiencePaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      (
        event.clipboardData
          ?.getData('text') ?? ''
      ).trim();


    if (
      !/^\d+$/.test(pasted)
    ) {

      this.f.yearsOfExperience
        .markAsTouched();

      return;
    }


    const candidate =
      this.proposedValue(
        input,
        pasted
      );


    if (
      Number(candidate) > 60
    ) {

      this.f.yearsOfExperience
        .markAsTouched();

      return;
    }


    this.updateInputControl(
      input,
      this.f.yearsOfExperience,
      candidate
    );
  }


  /* =======================================================
     QUALIFICATION

     Allowed:
     letters
     spaces
     dots
     slashes
  ======================================================= */

  onQualificationBeforeInput(
    event: Event
  ): void {

    const inputEvent =
      event as InputEvent;


    if (
      inputEvent.inputType.startsWith(
        'delete'
      )
    ) {
      return;
    }


    if (inputEvent.data === null) {
      return;
    }


    if (
      !/^[A-Za-z./ ]+$/.test(
        inputEvent.data
      )
    ) {

      event.preventDefault();

      return;
    }


    const input =
      event.target as HTMLInputElement;


    const candidate =
      this.proposedValue(
        input,
        inputEvent.data
      );


    if (
      candidate.startsWith(' ') ||
      candidate.includes('  ')
    ) {

      event.preventDefault();
    }
  }


  onQualificationInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      input.value

        .replace(
          /[^A-Za-z./ ]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.qualification,
        sanitized
      );
    }
  }


  onQualificationPaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      event.clipboardData
        ?.getData('text') ?? '';


    const cleaned =
      pasted

        .replace(
          /[^A-Za-z./ ]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        );


    const candidate =
      this.proposedValue(
        input,
        cleaned
      )

        .replace(
          /[^A-Za-z./ ]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    this.updateInputControl(
      input,
      this.f.qualification,
      candidate
    );
  }


  /* =======================================================
     SPECIALIZATION

     Allowed:
     letters
     spaces
     hyphens
  ======================================================= */

  onSpecializationBeforeInput(
    event: Event
  ): void {

    const inputEvent =
      event as InputEvent;


    if (
      inputEvent.inputType.startsWith(
        'delete'
      )
    ) {
      return;
    }


    if (inputEvent.data === null) {
      return;
    }


    if (
      !/^[A-Za-z -]+$/.test(
        inputEvent.data
      )
    ) {

      event.preventDefault();

      return;
    }


    const input =
      event.target as HTMLInputElement;


    const candidate =
      this.proposedValue(
        input,
        inputEvent.data
      );


    if (
      candidate.startsWith(' ') ||
      candidate.includes('  ')
    ) {

      event.preventDefault();
    }
  }


  onSpecializationInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      input.value

        .replace(
          /[^A-Za-z -]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.specialization,
        sanitized
      );
    }
  }


  onSpecializationPaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      event.clipboardData
        ?.getData('text') ?? '';


    const cleaned =
      pasted

        .replace(
          /[^A-Za-z -]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        );


    const candidate =
      this.proposedValue(
        input,
        cleaned
      )

        .replace(
          /[^A-Za-z -]/g,
          ''
        )

        .replace(
          / {2,}/g,
          ' '
        )

        .replace(
          /^ +/,
          ''
        );


    this.updateInputControl(
      input,
      this.f.specialization,
      candidate
    );
  }


  /* =======================================================
     SERVICE LOCATION

     Allowed:
     letters
     spaces
     commas
     hyphens
  ======================================================= */

  onServiceLocationBeforeInput(
    event: Event
  ): void {

    const inputEvent =
      event as InputEvent;


    if (
      inputEvent.inputType.startsWith(
        'delete'
      )
    ) {
      return;
    }


    if (inputEvent.data === null) {
      return;
    }


    if (
      !/^[A-Za-z,\- ]+$/.test(
        inputEvent.data
      )
    ) {

      event.preventDefault();

      return;
    }
  }


  onServiceLocationInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const sanitized =
      this.sanitizeServiceLocation(
        input.value
      );


    if (
      sanitized !== input.value
    ) {

      this.updateInputControl(
        input,
        this.f.serviceLocation,
        sanitized
      );
    }
  }


  onServiceLocationPaste(
    event: ClipboardEvent
  ): void {

    event.preventDefault();


    const input =
      event.target as HTMLInputElement;


    const pasted =
      event.clipboardData
        ?.getData('text') ?? '';


    const candidate =
      this.proposedValue(
        input,
        pasted
      );


    const sanitized =
      this.sanitizeServiceLocation(
        candidate
      );


    this.updateInputControl(
      input,
      this.f.serviceLocation,
      sanitized
    );
  }


  private sanitizeServiceLocation(
    value: string
  ): string {

    return value

      .replace(
        /[^A-Za-z,\- ]/g,
        ''
      )

      .replace(
        /\s+/g,
        ' '
      )

      .replace(
        /\s*,\s*/g,
        ', '
      )

      .replace(
        /,{2,}/g,
        ','
      )

      .replace(
        /^ +/,
        ''
      );
  }


  /* =======================================================
     ROLE
  ======================================================= */

  selectRole(
    role: RegistrationRole
  ): void {

    this.selectedRole = role;

    this.f.role.setValue(role);

    this.configureProfessionalValidators();
  }


  /* =======================================================
     PROFESSIONAL VALIDATORS
  ======================================================= */

  private configureProfessionalValidators():
    void {


    if (
      this.selectedRole ===
      'VEHICLE_OWNER'
    ) {

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

        Validators.pattern(
          QUALIFICATION_REGEX
        )
      ]);


    /* Specialization */
    this.f.specialization
      .setValidators([
        Validators.required,

        nonBlankValidator,

        Validators.pattern(
          SPECIALIZATION_REGEX
        )
      ]);


    /* Experience */
    this.f.yearsOfExperience
      .setValidators([
        Validators.required,

        Validators.pattern(
          /^\d+$/
        ),

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

        Validators.pattern(
          CERTIFICATE_REGEX
        )
      ]);


    /* Service Location */
    this.f.serviceLocation
      .setValidators([
        Validators.required,

        Validators.pattern(
          SERVICE_LOCATION_REGEX
        )
      ]);


    /* Verification Document */
    this.f.verificationDocument
      .setValidators([
        Validators.required,

        verificationFileValidator
      ]);


    this.updateProfessionalControls();
  }


  private updateProfessionalControls():
    void {

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

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const file =
      input.files?.item(0) ?? null;


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
    if (
      this.f.verificationDocument
        .invalid &&
      file
    ) {

      input.value = '';
    }
  }


  /* =======================================================
     PASSWORD
  ======================================================= */

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;
  }


  /* =======================================================
     SUBMIT
  ======================================================= */

  submit(): void {

    if (this.isSubmitting) {
      return;
    }


    this.submitted = true;


    this.configureProfessionalValidators();


    if (!this.formValidationService.validateAndScroll(this.registerForm)) { return; }


    const values =
      this.registerForm
        .getRawValue();


    const formData =
      new FormData();


    /* =====================================================
       BASIC ACCOUNT INFORMATION
    ===================================================== */

    formData.append(
      'role',
      values.role ??
        this.selectedRole
    );


    formData.append(
      'fullName',
      (
        values.fullName ??
        ''
      ).trim()
    );


    /*
      The form stores only the
      10-digit Indian phone number.

      The backend expects:
      +91XXXXXXXXXX
    */
    formData.append(
      'phone',
      `+91${values.phone ?? ''}`
    );


    formData.append(
      'email',
      (
        values.email ??
        ''
      )
        .trim()
        .toLowerCase()
    );


    formData.append(
      'address',
      (
        values.address ??
        ''
      ).trim()
    );


    formData.append(
      'password',
      values.password ??
        ''
    );


    formData.append(
      'termsAccepted',
      String(
        values.acceptTerms === true
      )
    );


    /* =====================================================
       PROFESSIONAL INFORMATION
    ===================================================== */

    if (
      this.selectedRole !==
      'VEHICLE_OWNER'
    ) {

      formData.append(
        'qualification',
        (
          values.qualification ??
          ''
        ).trim()
      );


      formData.append(
        'specialization',
        (
          values.specialization ??
          ''
        ).trim()
      );


      formData.append(
        'yearsOfExperience',
        String(
          values.yearsOfExperience ??
          ''
        )
      );


      formData.append(
        'organizationName',
        (
          values.organizationName ??
          ''
        ).trim()
      );


      formData.append(
        'certificateNumber',
        (
          values.certificateNumber ??
          ''
        ).trim()
      );


      formData.append(
        'serviceLocation',
        (
          values.serviceLocation ??
          ''
        ).trim()
      );


      const verificationDocument =
        values.verificationDocument;


      if (verificationDocument) {

        formData.append(
          'verificationDocument',
          verificationDocument,
          verificationDocument.name
        );
      }
    }


    /* =====================================================
       SEND TO BACKEND
    ===================================================== */

    this.isSubmitting = true;


    this.http.post<{
      success: boolean;
      message: string;
    }>(
      'http://localhost:5000/api/auth/register',
      formData
    )
    .subscribe({

      next: response => {

        this.isSubmitting = false;

        this.submitted = false;


        this.toast.show(
          response.message ||
          'Registration successful.',
          'success'
        );
      },


      error: (
        error: HttpErrorResponse
      ) => {

        this.isSubmitting = false;


        console.error(
          'DriveMate registration failed:',
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


        this.toast.show(
          detailedMessage ||
          error.error?.message ||
          'Registration failed. Please try again.',
          'error'
        );
      }

    });
  }

}


