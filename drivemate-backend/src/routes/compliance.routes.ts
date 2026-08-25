import { Router } from 'express';
import {
  getDocumentsByStatus,
  reviewDocument,
  getComplianceStats
} from '../controllers/compliance.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth middleware
router.use(requireAuth);

router.get('/documents', getDocumentsByStatus);
router.patch('/documents/:id/review', reviewDocument);
router.get('/stats', getComplianceStats);

export default router;
