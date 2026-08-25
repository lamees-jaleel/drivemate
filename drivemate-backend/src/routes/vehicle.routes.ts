import {
  Router
} from 'express';

import {
  createVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicle.controller.js';

import {
  requireAuth,
  requireVehicleOwner
} from '../middleware/auth.middleware.js';

import {
  vehicleImageUpload
} from '../middleware/vehicle-image-upload.js';


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
  vehicleImageUpload.single('vehicleImage'),
  createVehicle
);


/* =========================================================
   UPDATE VEHICLE

   PUT /api/vehicles/:id
========================================================= */

router.put(
  '/:id',
  vehicleImageUpload.single('vehicleImage'),
  updateVehicle
);


/* =========================================================
   DELETE VEHICLE

   DELETE /api/vehicles/:id
========================================================= */

router.delete(
  '/:id',
  deleteVehicle
);


export default router;