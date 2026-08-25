import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  NgClass
} from '@angular/common';

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

import {
  DiagnosticService,
  DiagnosticRequest,
  DiagnosticConcernType,
  DiagnosticUrgency
} from '../../services/diagnostic.service';


@Component({
  selector:
    'app-maintenance',

  standalone:
    true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgClass
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


  private readonly diagnosticService =
    inject(DiagnosticService);


  vehicle:
    Vehicle |
    null = null;


  maintenanceRecords:
    MaintenanceRecord[] = [];


  vehicles:
    Vehicle[] = [];


  showVehicleSelector =
    false;


  activeTab: 'logs' | 'bookings' =
    'logs';


  bookings:
    DiagnosticRequest[] = [];


  loadingBookings =
    false;


  bookingSubmitting =
    false;


  bookingSuccess =
    '';


  bookingError =
    '';


  vehicleId = 0;

  isDirectRoute = false;



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


  bookingForm =
    this.formBuilder.group({

      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ],

      concernType: [
        '',
        Validators.required
      ],

      urgency: [
        'NORMAL',
        Validators.required
      ],

      providerType: [
        'AUTHORIZED',
        Validators.required
      ],

      shopName: [
        ''
      ],

      symptoms: [
        '',
        [
          Validators.required,
          Validators.maxLength(1500)
        ]
      ],

      odometerKm: [
        null as number | null
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

    const idParam =
      this.route.snapshot.paramMap.get('id');


    if (!idParam) {
      this.isDirectRoute = false;

      this.loadAllVehicles();

      return;

    }


    this.isDirectRoute = true;

    const id =
      Number(idParam);


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      this.loadAllVehicles();

      return;

    }


    this.vehicleId =
      id;


    this.loadVehicle();

  }


  loadAllVehicles(): void {

    this.loading =
      true;


    this.vehicleService
      .getMyVehicles()
      .subscribe({

        next: response => {

          this.vehicles =
            response.vehicles;


          if (
            this.vehicles.length ===
            0
          ) {

            this.pageErrorMessage =
              'You do not have any registered vehicles yet.';

            this.loading =
              false;

          }

          else if (
            this.vehicles.length ===
            1
          ) {

            this.vehicleId =
              this.vehicles[0].id;

            this.loadVehicle();

          }

          else {

            this.showVehicleSelector =
              true;

            this.loading =
              false;

          }

        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.loading =
            false;


          this.pageErrorMessage =
            'Unable to load your vehicles. Please try again.';

        }

      });

  }


  selectVehicle(
    vehicleId: number
  ): void {

    this.vehicleId =
      vehicleId;


    this.showVehicleSelector =
      false;


    this.loadVehicle();

  }


  /* =======================================================
     LOAD VEHICLE
  ======================================================= */

  
  clearSelection(): void {
    this.vehicle = null;
    this.vehicleId = 0;
    this.showVehicleSelector = true;
  }

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


          this.loadBookings();

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


  /* =======================================================
     LIVE MAINTENANCE BOOKINGS
  ======================================================= */

  setTab(tab: 'logs' | 'bookings'): void {

    this.activeTab = tab;


    if (tab === 'bookings') {

      this.loadBookings();

    }

  }


  loadBookings(): void {

    if (!this.vehicleId) return;


    this.loadingBookings = true;


    this.diagnosticService
      .getVehicleRequests(this.vehicleId)
      .subscribe({

        next: response => {

          this.bookings = response.requests;

          this.loadingBookings = false;

        },


        error: () => {

          this.loadingBookings = false;

        }

      });

  }


  submitBooking(): void {

    if (this.bookingForm.invalid) {

      this.bookingForm.markAllAsTouched();

      return;

    }


    this.bookingSubmitting = true;

    this.bookingSuccess = '';

    this.bookingError = '';


    const v = this.bookingForm.value;

    const payload = {
      title:        v.title ?? '',
      concernType:  v.concernType as any,
      urgency:      (v.urgency ?? 'NORMAL') as any,
      providerType: (v.providerType ?? 'DRIVEMATE_EXPERT') as any,
      shopName:     v.shopName?.trim() || undefined,
      symptoms:     v.symptoms ?? '',
      odometerKm:   v.odometerKm ? Number(v.odometerKm) : undefined
    };


    this.diagnosticService
      .bookSlot(this.vehicleId, payload)
      .subscribe({

        next: response => {

          this.bookingSuccess = 'Your maintenance slot booking was successfully submitted! A provider will accept it shortly.';

          this.bookingForm.reset({
            urgency: 'NORMAL',
            providerType: 'DRIVEMATE_EXPERT'
          });

          this.loadBookings();

          this.bookingSubmitting = false;

        },


        error: () => {

          this.bookingError = 'Failed to book slot. Please try again later.';

          this.bookingSubmitting = false;

        }

      });

  }


  getConcernLabel(type: string): string {

    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  }


  getProviderTypeLabel(type: string): string {

    switch (type) {

      case 'AUTHORIZED_DEALER':
        return '🏢 Authorised Dealer';

      case 'LOCAL_SHOP':
        return '🔧 Local Shop';

      case 'MOBILE_MECHANIC':
        return '🚐 Mobile Mechanic';

      case 'DRIVEMATE_EXPERT':
        return '⭐ DriveMate Expert';

      default:
        return type;

    }

  }


  getProviderTypeClass(type: string): string {

    switch (type) {

      case 'AUTHORIZED_DEALER':
        return 'provider-authorized';

      case 'LOCAL_SHOP':
        return 'provider-local';

      case 'MOBILE_MECHANIC':
        return 'provider-mobile';

      case 'DRIVEMATE_EXPERT':
        return 'provider-drivemate';

      default:
        return '';

    }

  }

  getUrgencyClass(urgency: string): string {

    switch (urgency) {

      case 'LOW':
        return 'urgency-low';

      case 'NORMAL':
        return 'urgency-normal';

      case 'HIGH':
        return 'urgency-high';

      case 'CRITICAL':
        return 'urgency-critical';

      default:
        return 'urgency-normal';

    }

  }


  getStatusClass(status: string): string {

    switch (status) {

      case 'PENDING':
        return 'status-pending';

      case 'ACCEPTED':
        return 'status-accepted';

      case 'IN_PROGRESS':
        return 'status-inprogress';

      case 'COMPLETED':
        return 'status-completed';

      case 'CANCELLED':
        return 'status-cancelled';

      default:
        return 'status-pending';

    }

  }

}