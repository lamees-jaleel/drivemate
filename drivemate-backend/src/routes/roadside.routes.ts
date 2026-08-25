import { Router } from 'express';
import {
  createRequest,
  getActiveRequest,
  cancelRequest,
  getOwnerHistory,
  getAvailableRequests,
  getActiveAssistance,
  getCompletedRequests,
  acceptRequest,
  updateStatus
} from '../controllers/roadside.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth middleware to all roadside endpoints
router.use(requireAuth);

/* =========================================================
   OWNER ENDPOINTS
   ========================================================= */
router.post('/requests', createRequest);
router.get('/requests/active', getActiveRequest);
router.get('/requests/history', getOwnerHistory);
router.delete('/requests/:id', cancelRequest);

/* =========================================================
   RESPONDER ENDPOINTS
   ========================================================= */
router.get('/responder/available', getAvailableRequests);
router.get('/responder/active', getActiveAssistance);
router.get('/responder/completed', getCompletedRequests);
router.patch('/responder/requests/:id/accept', acceptRequest);
router.patch('/responder/requests/:id/status', updateStatus);

export default router;
