const DOCUMENT_TYPES = [
  'REGISTRATION_CERTIFICATE',
  'INSURANCE',
  'POLLUTION_CERTIFICATE',
  'ROAD_TAX',
  'FITNESS_CERTIFICATE',
  'WARRANTY',
  'SERVICE_DOCUMENT',
  'PURCHASE_INVOICE',
  'OTHER'
] as const;


export interface DocumentValidationResult {

  valid: boolean;

  errors:
    Record<string, string>;

}


/* =========================================================
   DATE VALIDATION
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
   VALIDATE DOCUMENT
========================================================= */

export function validateVehicleDocument(
  input: Record<string, unknown>,
  hasFile: boolean
): DocumentValidationResult {

  const errors:
    Record<string, string> = {};


  const documentType =
    String(
      input.documentType ??
      ''
    ).trim();


  const title =
    String(
      input.title ??
      ''
    ).trim();


  const documentNumber =
    String(
      input.documentNumber ??
      ''
    ).trim();


  const provider =
    String(
      input.provider ??
      ''
    ).trim();


  const issueDate =
    String(
      input.issueDate ??
      ''
    ).trim();


  const expiryDate =
    String(
      input.expiryDate ??
      ''
    ).trim();


  const notes =
    String(
      input.notes ??
      ''
    ).trim();


  /* =======================================================
     DOCUMENT TYPE
  ======================================================= */

  if (
    !DOCUMENT_TYPES.includes(
      documentType as
        typeof DOCUMENT_TYPES[number]
    )
  ) {

    errors.documentType =
      'Please select a valid document type.';

  }


  /* =======================================================
     TITLE
  ======================================================= */

  if (!title) {

    errors.title =
      'Document title is required.';

  }

  else if (
    title.length > 150
  ) {

    errors.title =
      'Document title must not exceed 150 characters.';

  }


  /* =======================================================
     DOCUMENT NUMBER
  ======================================================= */

  if (
    documentNumber.length >
    120
  ) {

    errors.documentNumber =
      'Document number must not exceed 120 characters.';

  }


  /* =======================================================
     PROVIDER
  ======================================================= */

  if (
    provider.length >
    150
  ) {

    errors.provider =
      'Provider must not exceed 150 characters.';

  }


  /* =======================================================
     ISSUE DATE
  ======================================================= */

  if (
    issueDate &&
    !isValidDateString(
      issueDate
    )
  ) {

    errors.issueDate =
      'Please enter a valid issue date.';

  }


  /* =======================================================
     EXPIRY DATE
  ======================================================= */

  if (
    expiryDate &&
    !isValidDateString(
      expiryDate
    )
  ) {

    errors.expiryDate =
      'Please enter a valid expiry date.';

  }


  if (
    issueDate &&
    expiryDate &&
    isValidDateString(
      issueDate
    ) &&
    isValidDateString(
      expiryDate
    )
  ) {

    const issue =
      new Date(
        `${issueDate}T00:00:00.000Z`
      );


    const expiry =
      new Date(
        `${expiryDate}T00:00:00.000Z`
      );


    if (
      expiry <
      issue
    ) {

      errors.expiryDate =
        'Expiry date cannot be before the issue date.';

    }

  }


  /* =======================================================
     NOTES
  ======================================================= */

  if (
    notes.length >
    1000
  ) {

    errors.notes =
      'Notes must not exceed 1000 characters.';

  }


  /* =======================================================
     FILE

     DriveMate document records should
     contain an uploaded document.
  ======================================================= */

  if (!hasFile) {

    errors.documentFile =
      'Please upload a document file.';

  }


  return {

    valid:
      Object.keys(
        errors
      ).length === 0,

    errors

  };

}