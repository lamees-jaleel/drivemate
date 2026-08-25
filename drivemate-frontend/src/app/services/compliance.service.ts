import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ComplianceService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:5000/api/compliance';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  getDocuments(status?: string): Observable<any> {
    const url = status ? `${this.baseUrl}/documents?status=${status}` : `${this.baseUrl}/documents`;
    return this.http.get<any>(url, {
      headers: this.getAuthHeaders()
    });
  }

  reviewDocument(id: number, status: string, note: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/documents/${id}/review`, { status, note }, {
      headers: this.getAuthHeaders()
    });
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`, {
      headers: this.getAuthHeaders()
    });
  }
}
