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

export type DiagnosticConcernType =
  | 'ENGINE'
  | 'TRANSMISSION'
  | 'BRAKES'
  | 'ELECTRICAL'
  | 'BATTERY'
  | 'TYRES_SUSPENSION'
  | 'OVERHEATING'
  | 'WARNING_LIGHT'
  | 'NOISE_VIBRATION'
  | 'FUEL_EFFICIENCY';

export type DiagnosticUrgency =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICAL';

export type DiagnosticRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ServiceProviderType =
  | 'AUTHORIZED_DEALER'
  | 'LOCAL_SHOP'
  | 'MOBILE_MECHANIC'
  | 'DRIVEMATE_EXPERT';

export interface BookSlotPayload {
  title: string;
  concernType: DiagnosticConcernType;
  symptoms: string;
  urgency: DiagnosticUrgency;
  providerType: ServiceProviderType;
  shopName?: string;
  odometerKm?: number;
}

export interface DiagnosticRequest {
  id: number;
  vehicleId: number;
  expertId: number | null;
  concernType: DiagnosticConcernType;
  urgency: DiagnosticUrgency;
  title: string;
  symptoms: string;
  providerType: ServiceProviderType;
  shopName: string | null;
  odometerKm: number | null;
  status: DiagnosticRequestStatus;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: number;
    make: string;
    model: string;
    registrationNumber: string;
    year: number;
  };
  expert?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface DiagnosticRequestsResponse {
  success: boolean;
  requests: DiagnosticRequest[];
}

export interface BookSlotResponse {
  success: boolean;
  message: string;
  request: DiagnosticRequest;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService {

  private readonly http =
    inject(HttpClient);


  private readonly authService =
    inject(AuthService);


  private readonly baseUrl =
    'http://localhost:5000/api';


  private getAuthHeaders(): HttpHeaders {

    const token =
      this.authService
        .getToken();


    return new HttpHeaders({

      Authorization:
        token ?
          `Bearer ${token}` :
          ''

    });

  }


  /* =======================================================
     OWNER BOOKING METHODS
  ======================================================= */

  bookSlot(
    vehicleId: number,
    payload: BookSlotPayload
  ): Observable<BookSlotResponse> {

    return this.http
      .post<BookSlotResponse>(
        `${this.baseUrl}/vehicles/${vehicleId}/diagnostics`,
        payload,
        {
          headers:
            this.getAuthHeaders()
        }
      );

  }


  getVehicleRequests(
    vehicleId: number
  ): Observable<DiagnosticRequestsResponse> {

    return this.http
      .get<DiagnosticRequestsResponse>(
        `${this.baseUrl}/vehicles/${vehicleId}/diagnostics`,
        {
          headers:
            this.getAuthHeaders()
        }
      );

  }


  /* =======================================================
     EXPERT / SERVICE PROVIDER METHODS
  ======================================================= */

  getExpertRequests(
    status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED'
  ): Observable<DiagnosticRequestsResponse> {

    return this.http
      .get<DiagnosticRequestsResponse>(
        `${this.baseUrl}/diagnostics/expert`,
        {
          params: { status },
          headers:
            this.getAuthHeaders()
        }
      );

  }


  acceptRequest(
    id: number
  ): Observable<any> {

    return this.http
      .put<any>(
        `${this.baseUrl}/diagnostics/expert/${id}/accept`,
        {},
        {
          headers:
            this.getAuthHeaders()
        }
      );

  }


  updateStatus(
    id: number,
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ): Observable<any> {

    return this.http
      .put<any>(
        `${this.baseUrl}/diagnostics/expert/${id}/status`,
        { status },
        {
          headers:
            this.getAuthHeaders()
        }
      );

  }

  submitReport(
    id: number,
    reportData: any
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/diagnostics/expert/${id}/report`,
      reportData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}
