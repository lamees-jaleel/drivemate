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

  address?: string;

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

    return (
      localStorage.getItem(
        'drivemate_token'
      ) ??
      sessionStorage.getItem(
        'drivemate_token'
      )
    );

  }


  /* =======================================================
     GET USER
  ======================================================= */

  getUser():
    AuthenticatedUser | null {

    const storedUser =
      localStorage.getItem(
        'drivemate_user'
      ) ??
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

     We can also reuse this from login.ts later.
  ======================================================= */

  saveSession(
    token: string,
    user: AuthenticatedUser,
    rememberMe: boolean
  ): void {

    this.clearSession();


    const storage =
      rememberMe
        ? localStorage
        : sessionStorage;


    storage.setItem(
      'drivemate_token',
      token
    );


    storage.setItem(
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