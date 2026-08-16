/* =========================================================
   REGISTRATION TYPES
========================================================= */

export type PublicRegistrationRole =
  | 'VEHICLE_OWNER'
  | 'DIAGNOSTIC_EXPERT'
  | 'COMPLIANCE_ADVISOR';


export interface RegistrationInput {
  role?: string;

  fullName?: string;

  phone?: string;

  email?: string;

  address?: string;

  password?: string;

  termsAccepted?: string | boolean;

  qualification?: string;

  specialization?: string;

  yearsOfExperience?: string;

  organizationName?: string;

  certificateNumber?: string;

  serviceLocation?: string;
}


export interface ValidationResult {
  valid: boolean;

  errors: Record<string, string>;
}


/* =========================================================
   REGEX RULES

   These intentionally mirror the frontend rules.
========================================================= */

const FULL_NAME_REGEX =
  /^[A-Za-z]+(?: [A-Za-z]+)*$/;


/*
  Backend receives full Indian number:

  +919876543210
*/
const PHONE_REGEX =
  /^\+91\d{10}$/;


const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


/*
  8+ characters
  uppercase
  lowercase
  number
  special character
  no spaces
*/
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;


/*
  Qualification:

  B.Tech
  M.Sc
  Ph.D/MD
*/
const QUALIFICATION_REGEX =
  /^(?=.*[A-Za-z])[A-Za-z./]+(?: [A-Za-z./]+)*$/;


/*
  Specialization:

  Engine Diagnostics
  EV Powertrain
  Engine-Tuning
*/
const SPECIALIZATION_REGEX =
  /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;


/*
  Certificate:

  ABC12345
  CERT-984210-AUTO
*/
const CERTIFICATE_REGEX =
  /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;


/*
  Location:

  Mumbai, Maharashtra
  New York, NY
*/
const SERVICE_LOCATION_REGEX =
  /^[A-Za-z]+(?:[ -][A-Za-z]+)*(?:,\s*[A-Za-z]+(?:[ -][A-Za-z]+)*)*$/;


/* =========================================================
   ALLOWED PUBLIC ROLES
========================================================= */

const PUBLIC_ROLES:
  PublicRegistrationRole[] = [

    'VEHICLE_OWNER',

    'DIAGNOSTIC_EXPERT',

    'COMPLIANCE_ADVISOR'

  ];


/* =========================================================
   VALIDATOR
========================================================= */

export function validateRegistration(
  input: RegistrationInput,
  hasVerificationDocument: boolean
): ValidationResult {

  const errors:
    Record<string, string> = {};


  const role =
    input.role?.trim() ?? '';


  const fullName =
    input.fullName?.trim() ?? '';


  const phone =
    input.phone?.trim() ?? '';


  const email =
    input.email
      ?.trim()
      .toLowerCase() ?? '';


  const address =
    input.address?.trim() ?? '';


  const password =
    input.password ?? '';


  const qualification =
    input.qualification?.trim() ?? '';


  const specialization =
    input.specialization?.trim() ?? '';


  const organizationName =
    input.organizationName?.trim() ?? '';


  const certificateNumber =
    input.certificateNumber?.trim() ?? '';


  const serviceLocation =
    input.serviceLocation?.trim() ?? '';


  /* =======================================================
     ROLE
  ======================================================= */

  if (
    !PUBLIC_ROLES.includes(
      role as PublicRegistrationRole
    )
  ) {

    errors.role =
      'Please select a valid registration role.';

  }


  /* =======================================================
     FULL NAME
  ======================================================= */

  if (!fullName) {

    errors.fullName =
      'Full name is required.';

  }

  else if (
    fullName.length < 2
  ) {

    errors.fullName =
      'Full name must contain at least 2 letters.';

  }

  else if (
    !FULL_NAME_REGEX.test(
      fullName
    )
  ) {

    errors.fullName =
      'Full name may contain letters and single spaces only.';

  }


  /* =======================================================
     PHONE
  ======================================================= */

  if (!phone) {

    errors.phone =
      'Phone number is required.';

  }

  else if (
    !PHONE_REGEX.test(
      phone
    )
  ) {

    errors.phone =
      'Phone number must be +91 followed by exactly 10 digits.';

  }


  /* =======================================================
     EMAIL
  ======================================================= */

  if (!email) {

    errors.email =
      'Email address is required.';

  }

  else if (
    !EMAIL_REGEX.test(
      email
    )
  ) {

    errors.email =
      'Please enter a valid email address.';

  }


  /* =======================================================
     ADDRESS
  ======================================================= */

  if (!address) {

    errors.address =
      'Address is required.';

  }

  else if (
    address.length < 10
  ) {

    errors.address =
      'Address must contain at least 10 characters.';

  }


  /* =======================================================
     PASSWORD
  ======================================================= */

  if (!password) {

    errors.password =
      'Password is required.';

  }

  else if (
    !PASSWORD_REGEX.test(
      password
    )
  ) {

    errors.password =
      'Password must contain at least 8 characters, including uppercase, lowercase, number and special character.';

  }

  /*
    bcrypt has a practical 72-byte input limit.
  */
  else if (
    Buffer.byteLength(
      password,
      'utf8'
    ) > 72
  ) {

    errors.password =
      'Password is too long.';

  }


  /* =======================================================
     TERMS
  ======================================================= */

  const termsAccepted =
    input.termsAccepted === true ||
    input.termsAccepted === 'true';


  if (!termsAccepted) {

    errors.termsAccepted =
      'Terms and Privacy Policy must be accepted.';

  }


  /* =======================================================
     PROFESSIONAL INFORMATION
  ======================================================= */

  const isProfessional =
    role === 'DIAGNOSTIC_EXPERT' ||
    role === 'COMPLIANCE_ADVISOR';


  if (isProfessional) {

    /* Qualification */

    if (!qualification) {

      errors.qualification =
        'Qualification is required.';

    }

    else if (
      !QUALIFICATION_REGEX.test(
        qualification
      )
    ) {

      errors.qualification =
        'Qualification may contain letters, spaces, dots and slashes only.';

    }


    /* Specialization */

    if (!specialization) {

      errors.specialization =
        'Specialization is required.';

    }

    else if (
      !SPECIALIZATION_REGEX.test(
        specialization
      )
    ) {

      errors.specialization =
        'Specialization may contain letters, spaces and hyphens only.';

    }


    /* Experience */

    const experienceText =
      input.yearsOfExperience
        ?.trim() ?? '';


    if (!experienceText) {

      errors.yearsOfExperience =
        'Years of experience is required.';

    }

    else if (
      !/^\d+$/.test(
        experienceText
      )
    ) {

      errors.yearsOfExperience =
        'Years of experience must be a whole number.';

    }

    else {

      const years =
        Number(
          experienceText
        );


      if (
        years < 0 ||
        years > 60
      ) {

        errors.yearsOfExperience =
          'Years of experience must be between 0 and 60.';

      }

    }


    /* Organization */

    if (!organizationName) {

      errors.organizationName =
        'Organization or workshop name is required.';

    }


    /* Certificate */

    if (!certificateNumber) {

      errors.certificateNumber =
        'Licence or certificate number is required.';

    }

    else if (
      !CERTIFICATE_REGEX.test(
        certificateNumber
      )
    ) {

      errors.certificateNumber =
        'Licence or certificate number may contain letters, numbers and hyphens only.';

    }


    /* Location */

    if (!serviceLocation) {

      errors.serviceLocation =
        'Service location is required.';

    }

    else if (
      !SERVICE_LOCATION_REGEX.test(
        serviceLocation
      )
    ) {

      errors.serviceLocation =
        'Service location must contain letters, spaces, commas and hyphens only.';

    }


    /* Verification document */

    if (
      !hasVerificationDocument
    ) {

      errors.verificationDocument =
        'Verification document is required.';

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