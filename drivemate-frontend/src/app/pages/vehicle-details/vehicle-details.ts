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


  isDeleting =
    false;


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


  getVehiclePlaceholderType(
    imagePath: string | null | undefined
  ): string {

    if (
      !imagePath ||
      !imagePath.startsWith('placeholder:')
    ) {

      return 'CAR';

    }


    return imagePath.split(':')[1] || 'CAR';

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


  /* =======================================================
     EDIT / DELETE VEHICLE
  ======================================================= */

  editVehicle(): void {

    if (!this.vehicle) {

      return;

    }


    this.router.navigate(
      [
        `/owner-dashboard/vehicles/${this.vehicle.id}/edit`
      ]
    );

  }


  deleteVehicle(): void {

    if (!this.vehicle) {

      return;

    }


    if (
      !confirm(
        'Are you sure you want to delete this vehicle? This action cannot be undone.'
      )
    ) {

      return;

    }


    this.isDeleting =
      true;


    this.vehicleService
      .deleteVehicle(this.vehicle.id)
      .subscribe({

        next: response => {

          this.isDeleting =
            false;


          alert(
            response.message ||
            'Vehicle deleted successfully.'
          );


          this.router.navigate(
            [
              '/owner-dashboard/vehicles'
            ]
          );

        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.isDeleting =
            false;


          console.error(
            'Delete vehicle failed:',
            err
          );


          alert(
            err.error?.message ||
            'Unable to delete vehicle. Please try again.'
          );

        }

      });

  }

}