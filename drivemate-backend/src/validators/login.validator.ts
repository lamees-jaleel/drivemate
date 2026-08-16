/* =========================================================
   LOGIN INPUT
========================================================= */

export interface LoginInput {
  email?: string;
  password?: string;
}


export interface LoginValidationResult {
  valid: boolean;

  errors: Record<string, string>;
}


/* =========================================================
   EMAIL
========================================================= */

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


/* =========================================================
   LOGIN VALIDATOR
========================================================= */

export function validateLogin(
  input: LoginInput
): LoginValidationResult {

  const errors:
    Record<string, string> = {};


  const email =
    input.email
      ?.trim()
      .toLowerCase() ?? '';


  const password =
    input.password ?? '';


  /* -------------------------------------------------------
     EMAIL
  ------------------------------------------------------- */

  if (!email) {

    errors.email =
      'Email address is required.';

  }

  else if (
    !EMAIL_REGEX.test(email)
  ) {

    errors.email =
      'Please enter a valid email address.';

  }


  /* -------------------------------------------------------
     PASSWORD
  ------------------------------------------------------- */

  if (!password) {

    errors.password =
      'Password is required.';

  }


  return {

    valid:
      Object.keys(errors).length === 0,

    errors

  };
}