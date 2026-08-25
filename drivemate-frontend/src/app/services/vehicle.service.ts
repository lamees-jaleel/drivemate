import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  AuthService
} from './auth.service';


/* =========================================================
   VEHICLE TYPES
========================================================= */

export type FuelType =
  | 'PETROL'
  | 'DIESEL'
  | 'CNG'
  | 'LPG'
  | 'ELECTRIC'
  | 'HYBRID'
  | 'OTHER';


export type TransmissionType =
  | 'MANUAL'
  | 'AUTOMATIC'
  | 'AMT'
  | 'CVT'
  | 'DCT'
  | 'OTHER';


export type OwnershipType =
  | 'OWNED'
  | 'FINANCED'
  | 'LEASED';


/* =========================================================
   ADD VEHICLE PAYLOAD
========================================================= */

export interface AddVehiclePayload {

  registrationNumber: string;

  make: string;

  model: string;

  variant?: string;

  manufacturingYear: number;

  fuelType: FuelType;

  transmission?:
    TransmissionType |
    '';

  color?: string;

  vehicleImagePath?: string;

  vin?: string;

  engineNumber?: string;

  odometerKm: number;

  purchaseDate?: string;

  ownershipType:
    OwnershipType;

}


/* =========================================================
   VEHICLE
========================================================= */

export interface Vehicle {

  id: number;

  registrationNumber: string;

  make: string;

  model: string;

  variant:
    string |
    null;

  manufacturingYear: number;

  fuelType:
    FuelType;

  transmission:
    TransmissionType |
    null;

  color:
    string |
    null;

  vehicleImagePath:
    string |
    null;

  vin:
    string |
    null;

  engineNumber:
    string |
    null;

  odometerKm: number;

  purchaseDate:
    string |
    null;

  ownershipType:
    OwnershipType;

  status: string;

  createdAt: string;

  updatedAt?:
    string;

}


/* =========================================================
   API RESPONSES
========================================================= */

export interface AddVehicleResponse {

  success: boolean;

  message: string;

  vehicle:
    Vehicle;

}


export interface VehicleListResponse {

  success: boolean;

  count: number;

  vehicles:
    Vehicle[];

}


export interface VehicleDetailsResponse {

  success: boolean;

  vehicle:
    Vehicle;

}


/* =========================================================
   VEHICLE SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private readonly http =
    inject(HttpClient);


  private readonly authService =
    inject(AuthService);


  private readonly apiUrl =
    'http://localhost:5000/api/vehicles';


  /* =======================================================
     AUTH HEADERS
  ======================================================= */

  private getAuthHeaders():
    HttpHeaders {

    const token =
      this.authService
        .getToken();


    return new HttpHeaders({

      Authorization:
        `Bearer ${token ?? ''}`

    });

  }


  /* =======================================================
     ADD VEHICLE
  ======================================================= */

  addVehicle(
    payload:
      AddVehiclePayload |
      FormData
  ): Observable<AddVehicleResponse> {

    return this.http
      .post<AddVehicleResponse>(

        this.apiUrl,

        payload,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     UPDATE VEHICLE
  ======================================================= */

  updateVehicle(
    id: number,
    payload: AddVehiclePayload | FormData
  ): Observable<AddVehicleResponse> {

    return this.http
      .put<AddVehicleResponse>(

        `${this.apiUrl}/${id}`,

        payload,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     DELETE VEHICLE
  ======================================================= */

  deleteVehicle(
    id: number
  ): Observable<{ success: boolean; message: string }> {

    return this.http
      .delete<{ success: boolean; message: string }>(

        `${this.apiUrl}/${id}`,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     GET ALL MY VEHICLES
  ======================================================= */

  getMyVehicles():
    Observable<VehicleListResponse> {

    return this.http
      .get<VehicleListResponse>(

        this.apiUrl,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     GET ONE VEHICLE
  ======================================================= */

  getVehicleById(
    vehicleId: number
  ): Observable<VehicleDetailsResponse> {

    return this.http
      .get<VehicleDetailsResponse>(

        `${this.apiUrl}/${vehicleId}`,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }

}