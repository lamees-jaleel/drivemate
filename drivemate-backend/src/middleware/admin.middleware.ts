import type {
  NextFunction,
  Request,
  Response
} from 'express';


interface AuthInfo {

  userId: number;

  role: string;

}


/* =========================================================
   REQUIRE ADMIN
========================================================= */

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  const auth =
    res.locals.auth as
      AuthInfo |
      undefined;


  if (!auth) {

    res.status(401).json({

      success: false,

      message:
        'Authentication required.'

    });

    return;

  }


  if (
    auth.role !==
    'ADMIN'
  ) {

    res.status(403).json({

      success: false,

      message:
        'Administrator access required.'

    });

    return;

  }


  next();

}