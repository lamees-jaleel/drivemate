import type {
  NextFunction,
  Request,
  Response
} from 'express';

import {
  verifyAccessToken
} from '../lib/jwt.js';


/* =========================================================
   REQUIRE AUTHENTICATION
========================================================= */

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  const authorizationHeader =
    req.headers.authorization;


  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith(
      'Bearer '
    )
  ) {

    res.status(401).json({

      success: false,

      message:
        'Authentication required.'

    });

    return;
  }


  const token =
    authorizationHeader
      .substring(7)
      .trim();


  if (!token) {

    res.status(401).json({

      success: false,

      message:
        'Authentication required.'

    });

    return;
  }


  try {

    const auth =
      verifyAccessToken(
        token
      );


    /*
      res.locals is available to
      controllers that run after
      this middleware.
    */

    res.locals.auth =
      auth;


    next();

  }

  catch {

    res.status(401).json({

      success: false,

      message:
        'Your login session is invalid or has expired.'

    });

  }

}


/* =========================================================
   REQUIRE VEHICLE OWNER
========================================================= */

export function requireVehicleOwner(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  const auth =
    res.locals.auth;


  if (
    !auth ||
    auth.role !==
      'VEHICLE_OWNER'
  ) {

    res.status(403).json({

      success: false,

      message:
        'Vehicle Owner access is required.'

    });

    return;
  }


  next();

}