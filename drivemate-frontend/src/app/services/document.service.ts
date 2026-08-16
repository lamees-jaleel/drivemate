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
   DOCUMENT TYPES
========================================================= */

export type VehicleDocumentType =
  | 'REGISTRATION_CERTIFICATE'
  | 'INSURANCE'
  | 'POLLUTION_CERTIFICATE'
  | 'ROAD_TAX'
  | 'FITNESS_CERTIFICATE'
  | 'WARRANTY'
  | 'SERVICE_DOCUMENT'
  | 'PURCHASE_INVOICE'
  | 'OTHER';


export type ComplianceStatus =
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'NO_EXPIRY';


/* =========================================================
   VEHICLE DOCUMENT
========================================================= */

export interface VehicleDocument {

  id: number;

  vehicleId: number;

  documentType:
    VehicleDocumentType;

  title: string;

  documentNumber:
    string |
    null;

  provider:
    string |
    null;

  issueDate:
    string |
    null;

  expiryDate:
    string |
    null;

  filePath:
    string |
    null;

  originalFileName:
    string |
    null;

  mimeType:
    string |
    null;

  fileSize:
    number |
    null;

  notes:
    string |
    null;

  createdAt:
    string;

  updatedAt:
    string;

  complianceStatus:
    ComplianceStatus;

  daysUntilExpiry:
    number |
    null;

}


/* =========================================================
   VEHICLE SUMMARY
========================================================= */

export interface DocumentVehicleSummary {

  id: number;

  registrationNumber: string;

  make: string;

  model: string;

}


/* =========================================================
   API RESPONSES
========================================================= */

export interface DocumentListResponse {

  success: boolean;

  vehicle:
    DocumentVehicleSummary;

  count: number;

  complianceAlertCount: number;

  documents:
    VehicleDocument[];

}


export interface AddDocumentResponse {

  success: boolean;

  message: string;

  document:
    VehicleDocument;

}


/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly http =
    inject(HttpClient);


  private readonly authService =
    inject(AuthService);


  private readonly baseUrl =
    'http://localhost:5000/api/vehicles';


  /* =======================================================
     AUTH
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
     GET DOCUMENTS
  ======================================================= */

  getDocuments(
    vehicleId: number
  ): Observable<DocumentListResponse> {

    return this.http
      .get<DocumentListResponse>(

        `${this.baseUrl}/${vehicleId}/documents`,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     ADD DOCUMENT
  ======================================================= */

  addDocument(
    vehicleId: number,
    formData: FormData
  ): Observable<AddDocumentResponse> {

    /*
      Do NOT manually set Content-Type.

      The browser automatically creates
      the multipart/form-data boundary.
    */

    return this.http
      .post<AddDocumentResponse>(

        `${this.baseUrl}/${vehicleId}/documents`,

        formData,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }

}