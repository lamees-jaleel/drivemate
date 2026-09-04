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



  /* =======================================================
     UPDATE MAINTENANCE RECORD
  ======================================================= */
  updateMaintenanceRecord(
    vehicleId: number,
    recordId: number,
    payload: AddMaintenancePayload
  ): Observable<AddMaintenanceResponse> {
    return this.http.put<AddMaintenanceResponse>(
      `${this.baseUrl}/${vehicleId}/maintenance/${recordId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =======================================================
     DELETE MAINTENANCE RECORD
  ======================================================= */
  deleteMaintenanceRecord(
    vehicleId: number,
    recordId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${vehicleId}/maintenance/${recordId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =======================================================
     STATUS CALCULATION
  ======================================================= */
  
  computeMaintenanceStatus(
    record: MaintenanceRecord,
    latestOdometerKm: number,
    allRecords: MaintenanceRecord[]
  ): { status: 'UPCOMING' | 'DUE SOON' | 'DUE' | 'OVERDUE' | 'COMPLETED'; text: string; urgent: boolean } {
    
    // 1. Is there a newer completed record of the same type?
    const hasNewer = allRecords.some(r => 
      r.maintenanceType === record.maintenanceType && 
      new Date(r.serviceDate) > new Date(record.serviceDate)
    );
    if (hasNewer) {
      return { status: 'COMPLETED', text: 'Completed', urgent: false };
    }

    // 2. Is there even a next service reminder?
    if (!record.nextServiceDate && !record.nextServiceOdometerKm) {
      return { status: 'UPCOMING', text: 'No reminder set', urgent: false };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    
    let isDue = false;
    let isDueSoon = false;
    let isOverdue = false;
    
    let daysDiff = Infinity;
    if (record.nextServiceDate) {
      const nextDate = new Date(record.nextServiceDate);
      nextDate.setHours(0,0,0,0);
      const msDiff = nextDate.getTime() - today.getTime();
      daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) isOverdue = true;
      else if (daysDiff <= 0) isDue = true;
      else if (daysDiff <= 30) isDueSoon = true;
    }
    
    let kmDiff = Infinity;
    if (record.nextServiceOdometerKm) {
      kmDiff = record.nextServiceOdometerKm - latestOdometerKm;
      
      if (kmDiff < 0) isOverdue = true;
      else if (kmDiff <= 0) isDue = true;
      else if (kmDiff <= 1000) isDueSoon = true;
    }
    
    if (isOverdue) {
      return { status: 'OVERDUE', text: 'Service Overdue', urgent: true };
    }
    
    if (isDue) {
      return { status: 'DUE', text: 'Service Due', urgent: true };
    }
    
    if (isDueSoon) {
      const msg = kmDiff <= 1000 && kmDiff < (daysDiff * 33) // approx check to see which is closer
        ? `${kmDiff} km remaining`
        : `${daysDiff} days remaining`;
      return { status: 'DUE SOON', text: msg, urgent: true };
    }

    return { status: 'UPCOMING', text: 'Upcoming', urgent: false };
  }

}
