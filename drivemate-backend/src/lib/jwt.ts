import 'dotenv/config';

import jwt, {
  type SignOptions
} from 'jsonwebtoken';


/* =========================================================
   ACCESS TOKEN PAYLOAD
========================================================= */

export interface AccessTokenPayload {

  userId: number;

  role: string;

}


/* =========================================================
   GET JWT SECRET
========================================================= */

function getJwtSecret():
  string {

  const secret =
    process.env.JWT_SECRET;


  if (!secret) {

    throw new Error(
      'JWT_SECRET is not defined in .env'
    );

  }


  return secret;
}


/* =========================================================
   CREATE ACCESS TOKEN
========================================================= */

export function createAccessToken(
  payload: AccessTokenPayload
): string {

  const expiresIn =
    (
      process.env.JWT_EXPIRES_IN ??
      '1d'
    ) as SignOptions['expiresIn'];


  return jwt.sign(
    payload,
    getJwtSecret(),
    {
      expiresIn
    }
  );

}


/* =========================================================
   VERIFY ACCESS TOKEN
========================================================= */

export function verifyAccessToken(
  token: string
): AccessTokenPayload {

  const decoded =
    jwt.verify(
      token,
      getJwtSecret()
    );


  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'number' ||
    typeof decoded.role !== 'string'
  ) {

    throw new Error(
      'Invalid access token payload.'
    );

  }


  return {

    userId:
      decoded.userId,

    role:
      decoded.role

  };

}