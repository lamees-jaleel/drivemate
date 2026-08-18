import {
  Router
} from 'express';

import {
  googleLogin,
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
   EMAIL / PASSWORD LOGIN
========================================================= */

router.post(
  '/login',
  login
);


/* =========================================================
   GOOGLE LOGIN
========================================================= */

router.post(
  '/google',
  googleLogin
);


export default router;