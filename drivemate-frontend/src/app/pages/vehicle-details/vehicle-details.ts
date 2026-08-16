import {
  Component,
  OnInit,
  inject
} from '@angular/core';

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


@Component({
  selector: 'app-vehicle-details',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl:
    './vehicle-details.html',

  styleUrl:
    './vehicle-details.css'
})
export class VehicleDetails
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);


  private readonly router =
    inject(Router);


  private readonly vehicleService =
    inject(VehicleService);


  private readonly authService =
    inject(AuthService);


  vehicle:
    Vehicle |
    null = null;


  loading =
    true;


  errorMessage =
    '';


  /* =======================================================
     INITIALIZE
  ======================================================= */

  ngOnInit(): void {

    this.loadVehicle();

  }


  /* =======================================================
     LOAD VEHICLE
  ======================================================= */

  private loadVehicle():
    void {

    const vehicleId =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      this.loading =
        false;


      this.errorMessage =
        'Invalid vehicle ID.';


      return;

    }


    this.loading =
      true;


    this.errorMessage =
      '';


    this.vehicleService
      .getVehicleById(
        vehicleId
      )
      .subscribe({

        next: response => {

          this.vehicle =
            response.vehicle;


          this.loading =
            false;

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loading =
            false;


          console.error(
            'Unable to load vehicle:',
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

            this.errorMessage =
              'Vehicle not found.';


            return;

          }


          this.errorMessage =
            error.error?.message ||
            'Unable to load vehicle details.';

        }

      });

  }


  /* =======================================================
     OPEN MAINTENANCE
  ======================================================= */

  openMaintenance():
    void {

    if (!this.vehicle) {

      return;

    }


    this.router.navigate(
      [
        '/owner-dashboard/vehicles',
        this.vehicle.id,
        'maintenance'
      ]
    );

  }


  /* =======================================================
     OPEN EXPENSES
  ======================================================= */

  openExpenses():
    void {

    if (!this.vehicle) {

      return;

    }


    this.router.navigate(
      [
        '/owner-dashboard/vehicles',
        this.vehicle.id,
        'expenses'
      ]
    );

  }


  /* =======================================================
     OPEN DOCUMENTS
  ======================================================= */

  openDocuments():
    void {

    if (!this.vehicle) {

      return;

    }


    this.router.navigate(
      [
        '/owner-dashboard/vehicles',
        this.vehicle.id,
        'documents'
      ]
    );

  }


  /* =======================================================
     DATE FORMAT
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
     BACK
  ======================================================= */

  backToVehicles():
    void {

    this.router.navigate(
      [
        '/owner-dashboard/vehicles'
      ]
    );

  }

}