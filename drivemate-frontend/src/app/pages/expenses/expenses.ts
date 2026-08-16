import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  Vehicle,
  VehicleService
} from '../../services/vehicle.service';

import {
  AddExpensePayload,
  Expense,
  ExpenseCategory,
  ExpenseService
} from '../../services/expense.service';


@Component({
  selector: 'app-expenses',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './expenses.html',

  styleUrl:
    './expenses.css'
})
export class Expenses
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);


  private readonly router =
    inject(Router);


  private readonly formBuilder =
    inject(FormBuilder);


  private readonly vehicleService =
    inject(VehicleService);


  private readonly expenseService =
    inject(ExpenseService);


  private readonly authService =
    inject(AuthService);


  vehicle:
    Vehicle |
    null = null;


  expenses:
    Expense[] = [];


  vehicleId =
    0;


  loading =
    true;


  isSubmitting =
    false;


  submitted =
    false;


  pageErrorMessage =
    '';


  formErrorMessage =
    '';


  successMessage =
    '';


  /* =======================================================
     CATEGORY OPTIONS
  ======================================================= */

  categories: {
    value: ExpenseCategory;
    label: string;
  }[] = [

    {
      value: 'FUEL',
      label: 'Fuel'
    },

    {
      value: 'INSURANCE',
      label: 'Insurance'
    },

    {
      value: 'PARKING',
      label: 'Parking'
    },

    {
      value: 'TOLL',
      label: 'Toll'
    },

    {
      value: 'ROAD_TAX',
      label: 'Road Tax'
    },

    {
      value: 'EMISSION_TEST',
      label: 'Emission Test'
    },

    {
      value: 'ACCESSORIES',
      label: 'Accessories'
    },

    {
      value: 'WASH_CLEANING',
      label: 'Wash & Cleaning'
    },

    {
      value: 'OTHER',
      label: 'Other'
    }

  ];


  /* =======================================================
     FORM
  ======================================================= */

  expenseForm =
    this.formBuilder.group({

      category: [
        '' as
          ExpenseCategory |
          '',
        Validators.required
      ],


      title: [
        '',
        [
          Validators.required,

          Validators.maxLength(
            120
          )
        ]
      ],


      amount: [
        0,
        [
          Validators.required,

          Validators.min(
            0.01
          )
        ]
      ],


      expenseDate: [
        '',
        Validators.required
      ],


      odometerKm: [
        null as
          number |
          null,
        [
          Validators.min(
            0
          ),

          Validators.max(
            5000000
          )
        ]
      ],


      merchant: [
        '',
        [
          Validators.maxLength(
            150
          )
        ]
      ],


      notes: [
        '',
        [
          Validators.maxLength(
            1000
          )
        ]
      ]

    });


  get f() {

    return this.expenseForm
      .controls;

  }


  /* =======================================================
     SUMMARY
  ======================================================= */

  get expenseCount():
    number {

    return this.expenses
      .length;

  }


  get totalExpense():
    number {

    return this.expenses
      .reduce(
        (
          total,
          expense
        ) => {

          return (
            total +
            Number(
              expense.amount
            )
          );

        },
        0
      );

  }


  get currentMonthExpense():
    number {

    const now =
      new Date();


    const currentMonth =
      now.getMonth();


    const currentYear =
      now.getFullYear();


    return this.expenses
      .filter(
        expense => {

          const expenseDate =
            new Date(
              expense.expenseDate
            );


          return (
            expenseDate.getMonth() ===
              currentMonth &&

            expenseDate.getFullYear() ===
              currentYear
          );

        }
      )
      .reduce(
        (
          total,
          expense
        ) => {

          return (
            total +
            Number(
              expense.amount
            )
          );

        },
        0
      );

  }


  /* =======================================================
     INIT
  ======================================================= */

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      this.loading =
        false;


      this.pageErrorMessage =
        'Invalid vehicle ID.';


      return;

    }


    this.vehicleId =
      id;


    this.loadVehicle();

  }


  /* =======================================================
     LOAD VEHICLE
  ======================================================= */

  private loadVehicle():
    void {

    this.loading =
      true;


    this.vehicleService
      .getVehicleById(
        this.vehicleId
      )
      .subscribe({

        next: response => {

          this.vehicle =
            response.vehicle;


          this.f.odometerKm
            .setValue(
              response.vehicle
                .odometerKm
            );


          this.loadExpenses();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.handlePageError(
            error
          );

        }

      });

  }


  /* =======================================================
     LOAD EXPENSES
  ======================================================= */

  private loadExpenses():
    void {

    this.expenseService
      .getExpenses(
        this.vehicleId
      )
      .subscribe({

        next: response => {

          this.expenses =
            response.expenses;


          this.loading =
            false;

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.handlePageError(
            error
          );

        }

      });

  }


  /* =======================================================
     PAGE ERROR
  ======================================================= */

  private handlePageError(
    error:
      HttpErrorResponse
  ): void {

    this.loading =
      false;


    console.error(
      'Expense page error:',
      error
    );


    if (
      error.status ===
      401
    ) {

      this.authService
        .clearSession();


      this.router.navigate(
        [
          '/login'
        ]
      );


      return;

    }


    if (
      error.status ===
      404
    ) {

      this.pageErrorMessage =
        'Vehicle not found.';


      return;

    }


    this.pageErrorMessage =
      error.error?.message ||
      'Unable to load expense information.';

  }


  /* =======================================================
     FORM ERROR VISIBILITY
  ======================================================= */

  showError(
    control:
      AbstractControl
  ): boolean {

    return (
      control.invalid &&
      (
        control.touched ||
        this.submitted
      )
    );

  }


  /* =======================================================
     SUBMIT
  ======================================================= */

  submit(): void {

    if (
      this.isSubmitting
    ) {

      return;

    }


    this.submitted =
      true;


    this.formErrorMessage =
      '';


    this.successMessage =
      '';


    this.expenseForm
      .markAllAsTouched();


    if (
      this.expenseForm
        .invalid
    ) {

      return;

    }


    const values =
      this.expenseForm
        .getRawValue();


    const payload:
      AddExpensePayload = {

      category:
        values.category as
          ExpenseCategory,


      title:
        (
          values.title ??
          ''
        ).trim(),


      amount:
        Number(
          values.amount ??
          0
        ),


      expenseDate:
        values.expenseDate ??
        '',


      odometerKm:
        values.odometerKm,


      merchant:
        (
          values.merchant ??
          ''
        ).trim(),


      notes:
        (
          values.notes ??
          ''
        ).trim()

    };


    this.isSubmitting =
      true;


    this.expenseService
      .addExpense(
        this.vehicleId,
        payload
      )
      .subscribe({

        next: response => {

          this.isSubmitting =
            false;


          this.submitted =
            false;


          this.successMessage =
            response.message;


          this.expenseForm
            .reset({

              category:
                '',

              title:
                '',

              amount:
                0,

              expenseDate:
                '',

              odometerKm:
                this.vehicle
                  ?.odometerKm ??
                null,

              merchant:
                '',

              notes:
                ''

            });


          this.loadExpenses();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isSubmitting =
            false;


          console.error(
            'Add expense failed:',
            error
          );


          if (
            error.status ===
            401
          ) {

            this.authService
              .clearSession();


            this.router.navigate(
              [
                '/login'
              ]
            );


            return;

          }


          const errors =
            error.error?.errors as
              Record<string, string> |
              undefined;


          this.formErrorMessage =
            errors
              ? Object.values(
                  errors
                ).join(' ')
              : (
                  error.error?.message ||
                  'Unable to save expense.'
                );

        }

      });

  }


  /* =======================================================
     CATEGORY LABEL
  ======================================================= */

  getCategoryLabel(
    category:
      ExpenseCategory
  ): string {

    return (
      this.categories
        .find(
          item =>
            item.value ===
            category
        )
        ?.label ??
      category
    );

  }


  /* =======================================================
     DATE FORMAT
  ======================================================= */

  formatDate(
    value:
      string |
      null |
      undefined
  ): string {

    if (!value) {

      return 'Not specified';

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return 'Not specified';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      date
    );

  }


  /* =======================================================
     CURRENCY FORMAT
  ======================================================= */

  formatCurrency(
    value:
      string |
      number
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style:
          'currency',

        currency:
          'INR',

        maximumFractionDigits:
          2
      }
    ).format(
      Number(
        value
      )
    );

  }

}