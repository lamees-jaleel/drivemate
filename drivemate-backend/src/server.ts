import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import {
  prisma
} from './lib/prisma.js';

import authRoutes from
  './routes/auth.routes.js';

import vehicleRoutes from
  './routes/vehicle.routes.js';

import maintenanceRoutes from
  './routes/maintenance.routes.js';

import expenseRoutes from
  './routes/expense.routes.js';

import documentRoutes from
  './routes/document.routes.js';

import adminRoutes from
  './routes/admin.routes.js';


dotenv.config();


const app =
  express();


const PORT =
  Number(
    process.env.PORT ??
    5000
  );


/* =========================================================
   CORS
========================================================= */

app.use(
  cors({

    origin:
      'http://localhost:4200',

    credentials:
      true

  })
);


/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended: true
  })
);


/* =========================================================
   HEALTH
========================================================= */

app.get(
  '/api/health',
  (
    req,
    res
  ) => {

    res.status(200).json({

      success: true,

      message:
        'DriveMate backend is running'

    });

  }
);


/* =========================================================
   DATABASE HEALTH
========================================================= */

app.get(
  '/api/health/db',
  async (
    req,
    res
  ) => {

    try {

      const userCount =
        await prisma.user.count();


      res.status(200).json({

        success: true,

        message:
          'DriveMate database connection is working',

        userCount

      });

    }

    catch (error) {

      console.error(
        'Database health error:',
        error
      );


      res.status(500).json({

        success: false,

        message:
          'Database connection failed'

      });

    }

  }
);


/* =========================================================
   AUTH
========================================================= */

app.use(
  '/api/auth',
  authRoutes
);


/* =========================================================
   ADMIN
========================================================= */

app.use(
  '/api/admin',
  adminRoutes
);


/* =========================================================
   VEHICLE NESTED MODULES
========================================================= */

app.use(
  '/api/vehicles/:vehicleId/maintenance',
  maintenanceRoutes
);


app.use(
  '/api/vehicles/:vehicleId/expenses',
  expenseRoutes
);


app.use(
  '/api/vehicles/:vehicleId/documents',
  documentRoutes
);


/* =========================================================
   VEHICLES
========================================================= */

app.use(
  '/api/vehicles',
  vehicleRoutes
);


/* =========================================================
   MULTER / UPLOAD ERRORS
========================================================= */

app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {

    if (
      error instanceof
        multer.MulterError
    ) {

      if (
        error.code ===
        'LIMIT_FILE_SIZE'
      ) {

        res.status(400).json({

          success: false,

          message:
            'Uploaded file must not exceed 5 MB.'

        });

        return;

      }


      res.status(400).json({

        success: false,

        message:
          error.message

      });

      return;

    }


    if (
      error instanceof Error
    ) {

      res.status(400).json({

        success: false,

        message:
          error.message

      });

      return;

    }


    next();

  }
);


/* =========================================================
   404
========================================================= */

app.use(
  (
    req,
    res
  ) => {

    res.status(404).json({

      success: false,

      message:
        'API endpoint not found.'

    });

  }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  () => {

    console.log('');
    console.log('======================================');
    console.log('          DriveMate Backend');
    console.log('======================================');

    console.log(
      `Server:      http://localhost:${PORT}`
    );

    console.log(
      `Health:      http://localhost:${PORT}/api/health`
    );

    console.log(
      `Database:    http://localhost:${PORT}/api/health/db`
    );

    console.log(
      `Register:    POST http://localhost:${PORT}/api/auth/register`
    );

    console.log(
      `Login:       POST http://localhost:${PORT}/api/auth/login`
    );

    console.log(
      `Admin Apps:  GET  http://localhost:${PORT}/api/admin/professionals`
    );

    console.log(
      `Approve:     PATCH http://localhost:${PORT}/api/admin/professionals/:profileId/approve`
    );

    console.log(
      `Reject:      PATCH http://localhost:${PORT}/api/admin/professionals/:profileId/reject`
    );

    console.log(
      `Vehicles:    GET  http://localhost:${PORT}/api/vehicles`
    );

    console.log(
      `Maintenance: GET  http://localhost:${PORT}/api/vehicles/:vehicleId/maintenance`
    );

    console.log(
      `Expenses:    GET  http://localhost:${PORT}/api/vehicles/:vehicleId/expenses`
    );

    console.log(
      `Documents:   GET  http://localhost:${PORT}/api/vehicles/:vehicleId/documents`
    );

    console.log('======================================');
    console.log('');

  }
);