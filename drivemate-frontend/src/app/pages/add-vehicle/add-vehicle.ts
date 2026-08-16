import {
  Component,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  AddVehiclePayload,
  FuelType,
  OwnershipType,
  TransmissionType,
  VehicleService
} from '../../services/vehicle.service';


/* =========================================================
   NON-BLANK VALIDATOR
========================================================= */

const nonBlankValidator:
  ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {

  const value =
    control.value;


  if (
    typeof value !==
    'string'
  ) {

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

@Component({
  selector: 'app-add-vehicle',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './add-vehicle.html',

  styleUrl:
    './add-vehicle.css'
})
export class AddVehicle {

  private readonly formBuilder =
    inject(FormBuilder);


  private readonly vehicleService =
    inject(VehicleService);


  private readonly authService =
    inject(AuthService);


  private readonly router =
    inject(Router);


  submitted =
    false;


  isSubmitting =
    false;


  currentYear =
    new Date().getFullYear();


  maximumVehicleYear =
    this.currentYear + 1;


  /* =======================================================
     OPTIONS
  ======================================================= */

  fuelTypes: {
    value: FuelType;
    label: string;
  }[] = [

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


  transmissionTypes: {
    value: TransmissionType;
    label: string;
  }[] = [

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


  ownershipTypes: {
    value: OwnershipType;
    label: string;
  }[] = [

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

  vehicleForm =
    this.formBuilder.group({

      registrationNumber: [
        '',
        [
          Validators.required,

          nonBlankValidator,

          Validators.maxLength(
            20
          )
        ]
      ],


      make: [
        '',
        [
          Validators.required,

          nonBlankValidator,

          Validators.maxLength(
            80
          )
        ]
      ],


      model: [
        '',
        [
          Validators.required,

          nonBlankValidator,

          Validators.maxLength(
            80
          )
        ]
      ],


      variant: [
        '',
        [
          Validators.maxLength(
            80
          )
        ]
      ],


      manufacturingYear: [
        null as number | null,
        [
          Validators.required,

          Validators.min(
            1900
          ),

          Validators.max(
            this.maximumVehicleYear
          )
        ]
      ],


      fuelType: [
        '' as FuelType | '',
        Validators.required
      ],


      transmission: [
        '' as
          TransmissionType |
          ''
      ],


      color: [
        '',
        [
          Validators.maxLength(
            50
          )
        ]
      ],


      vin: [
        '',
        [
          Validators.maxLength(
            50
          ),

          Validators.pattern(
            /^[A-Za-z0-9]*$/
          )
        ]
      ],


      engineNumber: [
        '',
        [
          Validators.maxLength(
            50
          ),

          Validators.pattern(
            /^[A-Za-z0-9-]*$/
          )
        ]
      ],


      odometerKm: [
        0,
        [
          Validators.required,

          Validators.min(
            0
          ),

          Validators.max(
            5000000
          )
        ]
      ],


      purchaseDate: [
        ''
      ],


      ownershipType: [
        'OWNED' as OwnershipType,
        Validators.required
      ]

    });


  get f() {

    return this.vehicleForm.controls;

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
     UPPERCASE REGISTRATION NUMBER
  ======================================================= */

  onRegistrationInput(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    const cleaned =
      input.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9 -]/g,
          ''
        );


    input.value =
      cleaned;


    this.f.registrationNumber
      .setValue(
        cleaned,
        {
          emitEvent: false
        }
      );

  }


  /* =======================================================
     VIN
  ======================================================= */

  onVinInput(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    const cleaned =
      input.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ''
        );


    input.value =
      cleaned;


    this.f.vin.setValue(
      cleaned,
      {
        emitEvent: false
      }
    );

  }


  /* =======================================================
     ENGINE NUMBER
  ======================================================= */

  onEngineNumberInput(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    const cleaned =
      input.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9-]/g,
          ''
        );


    input.value =
      cleaned;


    this.f.engineNumber
      .setValue(
        cleaned,
        {
          emitEvent: false
        }
      );

  }


  /* =======================================================
     CANCEL
  ======================================================= */

  cancel(): void {

    this.router.navigate(
      [
        '/owner-dashboard'
      ]
    );

  }


  /* =======================================================
     SUBMIT
  ======================================================= */

  submit(): void {

    if (
      this.isSubmitting
    ) {

      return;

    }


    this.submitted =
      true;


    this.vehicleForm
      .markAllAsTouched();


    if (
      this.vehicleForm.invalid
    ) {

      return;

    }


    const values =
      this.vehicleForm
        .getRawValue();


    const payload:
      AddVehiclePayload = {

      registrationNumber:
        (
          values.registrationNumber ??
          ''
        ).trim(),


      make:
        (
          values.make ??
          ''
        ).trim(),


      model:
        (
          values.model ??
          ''
        ).trim(),


      variant:
        (
          values.variant ??
          ''
        ).trim(),


      manufacturingYear:
        Number(
          values.manufacturingYear
        ),


      fuelType:
        values.fuelType as
          FuelType,


      transmission:
        values.transmission ??
        '',


      color:
        (
          values.color ??
          ''
        ).trim(),


      vin:
        (
          values.vin ??
          ''
        ).trim(),


      engineNumber:
        (
          values.engineNumber ??
          ''
        ).trim(),


      odometerKm:
        Number(
          values.odometerKm ??
          0
        ),


      purchaseDate:
        values.purchaseDate ??
        '',


      ownershipType:
        values.ownershipType as
          OwnershipType

    };


    this.isSubmitting =
      true;


    this.vehicleService
      .addVehicle(
        payload
      )
      .subscribe({

        next: response => {

          this.isSubmitting =
            false;


          alert(
            response.message ||
            'Vehicle added successfully.'
          );


          this.router.navigate(
            [
              '/owner-dashboard'
            ]
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.isSubmitting =
            false;


          console.error(
            'Add vehicle failed:',
            error
          );


          /*
            JWT missing / expired.
          */

          if (
            error.status ===
            401
          ) {

            this.authService
              .clearSession();


            alert(
              error.error?.message ||
              'Your login session has expired. Please sign in again.'
            );


            this.router.navigate(
              [
                '/login'
              ]
            );

            return;

          }


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


          alert(
            detailedMessage ||
            error.error?.message ||
            'Unable to add vehicle. Please try again.'
          );

        }

      });

  }

}