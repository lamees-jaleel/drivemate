import {
  Router
} from 'express';

import {
  createExpense,
  getExpenseById,
  getExpenses
} from '../controllers/expense.controller.js';

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
   GET ALL EXPENSES

   GET /api/vehicles/:vehicleId/expenses
========================================================= */

router.get(
  '/',
  getExpenses
);


/* =========================================================
   GET ONE EXPENSE

   GET
   /api/vehicles/:vehicleId/expenses/:expenseId
========================================================= */

router.get(
  '/:expenseId',
  getExpenseById
);


/* =========================================================
   CREATE EXPENSE

   POST /api/vehicles/:vehicleId/expenses
========================================================= */

router.post(
  '/',
  createExpense
);


export default router;