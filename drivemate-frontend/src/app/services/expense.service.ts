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
   EXPENSE CATEGORY
========================================================= */

export type ExpenseCategory =
  | 'FUEL'
  | 'INSURANCE'
  | 'PARKING'
  | 'TOLL'
  | 'ROAD_TAX'
  | 'EMISSION_TEST'
  | 'ACCESSORIES'
  | 'WASH_CLEANING'
  | 'OTHER';


/* =========================================================
   ADD EXPENSE PAYLOAD
========================================================= */

export interface AddExpensePayload {

  category:
    ExpenseCategory;

  title:
    string;

  amount:
    number;

  expenseDate:
    string;

  odometerKm?:
    number |
    null;

  merchant?:
    string;

  notes?:
    string;

}


/* =========================================================
   EXPENSE
========================================================= */

export interface Expense {

  id:
    number;

  vehicleId:
    number;

  category:
    ExpenseCategory;

  title:
    string;

  amount:
    string |
    number;

  expenseDate:
    string;

  odometerKm:
    number |
    null;

  merchant:
    string |
    null;

  notes:
    string |
    null;

  createdAt:
    string;

  updatedAt:
    string;

}


/* =========================================================
   VEHICLE SUMMARY
========================================================= */

export interface ExpenseVehicleSummary {

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

export interface ExpenseListResponse {

  success:
    boolean;

  vehicle:
    ExpenseVehicleSummary;

  count:
    number;

  totalAmount:
    number;

  expenses:
    Expense[];

}


export interface AddExpenseResponse {

  success:
    boolean;

  message:
    string;

  expense:
    Expense;

}


/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly http =
    inject(HttpClient);


  private readonly authService =
    inject(AuthService);


  private readonly baseUrl =
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
     GET EXPENSES
  ======================================================= */

  getExpenses(
    vehicleId: number
  ): Observable<ExpenseListResponse> {

    return this.http
      .get<ExpenseListResponse>(

        `${this.baseUrl}/${vehicleId}/expenses`,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }


  /* =======================================================
     ADD EXPENSE
  ======================================================= */

  addExpense(
    vehicleId: number,
    payload: AddExpensePayload
  ): Observable<AddExpenseResponse> {

    return this.http
      .post<AddExpenseResponse>(

        `${this.baseUrl}/${vehicleId}/expenses`,

        payload,

        {
          headers:
            this.getAuthHeaders()
        }

      );

  }

}