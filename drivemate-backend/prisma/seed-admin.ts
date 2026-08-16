import bcrypt from 'bcrypt';

import {
  stdin as input,
  stdout as output
} from 'node:process';

import * as readline from 'node:readline/promises';

import {
  prisma
} from '../src/lib/prisma.js';


/* =========================================================
   VALIDATION RULES
========================================================= */

const FULL_NAME_REGEX =
  /^[A-Za-z]+(?: [A-Za-z]+)*$/;


const PHONE_REGEX =
  /^\+91\d{10}$/;


const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;


/* =========================================================
   NORMAL TEXT INPUT
========================================================= */

async function ask(
  question: string
): Promise<string> {

  const rl =
    readline.createInterface({

      input,

      output

    });


  try {

    const answer =
      await rl.question(
        question
      );


    return answer.trim();

  }

  finally {

    rl.close();

  }

}


/* =========================================================
   HIDDEN PASSWORD INPUT

   Password characters are shown as *
   instead of displaying the real password.
========================================================= */

async function askPassword(
  question: string
): Promise<string> {

  if (
    !input.isTTY ||
    typeof input.setRawMode !==
      'function'
  ) {

    /*
      Fallback for terminals that do not
      support hidden/raw input.
    */

    const rl =
      readline.createInterface({

        input,

        output

      });


    try {

      return await rl.question(
        question
      );

    }

    finally {

      rl.close();

    }

  }


  return new Promise<string>(
    (
      resolve,
      reject
    ) => {

      let password =
        '';


      output.write(
        question
      );


      input.setRawMode(
        true
      );


      input.resume();


      input.setEncoding(
        'utf8'
      );


      function cleanup():
        void {

        input.off(
          'data',
          onData
        );


        input.setRawMode(
          false
        );


        input.pause();

      }


      function onData(
        chunk:
          string |
          Buffer
      ): void {

        const text =
          chunk.toString();


        for (
          const character
          of text
        ) {

          /*
            CTRL + C
          */

          if (
            character ===
            '\u0003'
          ) {

            cleanup();


            output.write(
              '\n'
            );


            reject(
              new Error(
                'Admin creation cancelled.'
              )
            );


            return;

          }


          /*
            ENTER
          */

          if (
            character ===
              '\r' ||
            character ===
              '\n'
          ) {

            cleanup();


            output.write(
              '\n'
            );


            resolve(
              password
            );


            return;

          }


          /*
            BACKSPACE
          */

          if (
            character ===
              '\u007F' ||
            character ===
              '\b'
          ) {

            if (
              password.length >
              0
            ) {

              password =
                password.slice(
                  0,
                  -1
                );


              output.write(
                '\b \b'
              );

            }


            continue;

          }


          /*
            Ignore ESC and other control keys.
          */

          if (
            character.charCodeAt(
              0
            ) < 32
          ) {

            continue;

          }


          password +=
            character;


          output.write(
            '*'
          );

        }

      }


      input.on(
        'data',
        onData
      );

    }
  );

}


/* =========================================================
   VALIDATE ADMIN DETAILS
========================================================= */

function validateAdminDetails(
  fullName: string,
  phone: string,
  email: string,
  address: string,
  password: string
): string[] {

  const errors:
    string[] = [];


  if (
    !FULL_NAME_REGEX.test(
      fullName
    )
  ) {

    errors.push(
      'Full name must contain letters and single spaces only.'
    );

  }


  if (
    !PHONE_REGEX.test(
      phone
    )
  ) {

    errors.push(
      'Phone number must be +91 followed by exactly 10 digits.'
    );

  }


  if (
    !EMAIL_REGEX.test(
      email
    )
  ) {

    errors.push(
      'Please enter a valid email address.'
    );

  }


  if (
    address.trim().length <
    10
  ) {

    errors.push(
      'Address must contain at least 10 characters.'
    );

  }


  if (
    !PASSWORD_REGEX.test(
      password
    )
  ) {

    errors.push(
      'Password must contain at least 8 characters with uppercase, lowercase, number and special character, with no spaces.'
    );

  }


  if (
    Buffer.byteLength(
      password,
      'utf8'
    ) > 72
  ) {

    errors.push(
      'Password is too long.'
    );

  }


  return errors;

}


/* =========================================================
   CREATE INITIAL ADMIN
========================================================= */

async function createInitialAdmin():
  Promise<void> {

  console.log('');
  console.log(
    '=========================================='
  );

  console.log(
    '       DriveMate Admin Bootstrap'
  );

  console.log(
    '=========================================='
  );

  console.log('');


  /* =======================================================
     CHECK WHETHER ADMIN ALREADY EXISTS
  ======================================================= */

  const existingAdmin =
    await prisma.user
      .findFirst({

        where: {

          role:
            'ADMIN'

        },

        select: {

          id: true,

          fullName: true,

          email: true,

          accountStatus: true

        }

      });


  if (existingAdmin) {

    console.log(
      'An administrator account already exists.'
    );


    console.log('');


    console.log(
      `ID:     ${existingAdmin.id}`
    );


    console.log(
      `Name:   ${existingAdmin.fullName}`
    );


    console.log(
      `Email:  ${existingAdmin.email}`
    );


    console.log(
      `Status: ${existingAdmin.accountStatus}`
    );


    console.log('');


    console.log(
      'No new administrator was created.'
    );


    return;

  }


  /* =======================================================
     READ ADMIN DETAILS
  ======================================================= */

  const fullNameInput =
    await ask(
      'Admin full name [DriveMate Admin]: '
    );


  const fullName =
    fullNameInput ||
    'DriveMate Admin';


  const phone =
    await ask(
      'Admin phone (+91 followed by 10 digits): '
    );


  const email =
    (
      await ask(
        'Admin email: '
      )
    )
      .toLowerCase();


  const addressInput =
    await ask(
      'Admin address [DriveMate Administration Office]: '
    );


  const address =
    addressInput ||
    'DriveMate Administration Office';


  console.log('');


  const password =
    await askPassword(
      'Admin password: '
    );


  const confirmPassword =
    await askPassword(
      'Confirm admin password: '
    );


  console.log('');


  /* =======================================================
     PASSWORD CONFIRMATION
  ======================================================= */

  if (
    password !==
    confirmPassword
  ) {

    throw new Error(
      'Passwords do not match. Administrator was not created.'
    );

  }


  /* =======================================================
     VALIDATE
  ======================================================= */

  const validationErrors =
    validateAdminDetails(

      fullName,

      phone,

      email,

      address,

      password

    );


  if (
    validationErrors.length >
    0
  ) {

    console.error(
      'Admin details are invalid:'
    );


    console.error('');


    for (
      const validationError
      of validationErrors
    ) {

      console.error(
        `- ${validationError}`
      );

    }


    throw new Error(
      'Administrator was not created because validation failed.'
    );

  }


  /* =======================================================
     CHECK EMAIL / PHONE UNIQUENESS
  ======================================================= */

  const existingUser =
    await prisma.user
      .findFirst({

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

          id: true,

          email: true,

          phone: true,

          role: true

        }

      });


  if (existingUser) {

    if (
      existingUser.email ===
      email
    ) {

      throw new Error(
        'That email address is already used by another DriveMate account.'
      );

    }


    if (
      existingUser.phone ===
      phone
    ) {

      throw new Error(
        'That phone number is already used by another DriveMate account.'
      );

    }

  }


  /* =======================================================
     HASH PASSWORD

     Cost factor 12.
     Plain password is never stored.
  ======================================================= */

  console.log(
    'Securing administrator password...'
  );


  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );


  /* =======================================================
     CREATE ADMIN
  ======================================================= */

  const admin =
    await prisma.user
      .create({

        data: {

          fullName,

          phone,

          email,

          address,

          passwordHash,

          role:
            'ADMIN',

          accountStatus:
            'ACTIVE',

          termsAccepted:
            true,

          termsAcceptedAt:
            new Date()

        },

        select: {

          id: true,

          fullName: true,

          email: true,

          phone: true,

          role: true,

          accountStatus: true,

          createdAt: true

        }

      });


  /* =======================================================
     SUCCESS
  ======================================================= */

  console.log('');
  console.log(
    '=========================================='
  );

  console.log(
    ' Administrator created successfully!'
  );

  console.log(
    '=========================================='
  );

  console.log('');


  console.log(
    `ID:      ${admin.id}`
  );


  console.log(
    `Name:    ${admin.fullName}`
  );


  console.log(
    `Email:   ${admin.email}`
  );


  console.log(
    `Phone:   ${admin.phone}`
  );


  console.log(
    `Role:    ${admin.role}`
  );


  console.log(
    `Status:  ${admin.accountStatus}`
  );


  console.log('');


  console.log(
    'You can now log in through the normal DriveMate login page.'
  );


  console.log(
    'Keep the administrator password private.'
  );

}


/* =========================================================
   RUN
========================================================= */

async function main():
  Promise<void> {

  try {

    await createInitialAdmin();

  }

  catch (error) {

    console.error('');


    if (
      error instanceof Error
    ) {

      console.error(
        `Admin bootstrap failed: ${error.message}`
      );

    }

    else {

      console.error(
        'Admin bootstrap failed.'
      );

    }


    process.exitCode =
      1;

  }

  finally {

    await prisma
      .$disconnect();

  }

}


await main();