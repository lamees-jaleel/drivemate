import {
  Router
} from 'express';

import {
  approveProfessional,
  getProfessionalById,
  getProfessionals,
  rejectProfessional,
  getUsers,
  updateUserStatus,
  getSystemReports
} from '../controllers/admin.controller.js';

import {
  requireAuth
} from '../middleware/auth.middleware.js';

import {
  requireAdmin
} from '../middleware/admin.middleware.js';


const router =
  Router();


/* =========================================================
   ADMIN SECURITY

   User must:
   1. Be authenticated
   2. Have role ADMIN
========================================================= */

router.use(
  requireAuth
);


router.use(
  requireAdmin
);


/* =========================================================
   PROFESSIONAL APPLICATIONS
========================================================= */

router.get(
  '/professionals',
  getProfessionals
);


router.get(
  '/professionals/:profileId',
  getProfessionalById
);


router.patch(
  '/professionals/:profileId/approve',
  approveProfessional
);


router.patch(
  '/professionals/:profileId/reject',
  rejectProfessional
);


/* =========================================================
   USER MANAGEMENT
========================================================= */

router.get(
  '/users',
  getUsers
);


router.patch(
  '/users/:userId/status',
  updateUserStatus
);


/* =========================================================
   SYSTEM REPORTS
========================================================= */

router.get(
  '/reports',
  getSystemReports
);


export default router;