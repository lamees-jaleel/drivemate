import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { documentUpload } from '../middleware/document-upload.js';
import {
  getExpertRenewalRequests,
  acceptRenewalRequest,
  updateRenewalStatus,
  completeRenewalRequest
} from '../controllers/expert-renewal.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', getExpertRenewalRequests);
router.put('/:id/accept', acceptRenewalRequest);
router.put('/:id/status', updateRenewalStatus);
router.post('/:id/complete', documentUpload.single('documentFile'), completeRenewalRequest);

export default router;
