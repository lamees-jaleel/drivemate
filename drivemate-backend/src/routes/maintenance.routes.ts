import {
  Router
} from 'express';

import {
  createMaintenanceRecord,
  getMaintenanceRecordById,
  getMaintenanceRecords
} from '../controllers/maintenance.controller.js';

import {
  requireAuth,
  requireVehicleOwner
} from '../middleware/auth.middleware.js';


/* =========================================================
   mergeParams: true

   Needed because vehicleId comes from
   the parent URL:

   /api/vehicles/:vehicleId/maintenance
========================================================= */

const router =
  Router({
    mergeParams: true
  });


/* =========================================================
   SECURITY
========================================================= */

router.use(
  requireAuth
);


router.use(
  requireVehicleOwner
);


/* =========================================================
   GET MAINTENANCE HISTORY

   GET /api/vehicles/:vehicleId/maintenance
========================================================= */

router.get(
  '/',
  getMaintenanceRecords
);


/* =========================================================
   GET ONE MAINTENANCE RECORD

   GET
   /api/vehicles/:vehicleId/maintenance/:recordId
========================================================= */

router.get(
  '/:recordId',
  getMaintenanceRecordById
);


/* =========================================================
   ADD MAINTENANCE RECORD

   POST /api/vehicles/:vehicleId/maintenance
========================================================= */

router.post(
  '/',
  createMaintenanceRecord
);


export default router;