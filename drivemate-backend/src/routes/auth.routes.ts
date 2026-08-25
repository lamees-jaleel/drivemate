import {
  Router
} from 'express';

import {
  login,
  register
} from '../controllers/auth.controller.js';

import {
  verificationUpload
} from '../middleware/upload.js';


const router =
  Router();


/* =========================================================
   REGISTER
========================================================= */

router.post(
  '/register',

  verificationUpload.single(
    'verificationDocument'
  ),

  register
);


/* =========================================================
   LOGIN
========================================================= */

router.post(
  '/login',
  login
);


export default router;