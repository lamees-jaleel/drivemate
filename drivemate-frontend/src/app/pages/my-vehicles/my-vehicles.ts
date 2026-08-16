import {
  Component,
  OnInit,
  inject
} from '@angular/core';

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
  Vehicle,
  VehicleService
} from '../../services/vehicle.service';


@Component({
  selector: 'app-my-vehicles',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl:
    './my-vehicles.html',

  styleUrl:
    './my-vehicles.css'
})
export class MyVehicles
  implements OnInit {

  private readonly vehicleService =
    inject(VehicleService);


  private readonly authService =
    inject(AuthService);


  private readonly router =
    inject(Router);


  vehicles:
    Vehicle[] = [];


  loading =
    true;


  errorMessage =
    '';


  /* =======================================================
     INITIALIZE
  ======================================================= */

  ngOnInit(): void {

    this.loadVehicles();

  }


  /* =======================================================
     LOAD VEHICLES
  ======================================================= */

  private loadVehicles():
    void {

    this.loading =
      true;


    this.errorMessage =
      '';


    this.vehicleService
      .getMyVehicles()
      .subscribe({

        next: response => {

          this.vehicles =
            response.vehicles;


          this.loading =
            false;

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.loading =
            false;


          console.error(
            'Unable to load vehicles:',
            error
          );


          if (
            error.status === 401
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


          this.errorMessage =
            error.error?.message ||
            'Unable to load your vehicles.';

        }

      });

  }


  /* =======================================================
     ADD VEHICLE
  ======================================================= */

  addVehicle(): void {

    this.router.navigate(
      [
        '/owner-dashboard/add-vehicle'
      ]
    );

  }


  /* =======================================================
     VEHICLE DETAILS

     The details page is our next step.
  ======================================================= */

  viewVehicle(
    vehicleId: number
  ): void {

    this.router.navigate(
      [
        '/owner-dashboard/vehicles',
        vehicleId
      ]
    );

  }

}