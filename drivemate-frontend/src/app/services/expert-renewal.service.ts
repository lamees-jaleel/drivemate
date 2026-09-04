import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpertRenewalService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:5000/api/expert/renewals';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  getRequests(status: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?status=${status}`, { headers: this.getAuthHeaders() });
  }

  acceptRequest(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/accept`, {}, { headers: this.getAuthHeaders() });
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  completeRenewal(id: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/complete`, formData, { headers: this.getAuthHeaders() });
  }
}
