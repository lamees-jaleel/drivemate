import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  Vehicle,
  VehicleService
} from '../../services/vehicle.service';

import {
  AddMaintenancePayload,
  MaintenanceRecord,
  MaintenanceService,
  MaintenanceType
} from '../../services/maintenance.service';


@Component({
  selector:
    'app-maintenance',

  standalone:
    true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './maintenance.html',

  styleUrl:
    './maintenance.css'
})
export class Maintenance
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);


  private readonly router =
    inject(Router);


  private readonly formBuilder =
    inject(FormBuilder);


  private readonly vehicleService =
    inject(VehicleService);


  private readonly maintenanceService =
    inject(MaintenanceService);


  private readonly authService =
    inject(AuthService);


  vehicle:
    Vehicle |
    null = null;


  maintenanceRecords:
    MaintenanceRecord[] = [];


  vehicleId =
    0;


  loading =
    true;


  isSubmitting =
    false;


  submitted =
    false;


  pageErrorMessage =
    '';


  formErrorMessage =
    '';


  successMessage =
    '';


  /* =======================================================
     MAINTENANCE OPTIONS
  ======================================================= */

  maintenanceTypes: {
    value: MaintenanceType;
    label: string;
  }[] = [

    {
      value: 'ROUTINE_SERVICE',
      label: 'Routine Service'
    },

    {
      value: 'OIL_CHANGE',
      label: 'Oil Change'
    },

    {
      value: 'REPAIR',
      label: 'Repair'
    },

    {
      value: 'TYRE_SERVICE',
      label: 'Tyre Service'
    },

    {
      value: 'BATTERY_SERVICE',
      label: 'Battery Service'
    },

    {
      value: 'INSPECTION',
      label: 'Inspection'
    },

    {
      value: 'OTHER',
      label: 'Other'
    }

  ];


  /* =======================================================
     FORM
  ======================================================= */

  maintenanceForm =
    this.formBuilder.group({

      maintenanceType: [
        '' as
          MaintenanceType |
          '',
        Validators.required
      ],


      title: [
        '',
        [
          Validators.required,

          Validators.maxLength(
            120
          )
        ]
      ],


      serviceDate: [
        '',
        Validators.required
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


      serviceCenter: [
        '',
        [
          Validators.maxLength(
            150
          )
        ]
      ],


      description: [
        '',
        [
          Validators.maxLength(
            1000
          )
        ]
      ],


      cost: [
        0,
        [
          Validators.required,

          Validators.min(
            0
          )
        ]
      ],


      nextServiceDate: [
        ''
      ],


      nextServiceOdometerKm: [
        null as
          number |
          null,
        [
          Validators.min(
            0
          ),

          Validators.max(
            5000000
          )
        ]
      ]

    });


  get f() {

    return this.maintenanceForm
      .controls;

  }


  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  get recordCount():
    number {

    return this.maintenanceRecords
      .length;

  }


  get totalMaintenanceCost():
    number {

    return this.maintenanceRecords
      .reduce(
        (
          total,
          record
        ) => {

          return (
            total +
            Number(
              record.cost
            )
          );

        },
        0
      );

  }


  /* =======================================================
     INITIALIZE
  ======================================================= */

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      this.loading =
        false;


      this.pageErrorMessage =
        'Invalid vehicle ID.';


      return;

    }


    this.vehicleId =
      id;


    this.loadVehicle();

  }


  /* =======================================================
     LOAD VEHICLE
  ======================================================= */

  private loadVehicle():
    void {

    this.loading =
      true;


    this.vehicleService
      .getVehicleById(
        this.vehicleId
      )
      .subscribe({

        next: response => {

          this.vehicle =
            response.vehicle;


          /*
            Start new maintenance records
            using the current vehicle
            odometer.
          */

          this.f.odometerKm
            .setValue(
              response.vehicle
                .odometerKm
            );


          this.loadMaintenance();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.handlePageError(
            error
          );

        }

      });

  }


  /* =======================================================
     LOAD MAINTENANCE HISTORY
  ======================================================= */

  private loadMaintenance():
    void {

    this.maintenanceService
      .getMaintenanceRecords(
        this.vehicleId
      )
      .subscribe({

        next: response => {

          this.maintenanceRecords =
            response
              .maintenanceRecords;


          this.loading =
            false;

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.handlePageError(
            error
          );

        }

      });

  }


  /* =======================================================
     PAGE ERROR
  ======================================================= */

  private handlePageError(
    error: HttpErrorResponse
  ): void {

    this.loading =
      false;


    console.error(
      'Maintenance page error:',
      error
    );


    if (
      error.status ===
      401
    ) {

      this.authService
        .clearSession();


      this.router.navigate(
        [
          '/login'
        ]
      );


      return;

    }


    if (
      error.status ===
      404
    ) {

      this.pageErrorMessage =
        'Vehicle not found.';


      return;

    }


    this.pageErrorMessage =
      error.error?.message ||
      'Unable to load maintenance information.';

  }


  /* =======================================================
     FORM ERROR VISIBILITY
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


    this.formErrorMessage =
      '';


    this.successMessage =
      '';


    this.maintenanceForm
      .markAllAsTouched();


    if (
      this.maintenanceForm
        .invalid
    ) {

      return;

    }


    const values =
      this.maintenanceForm
        .getRawValue();


    const payload:
      AddMaintenancePayload = {

      maintenanceType:
        values.maintenanceType as
          MaintenanceType,


      title:
        (
          values.title ??
          ''
        ).trim(),


      serviceDate:
        values.serviceDate ??
        '',


      odometerKm:
        Number(
          values.odometerKm ??
          0
        ),


      serviceCenter:
        (
          values.serviceCenter ??
          ''
        ).trim(),


      description:
        (
          values.description ??
          ''
        ).trim(),


      cost:
        Number(
          values.cost ??
          0
        ),


      nextServiceDate:
        values.nextServiceDate ??
        '',


      nextServiceOdometerKm:
        values.nextServiceOdometerKm

    };


    this.isSubmitting =
      true;


    this.maintenanceService
      .addMaintenanceRecord(
        this.vehicleId,
        payload
      )
      .subscribe({

        next: response => {

          this.isSubmitting =
            false;


          this.submitted =
            false;


          this.successMessage =
            response.message;


          /*
            New service record may
            advance vehicle odometer.
          */

          const latestOdometer =
            payload.odometerKm;


          this.maintenanceForm
            .reset({

              maintenanceType:
                '',

              title:
                '',

              serviceDate:
                '',

              odometerKm:
                latestOdometer,

              serviceCenter:
                '',

              description:
                '',

              cost:
                0,

              nextServiceDate:
                '',

              nextServiceOdometerKm:
                null

            });


          this.loadMaintenance();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isSubmitting =
            false;


          console.error(
            'Add maintenance failed:',
            error
          );


          if (
            error.status ===
            401
          ) {

            this.authService
              .clearSession();


            this.router.navigate(
              [
                '/login'
              ]
            );


            return;

          }


          const errors =
            error.error?.errors as
              Record<string, string> |
              undefined;


          this.formErrorMessage =
            errors
              ? Object.values(
                  errors
                ).join(' ')
              : (
                  error.error?.message ||
                  'Unable to save maintenance record.'
                );

        }

      });

  }


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  formatDate(
    value:
      string |
      null |
      undefined
  ): string {

    if (!value) {

      return 'Not specified';

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return 'Not specified';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric'
      }
    ).format(
      date
    );

  }


  /* =======================================================
     FORMAT COST
  ======================================================= */

  formatCost(
    value:
      string |
      number
  ): string {

    const amount =
      Number(
        value
      );


    return new Intl.NumberFormat(
      'en-IN',
      {
        style:
          'currency',

        currency:
          'INR',

        maximumFractionDigits:
          2
      }
    ).format(
      amount
    );

  }


  /* =======================================================
     MAINTENANCE LABEL
  ======================================================= */

  getMaintenanceLabel(
    type: MaintenanceType
  ): string {

    return (
      this.maintenanceTypes
        .find(
          item =>
            item.value ===
            type
        )
        ?.label ??
      type
    );

  }

}