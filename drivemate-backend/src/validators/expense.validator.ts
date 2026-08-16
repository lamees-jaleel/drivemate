/* =========================================================
   EXPENSE CATEGORIES
========================================================= */

const EXPENSE_CATEGORIES = [
  'FUEL',
  'INSURANCE',
  'PARKING',
  'TOLL',
  'ROAD_TAX',
  'EMISSION_TEST',
  'ACCESSORIES',
  'WASH_CLEANING',
  'OTHER'
] as const;


/* =========================================================
   VALIDATION RESULT
========================================================= */

export interface ExpenseValidationResult {

  valid: boolean;

  errors:
    Record<string, string>;

}


/* =========================================================
   VALID DATE
========================================================= */

function isValidDateString(
  value: string
): boolean {

  if (
    !/^\d{4}-\d{2}-\d{2}$/
      .test(value)
  ) {

    return false;

  }


  const date =
    new Date(
      `${value}T00:00:00.000Z`
    );


  return !Number.isNaN(
    date.getTime()
  );

}


/* =========================================================
   VALIDATE EXPENSE
========================================================= */

export function validateExpense(
  input: Record<string, unknown>
): ExpenseValidationResult {

  const errors:
    Record<string, string> = {};


  const category =
    String(
      input.category ??
      ''
    ).trim();


  const title =
    String(
      input.title ??
      ''
    ).trim();


  const amount =
    Number(
      input.amount
    );


  const expenseDate =
    String(
      input.expenseDate ??
      ''
    ).trim();


  const merchant =
    String(
      input.merchant ??
      ''
    ).trim();


  const notes =
    String(
      input.notes ??
      ''
    ).trim();


  /* =======================================================
     CATEGORY
  ======================================================= */

  if (
    !EXPENSE_CATEGORIES.includes(
      category as
        typeof EXPENSE_CATEGORIES[number]
    )
  ) {

    errors.category =
      'Please select a valid expense category.';

  }


  /* =======================================================
     TITLE
  ======================================================= */

  if (!title) {

    errors.title =
      'Expense title is required.';

  }

  else if (
    title.length > 120
  ) {

    errors.title =
      'Expense title must not exceed 120 characters.';

  }


  /* =======================================================
     AMOUNT
  ======================================================= */

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0 ||
    amount > 99999999.99
  ) {

    errors.amount =
      'Expense amount must be greater than 0.';

  }


  /* =======================================================
     EXPENSE DATE
  ======================================================= */

  if (!expenseDate) {

    errors.expenseDate =
      'Expense date is required.';

  }

  else if (
    !isValidDateString(
      expenseDate
    )
  ) {

    errors.expenseDate =
      'Please enter a valid expense date.';

  }


  /* =======================================================
     ODOMETER
  ======================================================= */

  if (
    input.odometerKm !==
      undefined &&
    input.odometerKm !==
      null &&
    String(
      input.odometerKm
    ).trim() !== ''
  ) {

    const odometerKm =
      Number(
        input.odometerKm
      );


    if (
      !Number.isInteger(
        odometerKm
      ) ||
      odometerKm < 0 ||
      odometerKm > 5000000
    ) {

      errors.odometerKm =
        'Odometer reading must be between 0 and 5,000,000 km.';

    }

  }


  /* =======================================================
     MERCHANT
  ======================================================= */

  if (
    merchant.length > 150
  ) {

    errors.merchant =
      'Merchant name must not exceed 150 characters.';

  }


  /* =======================================================
     NOTES
  ======================================================= */

  if (
    notes.length > 1000
  ) {

    errors.notes =
      'Notes must not exceed 1000 characters.';

  }


  return {

    valid:
      Object.keys(
        errors
      ).length === 0,

    errors

  };

}