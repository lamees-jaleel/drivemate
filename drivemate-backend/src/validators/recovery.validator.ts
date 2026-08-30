const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function validateIdentify(body: any) {
  const errors: Record<string, string> = {};
  if (!body.email || typeof body.email !== 'string') {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(body.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateVerify(body: any) {
  const errors: Record<string, string> = {};
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.sessionId = 'Session ID is required.';
  }
  if (!body.otp || typeof body.otp !== 'string' || body.otp.length !== 6) {
    errors.otp = 'A valid 6-digit OTP is required.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateReset(body: any) {
  const errors: Record<string, string> = {};
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.sessionId = 'Session ID is required.';
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateResend(body: any) {
  const errors: Record<string, string> = {};
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.sessionId = 'Session ID is required.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
