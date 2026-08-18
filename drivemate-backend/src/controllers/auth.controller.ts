import type {
  Request,
  Response
} from 'express';

import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import fs from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '../lib/prisma.js';
import { createAccessToken } from '../lib/jwt.js';

import {
  validateRegistration,
  type PublicRegistrationRole
} from '../validators/register.validator.js';

import {
  validateLogin
} from '../validators/login.validator.js';


/* =========================================================
   REMOVE UPLOADED FILE
========================================================= */

async function removeUploadedFile(
  filePath?: string
): Promise<void> {

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch {
    // File cleanup failure should not crash the API.
  }
}


/* =========================================================
   REGISTER
========================================================= */

export async function register(
  req: Request,
  res: Response
): Promise<void> {

  try {

    /* =====================================================
       1. VALIDATE REGISTRATION
    ===================================================== */

    const validation = validateRegistration(
      req.body,
      Boolean(req.file)
    );

    if (!validation.valid) {

      await removeUploadedFile(
        req.file?.path
      );

      res.status(400).json({
        success: false,
        message: 'Registration validation failed.',
        errors: validation.errors
      });

      return;
    }


    /* =====================================================
       2. NORMALIZE DATA
    ===================================================== */

    const role =
      req.body.role.trim() as PublicRegistrationRole;

    const fullName =
      req.body.fullName.trim();

    const phone =
      req.body.phone.trim();

    const email =
      req.body.email
        .trim()
        .toLowerCase();

    const address =
      req.body.address.trim();

    const password =
      req.body.password;

    const isProfessional =
      role === 'DIAGNOSTIC_EXPERT' ||
      role === 'COMPLIANCE_ADVISOR';


    /* =====================================================
       3. CHECK DUPLICATE EMAIL / PHONE
    ===================================================== */

    const existingUsers =
      await prisma.user.findMany({

        where: {

          OR: [
            {
              email
            },
            {
              phone
            }
          ]

        },

        select: {
          email: true,
          phone: true
        }

      });


    if (existingUsers.length > 0) {

      await removeUploadedFile(
        req.file?.path
      );

      const errors:
        Record<string, string> = {};


      const emailExists =
        existingUsers.some(
          user =>
            user.email === email
        );


      const phoneExists =
        existingUsers.some(
          user =>
            user.phone === phone
        );


      if (emailExists) {
        errors.email =
          'An account with this email already exists.';
      }


      if (phoneExists) {
        errors.phone =
          'An account with this phone number already exists.';
      }


      res.status(409).json({
        success: false,
        message: 'Account already exists.',
        errors
      });

      return;
    }


    /* =====================================================
       4. HASH PASSWORD
    ===================================================== */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    /* =====================================================
       5. VERIFICATION DOCUMENT PATH
    ===================================================== */

    const verificationDocumentPath =
      req.file
        ? path
            .relative(
              process.cwd(),
              req.file.path
            )
            .replace(
              /\\/g,
              '/'
            )
        : null;


    /* =====================================================
       6. CREATE USER
    ===================================================== */

    const user =
      await prisma.user.create({

        data: {

          fullName,

          phone,

          email,

          address,

          passwordHash,

          role,

          accountStatus:
            isProfessional
              ? 'PENDING_VERIFICATION'
              : 'ACTIVE',

          termsAccepted: true,

          termsAcceptedAt:
            new Date(),


          professionalProfile:
            isProfessional
              ? {

                  create: {

                    qualification:
                      req.body.qualification.trim(),

                    specialization:
                      req.body.specialization.trim(),

                    yearsOfExperience:
                      Number(
                        req.body.yearsOfExperience
                      ),

                    organizationName:
                      req.body.organizationName.trim(),

                    certificateNumber:
                      req.body.certificateNumber.trim(),

                    serviceLocation:
                      req.body.serviceLocation.trim(),

                    verificationDocumentPath:
                      verificationDocumentPath!,

                    verificationStatus:
                      'PENDING'

                  }

                }
              : undefined

        },


        select: {

          id: true,

          fullName: true,

          phone: true,

          email: true,

          role: true,

          accountStatus: true,

          createdAt: true,

          professionalProfile: {

            select: {
              verificationStatus: true
            }

          }

        }

      });


    /* =====================================================
       7. SUCCESS RESPONSE
    ===================================================== */

    res.status(201).json({

      success: true,

      message:
        isProfessional
          ? 'Registration successful. Your professional account is pending administrator verification.'
          : 'Registration successful.',

      user

    });

  }

  catch (error) {

    console.error(
      'Registration error:',
      error
    );


    await removeUploadedFile(
      req.file?.path
    );


    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {

      res.status(409).json({
        success: false,
        message:
          'An account with this email or phone number already exists.'
      });

      return;
    }


    res.status(500).json({
      success: false,
      message:
        'Unable to create account. Please try again.'
    });

  }
}


/* =========================================================
   LOGIN
========================================================= */

export async function login(
  req: Request,
  res: Response
): Promise<void> {

  try {

    /* =====================================================
       1. VALIDATE LOGIN
    ===================================================== */

    const validation =
      validateLogin(
        req.body
      );


    if (!validation.valid) {

      res.status(400).json({
        success: false,
        message:
          'Login validation failed.',
        errors:
          validation.errors
      });

      return;
    }


    /* =====================================================
       2. NORMALIZE LOGIN DATA
    ===================================================== */

    const email =
      req.body.email
        .trim()
        .toLowerCase();

    const password =
      req.body.password;


    /* =====================================================
       3. FIND USER
    ===================================================== */

    const user =
      await prisma.user.findUnique({

        where: {
          email
        },

        include: {

          professionalProfile: {

            select: {
              verificationStatus: true
            }

          }

        }

      });


    /* =====================================================
       4. INVALID EMAIL
    ===================================================== */

    if (!user) {

      res.status(401).json({
        success: false,
        message:
          'Invalid email or password.'
      });

      return;
    }


    /* =====================================================
       5. CHECK PASSWORD
    ===================================================== */

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );


    if (!passwordMatches) {

      res.status(401).json({
        success: false,
        message:
          'Invalid email or password.'
      });

      return;
    }


    /* =====================================================
       6. CHECK ACCOUNT STATUS
    ===================================================== */

    if (
      user.accountStatus ===
      'PENDING_VERIFICATION'
    ) {

      res.status(403).json({
        success: false,
        message:
          'Your professional account is still pending administrator verification.'
      });

      return;
    }


    if (
      user.accountStatus ===
      'SUSPENDED'
    ) {

      res.status(403).json({
        success: false,
        message:
          'Your account has been suspended.'
      });

      return;
    }


    if (
      user.accountStatus ===
      'REJECTED'
    ) {

      res.status(403).json({
        success: false,
        message:
          'Your professional account verification was rejected.'
      });

      return;
    }


    /* =====================================================
       7. CREATE JWT
    ===================================================== */

    const token =
      createAccessToken({

        userId:
          user.id,

        role:
          user.role

      });


    /* =====================================================
       8. UPDATE LAST LOGIN TIME
    ===================================================== */

    const loginTime =
      new Date();


    await prisma.user.update({

      where: {
        id: user.id
      },

      data: {
        lastLoginAt: loginTime
      }

    });


    /* =====================================================
       9. LOGIN SUCCESS
    ===================================================== */

    res.status(200).json({

      success: true,

      message:
        'Login successful.',

      token,

      user: {

        id:
          user.id,

        fullName:
          user.fullName,

        email:
          user.email,

        phone:
          user.phone,

        role:
          user.role,

        accountStatus:
          user.accountStatus,

        lastLoginAt:
          loginTime,

        professionalProfile:
          user.professionalProfile

      }

    });

  }

  catch (error) {

    console.error(
      'Login error:',
      error
    );


    res.status(500).json({
      success: false,
      message:
        'Unable to sign in. Please try again.'
    });

  }
}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

export async function googleLogin(
  req: Request,
  res: Response
): Promise<void> {

  try {

    /* =====================================================
       1. CHECK GOOGLE CREDENTIAL
    ===================================================== */

    const credential =
      String(
        req.body.credential ??
        ''
      ).trim();


    if (!credential) {

      res.status(400).json({
        success: false,
        message:
          'Google credential is required.'
      });

      return;
    }


    /* =====================================================
       2. CHECK GOOGLE CONFIGURATION
    ===================================================== */

    const googleClientId =
      process.env.GOOGLE_CLIENT_ID
        ?.trim() ??
      '';


    if (!googleClientId) {

      console.error(
        'GOOGLE_CLIENT_ID is not configured.'
      );


      res.status(500).json({
        success: false,
        message:
          'Google Sign-In is not configured on the server.'
      });

      return;
    }


    /* =====================================================
       3. VERIFY GOOGLE ID TOKEN
    ===================================================== */

    const googleClient =
      new OAuth2Client(
        googleClientId
      );


    const ticket =
      await googleClient.verifyIdToken({

        idToken:
          credential,

        audience:
          googleClientId

      });


    const payload =
      ticket.getPayload();


    const googleSub =
      payload?.sub?.trim() ??
      '';


    const email =
      payload?.email
        ?.trim()
        .toLowerCase() ??
      '';


    const emailVerified =
      payload?.email_verified ===
      true;


    if (
      !googleSub ||
      !email ||
      !emailVerified
    ) {

      res.status(401).json({
        success: false,
        message:
          'Google could not verify this account email.'
      });

      return;
    }


    /* =====================================================
       4. FIND ALREADY-LINKED GOOGLE ACCOUNT
    ===================================================== */

    let user =
      await prisma.user.findUnique({

        where: {
          googleSub
        },

        include: {

          professionalProfile: {

            select: {
              verificationStatus: true
            }

          }

        }

      });


    /* =====================================================
       5. FIRST GOOGLE LOGIN - MATCH EXISTING EMAIL

       Google login intentionally does not create a new
       DriveMate account. The user must register first.
    ===================================================== */

    if (!user) {

      user =
        await prisma.user.findUnique({

          where: {
            email
          },

          include: {

            professionalProfile: {

              select: {
                verificationStatus: true
              }

            }

          }

        });


      if (!user) {

        res.status(404).json({
          success: false,
          message:
            'No DriveMate account exists for this Google email. Please create an account first.'
        });

        return;
      }


      if (
        user.googleSub &&
        user.googleSub !==
          googleSub
      ) {

        res.status(409).json({
          success: false,
          message:
            'This DriveMate account is already linked to a different Google account.'
        });

        return;
      }


      /*
        For the first automatic email-to-Google link, only
        trust an address for which Google is authoritative:
        Gmail, or a verified Google Workspace account.
      */

      const googleIsAuthoritativeForEmail =
        email.endsWith(
          '@gmail.com'
        ) ||
        (
          emailVerified &&
          Boolean(
            payload?.hd
          )
        );


      if (
        !user.googleSub &&
        !googleIsAuthoritativeForEmail
      ) {

        res.status(403).json({
          success: false,
          message:
            'For this email address, please use your DriveMate email and password. Automatic Google account linking is available for Gmail and Google Workspace accounts.'
        });

        return;
      }

    }


    /* =====================================================
       6. CHECK ACCOUNT STATUS
    ===================================================== */

    if (
      user.accountStatus ===
      'PENDING_VERIFICATION'
    ) {

      res.status(403).json({
        success: false,
        message:
          'Your professional account is still pending administrator verification.'
      });

      return;
    }


    if (
      user.accountStatus ===
      'SUSPENDED'
    ) {

      res.status(403).json({
        success: false,
        message:
          'Your account has been suspended.'
      });

      return;
    }


    if (
      user.accountStatus ===
      'REJECTED'
    ) {

      res.status(403).json({
        success: false,
        message:
          'Your professional account verification was rejected.'
      });

      return;
    }


    /* =====================================================
       7. CREATE DRIVEMATE JWT
    ===================================================== */

    const token =
      createAccessToken({

        userId:
          user.id,

        role:
          user.role

      });


    /* =====================================================
       8. LINK GOOGLE ACCOUNT + UPDATE LAST LOGIN
    ===================================================== */

    const loginTime =
      new Date();


    await prisma.user.update({

      where: {
        id: user.id
      },

      data: {

        googleSub:
          user.googleSub ??
          googleSub,

        lastLoginAt:
          loginTime

      }

    });


    /* =====================================================
       9. GOOGLE LOGIN SUCCESS
    ===================================================== */

    res.status(200).json({

      success: true,

      message:
        'Google login successful.',

      token,

      user: {

        id:
          user.id,

        fullName:
          user.fullName,

        email:
          user.email,

        phone:
          user.phone,

        role:
          user.role,

        accountStatus:
          user.accountStatus,

        lastLoginAt:
          loginTime,

        professionalProfile:
          user.professionalProfile

      }

    });

  }

  catch (error) {

    console.error(
      'Google login error:',
      error
    );


    res.status(401).json({
      success: false,
      message:
        'Google Sign-In could not be verified. Please try again.'
    });

  }
}
