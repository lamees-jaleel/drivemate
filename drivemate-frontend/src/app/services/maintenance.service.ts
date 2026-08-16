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
   MAINTENANCE TYPES
========================================================= */

export type MaintenanceType =
  | 'ROUTINE_SERVICE'
  | 'OIL_CHANGE'
  | 'REPAIR'
  | 'TYRE_SERVICE'
  | 'BATTERY_SERVICE'
  | 'INSPECTION'
  | 'OTHER';


/* =========================================================
   ADD MAINTENANCE PAYLOAD
========================================================= */

export interface AddMaintenancePayload {

  maintenanceType:
    MaintenanceType;

  title:
    string;

  serviceDate:
    string;

  odometerKm:
    number;

  serviceCenter?:
    string;

  description?:
    string;

  cost:
    number;

  nextServiceDate?:
    string;

  nextServiceOdometerKm?:
    number |
    null;

}


/* =========================================================
   MAINTENANCE RECORD
========================================================= */

export interface MaintenanceRecord {

  id:
    number;

  vehicleId:
    number;

  maintenanceType:
    MaintenanceType;

  title:
    string;

  serviceDate:
    string;

  odometerKm:
    number;

  serviceCenter:
    string |
    null;

  description:
    string |
    null;

  cost:
    string |
    number;

  nextServiceDate:
    string |
    null;

  nextServiceOdometerKm:
    number |
    null;

  createdAt:
    string;

  updatedAt:
    string;

}


/* =========================================================
   VEHICLE SUMMARY
========================================================= */

export interface MaintenanceVehicleSummary {

  id:
    number;

  registrationNumber:
    string;

  make:
    string;

  model:
    string;

}


/* =========================================================
   API RESPONSES
========================================================= */

export interface MaintenanceListResponse {

  success:
    boolean;

  vehicle:
    MaintenanceVehicleSummary;

  count:
    number;

  maintenanceRecords:
    MaintenanceRecord[];

}


export interface AddMaintenanceResponse {

  success:
    boolean;

  message:
    string;

  maintenanceRecord:
    MaintenanceRecord;

}


/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  private readonly http =
    inject(HttpClient);


  private readonly authService =
    inject(AuthService);


  private readonly baseUrl =
    'http://localhost:5000/api/vehicles';


  /* =======================================================
     AUTH HEADER
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
     GET MAINTENANCE HISTORY
  ======================================================= */

  getMaintenanceRecords(
    vehicleId: number
  ): Observable<MaintenanceListResponse> {

    return this.http
      .get<MaintenanceListResponse>(

        `${this.baseUrl}/${vehicleId}/maintenance`,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     ADD MAINTENANCE RECORD
  ======================================================= */

  addMaintenanceRecord(
    vehicleId: number,
    payload: AddMaintenancePayload
  ): Observable<AddMaintenanceResponse> {

    return this.http
      .post<AddMaintenanceResponse>(

        `${this.baseUrl}/${vehicleId}/maintenance`,

        payload,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }

}