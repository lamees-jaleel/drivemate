import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '../../generated/prisma/client.js';


/* =========================================================
   DATABASE URL
========================================================= */

const databaseUrlString =
  process.env.DATABASE_URL;


if (!databaseUrlString) {

  throw new Error(
    'DATABASE_URL is not defined in .env'
  );
}


/* =========================================================
   PARSE DATABASE URL

   Example:

   mysql://root:password@127.0.0.1:3306/drivemate_db
========================================================= */

const databaseUrl =
  new URL(databaseUrlString);


/*
  decodeURIComponent is important because your
  password contains URL-encoded characters such as:

  @ → %40
  # → %23
*/
const databaseUser =
  decodeURIComponent(
    databaseUrl.username
  );


const databasePassword =
  decodeURIComponent(
    databaseUrl.password
  );


const databaseName =
  decodeURIComponent(
    databaseUrl.pathname.substring(1)
  );


const databasePort =
  databaseUrl.port
    ? Number(databaseUrl.port)
    : 3306;


/* =========================================================
   PRISMA DRIVER ADAPTER
========================================================= */

const adapter =
  new PrismaMariaDb({

    host:
      databaseUrl.hostname,

    port:
      databasePort,

    user:
      databaseUser,

    password:
      databasePassword,

    database:
      databaseName

  });


/* =========================================================
   PRISMA CLIENT
========================================================= */

export const prisma =
  new PrismaClient({
    adapter
  });