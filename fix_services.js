const fs = require('fs');

const docService = `import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type VehicleDocumentType = 'REGISTRATION_CERTIFICATE' | 'INSURANCE' | 'POLLUTION_CERTIFICATE' | 'ROAD_TAX' | 'FITNESS_CERTIFICATE' | 'WARRANTY' | 'SERVICE_DOCUMENT' | 'PURCHASE_INVOICE' | 'OTHER';
export type ComplianceStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_EXPIRY';

export interface VehicleDocument {
  id: number;
  vehicleId: number;
  documentType: VehicleDocumentType;
  title: string;
  documentNumber: string | null;
  provider: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  filePath: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  complianceStatus: ComplianceStatus;
  daysUntilExpiry: number | null;
  renewals?: any[];
}

export interface DocumentVehicleSummary {
  id: number;
  registrationNumber: string;
  make: string;
  model: string;
}

export interface DocumentListResponse {
  success: boolean;
  vehicle: DocumentVehicleSummary;
  count: number;
  complianceAlertCount: number;
  documents: VehicleDocument[];
}

export interface AddDocumentResponse {
  success: boolean;
  message: string;
  document: VehicleDocument;
}

export interface DocumentRenewalRequest {
  id: number;
  vehicleId: number;
  documentId: number;
  providerType: string;
  preferredDate: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export interface CreateRenewalResponse {
  success: boolean;
  message: string;
  renewal: DocumentRenewalRequest;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:5000/api/vehicles';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: \`Bearer \${token ?? ''}\` });
  }

  getDocuments(vehicleId: number): Observable<DocumentListResponse> {
    return this.http.get<DocumentListResponse>(\`\${this.baseUrl}/\${vehicleId}/documents\`, { headers: this.getAuthHeaders() });
  }

  addDocument(vehicleId: number, formData: FormData): Observable<AddDocumentResponse> {
    return this.http.post<AddDocumentResponse>(\`\${this.baseUrl}/\${vehicleId}/documents\`, formData, { headers: this.getAuthHeaders() });
  }

  requestRenewal(vehicleId: number, documentId: number, payload: any): Observable<CreateRenewalResponse> {
    return this.http.post<CreateRenewalResponse>(\`\${this.baseUrl}/\${vehicleId}/documents/\${documentId}/renewal\`, payload, { headers: this.getAuthHeaders() });
  }
}
`;

fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\services\\document.service.ts', docService, 'utf8');

const expertService = `import { inject, Injectable } from '@angular/core';
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
    return new HttpHeaders({ Authorization: \`Bearer \${token ?? ''}\` });
  }

  getRequests(status: string): Observable<any> {
    return this.http.get<any>(\`\${this.baseUrl}?status=\${status}\`, { headers: this.getAuthHeaders() });
  }

  acceptRequest(id: number): Observable<any> {
    return this.http.put<any>(\`\${this.baseUrl}/\${id}/accept\`, {}, { headers: this.getAuthHeaders() });
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(\`\${this.baseUrl}/\${id}/status\`, { status }, { headers: this.getAuthHeaders() });
  }

  completeRenewal(id: number, formData: FormData): Observable<any> {
    return this.http.post<any>(\`\${this.baseUrl}/\${id}/complete\`, formData, { headers: this.getAuthHeaders() });
  }
}
`;

fs.writeFileSync('c:\\Drivemate\\drivemate-frontend\\src\\app\\services\\expert-renewal.service.ts', expertService, 'utf8');
console.log("Fixed services");
