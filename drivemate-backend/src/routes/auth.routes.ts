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

import {
  identifyAccount,
  verifyOTP,
  resendOTP,
  resetPassword
} from '../controllers/recovery.controller.js';


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

/* =========================================================
   RECOVERY
========================================================= */

router.post('/recovery/identify', identifyAccount);
router.post('/recovery/verify', verifyOTP);
router.post('/recovery/resend', resendOTP);
router.post('/recovery/reset', resetPassword);

export default router;