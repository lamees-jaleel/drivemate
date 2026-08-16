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
   TYPES
========================================================= */

export type ProfessionalVerificationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';


export type ProfessionalAccountStatus =
  | 'ACTIVE'
  | 'PENDING_VERIFICATION'
  | 'SUSPENDED'
  | 'REJECTED';


export type ProfessionalRole =
  | 'DIAGNOSTIC_EXPERT'
  | 'COMPLIANCE_ADVISOR'
  | 'ROADSIDE_RESPONDER';


/* =========================================================
   PROFESSIONAL USER
========================================================= */

export interface ProfessionalUser {

  id: number;

  fullName: string;

  phone: string;

  email: string;

  address: string;

  role:
    ProfessionalRole;

  accountStatus:
    ProfessionalAccountStatus;

  createdAt:
    string;

}


/* =========================================================
   REVIEWER
========================================================= */

export interface ProfessionalReviewer {

  id: number;

  fullName: string;

  email: string;

}


/* =========================================================
   PROFESSIONAL PROFILE
========================================================= */

export interface ProfessionalProfile {

  id: number;

  qualification: string;

  specialization: string;

  yearsOfExperience: number;

  organizationName: string;

  certificateNumber: string;

  serviceLocation: string;

  verificationDocumentPath: string;

  verificationStatus:
    ProfessionalVerificationStatus;

  verificationNote:
    string |
    null;

  reviewedById:
    number |
    null;

  reviewedAt:
    string |
    null;

  createdAt:
    string;

  updatedAt:
    string;

  user:
    ProfessionalUser;

  reviewedBy:
    ProfessionalReviewer |
    null;

}


/* =========================================================
   SUMMARY
========================================================= */

export interface ProfessionalSummary {

  pending: number;

  approved: number;

  rejected: number;

}


/* =========================================================
   API RESPONSES
========================================================= */

export interface ProfessionalListResponse {

  success: boolean;

  count: number;

  summary:
    ProfessionalSummary;

  professionals:
    ProfessionalProfile[];

}


export interface ProfessionalDetailsResponse {

  success: boolean;

  professional:
    ProfessionalProfile;

}


export interface ProfessionalReviewResponse {

  success: boolean;

  message: string;

  professional:
    ProfessionalProfile;

}


/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly http =
    inject(HttpClient);


  private readonly authService =
    inject(AuthService);


  private readonly baseUrl =
    'http://localhost:5000/api/admin';


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
     GET PROFESSIONALS
  ======================================================= */

  getProfessionals(
    status?:
      ProfessionalVerificationStatus
  ): Observable<ProfessionalListResponse> {

    const url =
      status
        ? `${this.baseUrl}/professionals?status=${status}`
        : `${this.baseUrl}/professionals`;


    return this.http
      .get<ProfessionalListResponse>(

        url,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     GET ONE PROFESSIONAL
  ======================================================= */

  getProfessionalById(
    profileId: number
  ): Observable<ProfessionalDetailsResponse> {

    return this.http
      .get<ProfessionalDetailsResponse>(

        `${this.baseUrl}/professionals/${profileId}`,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     APPROVE
  ======================================================= */

  approveProfessional(
    profileId: number,
    note = ''
  ): Observable<ProfessionalReviewResponse> {

    return this.http
      .patch<ProfessionalReviewResponse>(

        `${this.baseUrl}/professionals/${profileId}/approve`,

        {
          note
        },

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     REJECT
  ======================================================= */

  rejectProfessional(
    profileId: number,
    note: string
  ): Observable<ProfessionalReviewResponse> {

    return this.http
      .patch<ProfessionalReviewResponse>(

        `${this.baseUrl}/professionals/${profileId}/reject`,

        {
          note
        },

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }

}