import {
  Router
} from 'express';

import {
  createDiagnosticRequest,
  getVehicleDiagnosticRequests,
  getExpertRequests,
  acceptDiagnosticRequest,
  updateDiagnosticRequestStatus,
  submitDiagnosticReport
} from '../controllers/diagnostic.controller.js';

import {
  requireAuth,
  requireVehicleOwner
} from '../middleware/auth.middleware.js';

// Router with mergeParams so we can handle /api/vehicles/:vehicleId/diagnostics
const router = Router({
  mergeParams: true
});

/* =========================================================
   DIAGNOSTIC EXPERT / PROVIDER ENDPOINTS
========================================================= */
// GET /api/diagnostics/expert (no vehicle context)
// PUT /api/diagnostics/expert/:id/accept
// PUT /api/diagnostics/expert/:id/status
export const expertDiagnosticRouter = Router();

expertDiagnosticRouter.use(requireAuth);
expertDiagnosticRouter.get('/expert', getExpertRequests);
expertDiagnosticRouter.put('/expert/:id/accept', acceptDiagnosticRequest);
expertDiagnosticRouter.put('/expert/:id/status', updateDiagnosticRequestStatus);
expertDiagnosticRouter.post('/expert/:id/report', submitDiagnosticReport);


/* =========================================================
   VEHICLE OWNER ENDPOINTS (with vehicleId context)
========================================================= */
router.use(requireAuth);
router.use(requireVehicleOwner);

// POST /api/vehicles/:vehicleId/diagnostics
router.post('/', createDiagnosticRequest);

// GET /api/vehicles/:vehicleId/diagnostics
router.get('/', getVehicleDiagnosticRequests);

export default router;
