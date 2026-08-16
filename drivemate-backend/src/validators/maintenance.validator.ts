/* =========================================================
   MAINTENANCE TYPES
========================================================= */

const MAINTENANCE_TYPES = [
  'ROUTINE_SERVICE',
  'OIL_CHANGE',
  'REPAIR',
  'TYRE_SERVICE',
  'BATTERY_SERVICE',
  'INSPECTION',
  'OTHER'
] as const;


/* =========================================================
   VALIDATION RESULT
========================================================= */

export interface MaintenanceValidationResult {

  valid: boolean;

  errors:
    Record<string, string>;

}


/* =========================================================
   DATE HELPER
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
   VALIDATE MAINTENANCE RECORD
========================================================= */

export function validateMaintenanceRecord(
  input: Record<string, unknown>
): MaintenanceValidationResult {

  const errors:
    Record<string, string> = {};


  const maintenanceType =
    String(
      input.maintenanceType ??
      ''
    ).trim();


  const title =
    String(
      input.title ??
      ''
    ).trim();


  const serviceDate =
    String(
      input.serviceDate ??
      ''
    ).trim();


  const odometerKm =
    Number(
      input.odometerKm
    );


  const serviceCenter =
    String(
      input.serviceCenter ??
      ''
    ).trim();


  const description =
    String(
      input.description ??
      ''
    ).trim();


  const cost =
    Number(
      input.cost ??
      0
    );


  const nextServiceDate =
    String(
      input.nextServiceDate ??
      ''
    ).trim();


  const nextServiceOdometerRaw =
    input.nextServiceOdometerKm;


  /* =======================================================
     MAINTENANCE TYPE
  ======================================================= */

  if (
    !MAINTENANCE_TYPES.includes(
      maintenanceType as
        typeof MAINTENANCE_TYPES[number]
    )
  ) {

    errors.maintenanceType =
      'Please select a valid maintenance type.';

  }


  /* =======================================================
     TITLE
  ======================================================= */

  if (!title) {

    errors.title =
      'Maintenance title is required.';

  }

  else if (
    title.length > 120
  ) {

    errors.title =
      'Maintenance title must not exceed 120 characters.';

  }


  /* =======================================================
     SERVICE DATE
  ======================================================= */

  if (!serviceDate) {

    errors.serviceDate =
      'Service date is required.';

  }

  else if (
    !isValidDateString(
      serviceDate
    )
  ) {

    errors.serviceDate =
      'Please enter a valid service date.';

  }


  /* =======================================================
     ODOMETER
  ======================================================= */

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


  /* =======================================================
     SERVICE CENTER
  ======================================================= */

  if (
    serviceCenter.length >
    150
  ) {

    errors.serviceCenter =
      'Service center must not exceed 150 characters.';

  }


  /* =======================================================
     DESCRIPTION
  ======================================================= */

  if (
    description.length >
    1000
  ) {

    errors.description =
      'Description must not exceed 1000 characters.';

  }


  /* =======================================================
     COST
  ======================================================= */

  if (
    !Number.isFinite(
      cost
    ) ||
    cost < 0 ||
    cost > 99999999.99
  ) {

    errors.cost =
      'Please enter a valid non-negative maintenance cost.';

  }


  /* =======================================================
     NEXT SERVICE DATE
  ======================================================= */

  if (nextServiceDate) {

    if (
      !isValidDateString(
        nextServiceDate
      )
    ) {

      errors.nextServiceDate =
        'Please enter a valid next service date.';

    }

    else if (
      isValidDateString(
        serviceDate
      )
    ) {

      const service =
        new Date(
          `${serviceDate}T00:00:00.000Z`
        );


      const nextService =
        new Date(
          `${nextServiceDate}T00:00:00.000Z`
        );


      if (
        nextService <
        service
      ) {

        errors.nextServiceDate =
          'Next service date cannot be before the service date.';

      }

    }

  }


  /* =======================================================
     NEXT SERVICE ODOMETER
  ======================================================= */

  if (
    nextServiceOdometerRaw !==
      undefined &&
    nextServiceOdometerRaw !==
      null &&
    String(
      nextServiceOdometerRaw
    ).trim() !== ''
  ) {

    const nextServiceOdometerKm =
      Number(
        nextServiceOdometerRaw
      );


    if (
      !Number.isInteger(
        nextServiceOdometerKm
      ) ||
      nextServiceOdometerKm < 0 ||
      nextServiceOdometerKm >
        5000000
    ) {

      errors.nextServiceOdometerKm =
        'Next service odometer must be between 0 and 5,000,000 km.';

    }

    else if (
      Number.isInteger(
        odometerKm
      ) &&
      nextServiceOdometerKm <
        odometerKm
    ) {

      errors.nextServiceOdometerKm =
        'Next service odometer cannot be below the current service odometer.';

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