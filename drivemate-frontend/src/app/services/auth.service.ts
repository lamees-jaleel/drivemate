import {
  Injectable
} from '@angular/core';


/* =========================================================
   AUTHENTICATED USER
========================================================= */

export interface AuthenticatedUser {

  id: number;

  fullName: string;

  email: string;

  phone: string;

  role: string;

  accountStatus: string;

  lastLoginAt?: string;

  professionalProfile?:
    {
      verificationStatus: string;
    } |
    null;

}


/* =========================================================
   AUTH SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  /* =======================================================
     GET TOKEN
  ======================================================= */

  getToken():
    string | null {

    return sessionStorage.getItem(
      'drivemate_token'
    );

  }


  /* =======================================================
     GET USER
  ======================================================= */

  getUser():
    AuthenticatedUser | null {

    const storedUser =
      sessionStorage.getItem(
        'drivemate_user'
      );


    if (!storedUser) {

      return null;

    }


    try {

      return JSON.parse(
        storedUser
      ) as AuthenticatedUser;

    }

    catch {

      this.clearSession();

      return null;

    }

  }


  /* =======================================================
     IS LOGGED IN
  ======================================================= */

  isLoggedIn():
    boolean {

    const token =
      this.getToken();


    const user =
      this.getUser();


    return Boolean(
      token &&
      user
    );

  }


  /* =======================================================
     CHECK ROLE
  ======================================================= */

  hasRole(
    requiredRole: string
  ): boolean {

    const user =
      this.getUser();


    return (
      user?.role ===
      requiredRole
    );

  }


  /* =======================================================
     SAVE SESSION

     Remember Me has been removed.
     Sessions now last for the current browser session only.
  ======================================================= */

  saveSession(
    token: string,
    user: AuthenticatedUser
  ): void {

    this.clearSession();


    sessionStorage.setItem(
      'drivemate_token',
      token
    );


    sessionStorage.setItem(
      'drivemate_user',
      JSON.stringify(
        user
      )
    );

  }


  /* =======================================================
     CLEAR SESSION
  ======================================================= */

  clearSession():
    void {

    /*
      Clear both storages once so old Remember Me sessions
      from the previous implementation cannot remain active.
    */

    localStorage.removeItem(
      'drivemate_token'
    );

    localStorage.removeItem(
      'drivemate_user'
    );


    sessionStorage.removeItem(
      'drivemate_token'
    );

    sessionStorage.removeItem(
      'drivemate_user'
    );

  }

}