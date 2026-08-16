/* =========================================================
   ENUM VALUES
========================================================= */

const FUEL_TYPES = [
  'PETROL',
  'DIESEL',
  'CNG',
  'LPG',
  'ELECTRIC',
  'HYBRID',
  'OTHER'
];


const TRANSMISSION_TYPES = [
  'MANUAL',
  'AUTOMATIC',
  'AMT',
  'CVT',
  'DCT',
  'OTHER'
];


const OWNERSHIP_TYPES = [
  'OWNED',
  'FINANCED',
  'LEASED'
];


/* =========================================================
   VALIDATION RESULT
========================================================= */

export interface VehicleValidationResult {

  valid: boolean;

  errors:
    Record<string, string>;

}


/* =========================================================
   CREATE VEHICLE VALIDATION
========================================================= */

export function validateVehicle(
  input: Record<string, unknown>
): VehicleValidationResult {

  const errors:
    Record<string, string> = {};


  const registrationNumber =
    String(
      input.registrationNumber ??
      ''
    ).trim();


  const make =
    String(
      input.make ??
      ''
    ).trim();


  const model =
    String(
      input.model ??
      ''
    ).trim();


  const manufacturingYear =
    Number(
      input.manufacturingYear
    );


  const fuelType =
    String(
      input.fuelType ??
      ''
    ).trim();


  const transmission =
    String(
      input.transmission ??
      ''
    ).trim();


  const odometerKm =
    Number(
      input.odometerKm ??
      0
    );


  const ownershipType =
    String(
      input.ownershipType ??
      'OWNED'
    ).trim();


  /* =======================================================
     REGISTRATION NUMBER
  ======================================================= */

  if (!registrationNumber) {

    errors.registrationNumber =
      'Registration number is required.';

  }

  else if (
    registrationNumber.length >
    20
  ) {

    errors.registrationNumber =
      'Registration number is too long.';

  }


  /* =======================================================
     MAKE
  ======================================================= */

  if (!make) {

    errors.make =
      'Vehicle make is required.';

  }

  else if (
    make.length > 80
  ) {

    errors.make =
      'Vehicle make is too long.';

  }


  /* =======================================================
     MODEL
  ======================================================= */

  if (!model) {

    errors.model =
      'Vehicle model is required.';

  }

  else if (
    model.length > 80
  ) {

    errors.model =
      'Vehicle model is too long.';

  }


  /* =======================================================
     MANUFACTURING YEAR
  ======================================================= */

  const currentYear =
    new Date().getFullYear();


  if (
    !Number.isInteger(
      manufacturingYear
    ) ||
    manufacturingYear < 1900 ||
    manufacturingYear >
      currentYear + 1
  ) {

    errors.manufacturingYear =
      `Manufacturing year must be between 1900 and ${currentYear + 1}.`;

  }


  /* =======================================================
     FUEL TYPE
  ======================================================= */

  if (
    !FUEL_TYPES.includes(
      fuelType
    )
  ) {

    errors.fuelType =
      'Please select a valid fuel type.';

  }


  /* =======================================================
     TRANSMISSION
  ======================================================= */

  if (
    transmission &&
    !TRANSMISSION_TYPES.includes(
      transmission
    )
  ) {

    errors.transmission =
      'Please select a valid transmission type.';

  }


  /* =======================================================
     ODOMETER
  ======================================================= */

  if (
    !Number.isInteger(
      odometerKm
    ) ||
    odometerKm < 0 ||
    odometerKm >
      5000000
  ) {

    errors.odometerKm =
      'Odometer reading must be a valid non-negative number.';

  }


  /* =======================================================
     OWNERSHIP TYPE
  ======================================================= */

  if (
    !OWNERSHIP_TYPES.includes(
      ownershipType
    )
  ) {

    errors.ownershipType =
      'Please select a valid ownership type.';

  }


  /* =======================================================
     PURCHASE DATE
  ======================================================= */

  if (
    input.purchaseDate
  ) {

    const purchaseDate =
      new Date(
        String(
          input.purchaseDate
        )
      );


    if (
      Number.isNaN(
        purchaseDate.getTime()
      )
    ) {

      errors.purchaseDate =
        'Please enter a valid purchase date.';

    }

  }


  return {

    valid:
      Object.keys(
        errors
      ).length === 0,

    errors

  };

}