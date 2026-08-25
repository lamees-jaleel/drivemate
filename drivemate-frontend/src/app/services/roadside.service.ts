import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoadsideService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:5000/api/roadside';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  /* =======================================================
     OWNER METHODS
     ======================================================= */
  createRequest(requestData: {
    vehicleId: number;
    issueType: string;
    description: string;
    location: string;
    contactPhone: string;
    urgency: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requests`, requestData, {
      headers: this.getAuthHeaders()
    });
  }

  getActiveRequest(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requests/active`, {
      headers: this.getAuthHeaders()
    });
  }

  getOwnerHistory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requests/history`, {
      headers: this.getAuthHeaders()
    });
  }

  cancelRequest(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/requests/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /* =======================================================
     RESPONDER METHODS
     ======================================================= */
  getAvailableRequests(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/responder/available`, {
      headers: this.getAuthHeaders()
    });
  }

  getActiveAssistance(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/responder/active`, {
      headers: this.getAuthHeaders()
    });
  }

  getCompletedRequests(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/responder/completed`, {
      headers: this.getAuthHeaders()
    });
  }

  acceptRequest(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/responder/requests/${id}/accept`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/responder/requests/${id}/status`, { status }, {
      headers: this.getAuthHeaders()
    });
  }
}
