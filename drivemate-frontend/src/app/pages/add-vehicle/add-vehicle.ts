import { OwnerTopbar } from '../../shared/owner-topbar/owner-topbar';
import {
  Component,
  inject,
  OnInit
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

import { Location } from '@angular/common';
import { FormValidationService } from '../../shared/services/form-validation.service';
import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import { ToastService } from '../../shared/toast/toast.service';

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
    OwnerTopbar,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './add-vehicle.html',

  styleUrl:
    './add-vehicle.css'
})
export class AddVehicle implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);


  private readonly vehicleService =
    inject(VehicleService);


  private readonly authService =
    inject(AuthService);


  private readonly router =
    inject(Router);

  private readonly location = inject(Location);
  private readonly formValidationService = inject(FormValidationService);


  private readonly route =
    inject(ActivatedRoute);

  private readonly toast =
    inject(ToastService);

  vehicleId: number | null = null;

  isEditMode = false;


  submitted =
    false;


  isSubmitting =
    false;


  selectedFile: File | null = null;


  imagePreviewUrl: string | null = null;


  currentYear =
    new Date().getFullYear();


  maximumVehicleYear =
    this.currentYear + 1;


  ngOnInit(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');


    if (idParam) {

      this.vehicleId =
        Number(idParam);

      this.isEditMode =
        true;

      this.loadVehicleDetails(
        this.vehicleId
      );

    }

  }


  private loadVehicleDetails(
    id: number
  ): void {

    this.vehicleService
      .getVehicleById(id)
      .subscribe({

        next: response => {

          const vehicle =
            response.vehicle;


          // Extract placeholder type if exists
          let placeholderType = 'CAR';

          if (
            vehicle.vehicleImagePath &&
            vehicle.vehicleImagePath.startsWith('placeholder:')
          ) {

            placeholderType =
              vehicle.vehicleImagePath.split(':')[1] || 'CAR';

          }

          else if (
            vehicle.vehicleImagePath
          ) {

            this.imagePreviewUrl =
              `http://localhost:5000/${vehicle.vehicleImagePath}`;

          }


          this.vehicleForm.patchValue({

            vehicleType:
              placeholderType,

            registrationNumber:
              vehicle.registrationNumber,

            make:
              vehicle.make,

            model:
              vehicle.model,

            variant:
              vehicle.variant ?? '',

            manufacturingYear:
              vehicle.manufacturingYear,

            fuelType:
              vehicle.fuelType,

            transmission:
              vehicle.transmission ?? '',

            color:
              vehicle.color ?? '',

            vin:
              vehicle.vin ?? '',

            engineNumber:
              vehicle.engineNumber ?? '',

            odometerKm:
              vehicle.odometerKm,

            purchaseDate:
              vehicle.purchaseDate
                ? vehicle.purchaseDate.substring(0, 10)
                : '',

            ownershipType:
              vehicle.ownershipType

          });

        },


        error: (
          err: HttpErrorResponse
        ) => {

          console.error(
            'Unable to load vehicle details:',
            err
          );


          this.toast.show(
            'Unable to load vehicle details. Redirecting to dashboard.',
            'error'
          );


          this.router.navigate(
            [
              '/owner-dashboard'
            ]
          );

        }

      });

  }


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

      vehicleType: [
        'CAR',
        Validators.required
      ],

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
     FILE UPLOAD HANDLERS
  ======================================================= */

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    const allowedExtensions =
      /\.(jpg|jpeg|png)$/i;


    if (
      !allowedExtensions.test(
        file.name
      )
    ) {

      this.toast.show(
        'Only JPG, JPEG, and PNG files are allowed.',
        'error'
      );

      input.value = '';

      return;

    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      this.toast.show(
        'File size must not exceed 5MB.',
        'error'
      );

      input.value = '';

      return;

    }


    this.selectedFile =
      file;


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreviewUrl =
        reader.result as
          string;

    };


    reader.readAsDataURL(
      file
    );

  }


  removeSelectedImage(): void {

    this.selectedFile =
      null;


    this.imagePreviewUrl =
      null;


    const fileInput =
      document.getElementById(
        'vehicleImage'
      ) as
        HTMLInputElement;


    if (fileInput) {

      fileInput.value = '';

    }

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

  goBack(event: Event): void {
    event.preventDefault();
    this.location.back();
  }

  submit(): void {

    if (
      this.isSubmitting
    ) {

      return;

    }


    this.submitted =
      true;


    if (!this.formValidationService.validateAndScroll(this.vehicleForm)) { return; }


    const values =
      this.vehicleForm
        .getRawValue();


    const formData = new FormData();

    formData.append(
      'registrationNumber',
      (values.registrationNumber ?? '').trim()
    );

    formData.append(
      'make',
      (values.make ?? '').trim()
    );

    formData.append(
      'model',
      (values.model ?? '').trim()
    );

    formData.append(
      'variant',
      (values.variant ?? '').trim()
    );

    formData.append(
      'manufacturingYear',
      String(values.manufacturingYear)
    );

    formData.append(
      'fuelType',
      values.fuelType ?? ''
    );

    formData.append(
      'transmission',
      values.transmission ?? ''
    );

    formData.append(
      'color',
      (values.color ?? '').trim()
    );

    formData.append(
      'vin',
      (values.vin ?? '').trim()
    );

    formData.append(
      'engineNumber',
      (values.engineNumber ?? '').trim()
    );

    formData.append(
      'odometerKm',
      String(values.odometerKm ?? 0)
    );

    formData.append(
      'purchaseDate',
      values.purchaseDate ?? ''
    );

    formData.append(
      'ownershipType',
      values.ownershipType ?? 'OWNED'
    );


    if (this.selectedFile) {

      formData.append(
        'vehicleImage',
        this.selectedFile
      );

    }

    else {

      formData.append(
        'vehicleImagePath',
        'placeholder:' + (values.vehicleType ?? 'CAR')
      );

    }


    this.isSubmitting =
      true;


    const request =
      this.isEditMode && this.vehicleId
        ? this.vehicleService.updateVehicle(this.vehicleId, formData)
        : this.vehicleService.addVehicle(formData);


    request.subscribe({

        next: response => {

          this.isSubmitting =
            false;


          this.toast.show(
            response.message ||
            (this.isEditMode ? 'Vehicle updated successfully.' : 'Vehicle added successfully.'),
            'success'
          );


          this.router.navigate(
            [
              this.isEditMode
                ? `/owner-dashboard/vehicles/${this.vehicleId}`
                : '/owner-dashboard'
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


            this.toast.show(
              error.error?.message ||
              'Your login session has expired. Please sign in again.',
              'error'
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


          this.toast.show(
            detailedMessage ||
            error.error?.message ||
            'Unable to add vehicle. Please try again.',
            'error'
          );

        }

      });

  }

}



