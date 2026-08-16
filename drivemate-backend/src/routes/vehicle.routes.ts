import {
  Router
} from 'express';

import {
  createVehicle,
  getMyVehicles,
  getVehicleById
} from '../controllers/vehicle.controller.js';

import {
  requireAuth,
  requireVehicleOwner
} from '../middleware/auth.middleware.js';


const router =
  Router();


/* =========================================================
   VEHICLE SECURITY

   Every route below requires:

   1. Valid JWT
   2. VEHICLE_OWNER role
========================================================= */

router.use(
  requireAuth
);


router.use(
  requireVehicleOwner
);


/* =========================================================
   GET ALL VEHICLES FOR LOGGED-IN OWNER

   GET /api/vehicles
========================================================= */

router.get(
  '/',
  getMyVehicles
);


/* =========================================================
   GET ONE VEHICLE

   GET /api/vehicles/:id
========================================================= */

router.get(
  '/:id',
  getVehicleById
);


/* =========================================================
   CREATE VEHICLE

   POST /api/vehicles
========================================================= */

router.post(
  '/',
  createVehicle
);


export default router;