import {
  Router
} from 'express';

import {
  createDocument,
  getDocumentById,
  getDocuments,
  createRenewalRequest
} from '../controllers/document.controller.js';

import {
  documentUpload
} from '../middleware/document-upload.js';

import {
  requireAuth,
  requireVehicleOwner
} from '../middleware/auth.middleware.js';


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
   GET DOCUMENTS

   GET /api/vehicles/:vehicleId/documents
========================================================= */

router.get(
  '/',
  getDocuments
);


/* =========================================================
   GET ONE DOCUMENT

   GET
   /api/vehicles/:vehicleId/documents/:documentId
========================================================= */

router.get(
  '/:documentId',
  getDocumentById
);


/* =========================================================
   ADD DOCUMENT

   Multipart form-data field:

   documentFile
========================================================= */

router.post(
  '/',

  documentUpload.single(
    'documentFile'
  ),

  createDocument
);


export default router;/* =========================================================
   CREATE RENEWAL REQUEST
========================================================= */

router.post(
  '/:documentId/renewal',
  createRenewalRequest
);
