import type {
  Request,
  Response
} from 'express';

import {
  prisma
} from '../lib/prisma.js';

import {
  validateExpense
} from '../validators/expense.validator.js';


/* =========================================================
   TYPES
========================================================= */

interface AuthInfo {

  userId: number;

  role: string;

}


type ExpenseCategoryValue =
  | 'FUEL'
  | 'INSURANCE'
  | 'PARKING'
  | 'TOLL'
  | 'ROAD_TAX'
  | 'EMISSION_TEST'
  | 'ACCESSORIES'
  | 'WASH_CLEANING'
  | 'OTHER';


/* =========================================================
   AUTH HELPER
========================================================= */

function getAuth(
  res: Response
): AuthInfo | null {

  const auth =
    res.locals.auth as
      AuthInfo |
      undefined;


  return auth ?? null;

}


/* =========================================================
   VEHICLE ID
========================================================= */

function getVehicleId(
  req: Request
): number {

  return Number(
    req.params.vehicleId
  );

}


/* =========================================================
   VERIFY VEHICLE OWNERSHIP
========================================================= */

async function findOwnedVehicle(
  vehicleId: number,
  ownerId: number
) {

  return prisma.vehicle
    .findFirst({

      where: {

        id:
          vehicleId,

        ownerId

      },


      select: {

        id: true,

        registrationNumber: true,

        make: true,

        model: true

      }

    });

}


/* =========================================================
   CREATE EXPENSE
========================================================= */

export async function createExpense(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    /* =====================================================
       VEHICLE ID
    ===================================================== */

    const vehicleId =
      getVehicleId(
        req
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    /* =====================================================
       OWNERSHIP CHECK
    ===================================================== */

    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validation =
      validateExpense(
        req.body
      );


    if (!validation.valid) {

      res.status(400).json({

        success: false,

        message:
          'Expense validation failed.',

        errors:
          validation.errors

      });

      return;

    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    const category =
      String(
        req.body.category
      ).trim() as
        ExpenseCategoryValue;


    const title =
      String(
        req.body.title
      ).trim();


    const amount =
      Number(
        req.body.amount
      );


    const expenseDate =
      new Date(
        `${String(
          req.body.expenseDate
        ).trim()}T00:00:00.000Z`
      );


    const odometerRaw =
      req.body.odometerKm;


    const odometerKm =
      (
        odometerRaw ===
          undefined ||
        odometerRaw ===
          null ||
        String(
          odometerRaw
        ).trim() === ''
      )
        ? null
        : Number(
            odometerRaw
          );


    const merchantValue =
      String(
        req.body.merchant ??
        ''
      ).trim();


    const notesValue =
      String(
        req.body.notes ??
        ''
      ).trim();


    /* =====================================================
       CREATE
    ===================================================== */

    const expense =
      await prisma.expense
        .create({

          data: {

            vehicleId,

            category,

            title,

            amount,

            expenseDate,

            odometerKm,

            merchant:
              merchantValue ||
              null,

            notes:
              notesValue ||
              null

          },


          select: {

            id: true,

            vehicleId: true,

            category: true,

            title: true,

            amount: true,

            expenseDate: true,

            odometerKm: true,

            merchant: true,

            notes: true,

            createdAt: true,

            updatedAt: true

          }

        });


    res.status(201).json({

      success: true,

      message:
        'Expense added successfully.',

      expense

    });

  }

  catch (error) {

    console.error(
      'Create expense error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to add expense. Please try again.'

    });

  }

}


/* =========================================================
   GET VEHICLE EXPENSES
========================================================= */

export async function getExpenses(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       GET RECORDS
    ===================================================== */

    const expenses =
      await prisma.expense
        .findMany({

          where: {

            vehicleId

          },


          orderBy: [

            {
              expenseDate:
                'desc'
            },

            {
              createdAt:
                'desc'
            }

          ],


          select: {

            id: true,

            vehicleId: true,

            category: true,

            title: true,

            amount: true,

            expenseDate: true,

            odometerKm: true,

            merchant: true,

            notes: true,

            createdAt: true,

            updatedAt: true

          }

        });


    const totalAmount =
      expenses.reduce(
        (
          total,
          expense
        ) => {

          return (
            total +
            Number(
              expense.amount
            )
          );

        },
        0
      );


    res.status(200).json({

      success: true,

      vehicle: {

        id:
          vehicle.id,

        registrationNumber:
          vehicle.registrationNumber,

        make:
          vehicle.make,

        model:
          vehicle.model

      },

      count:
        expenses.length,

      totalAmount,

      expenses

    });

  }

  catch (error) {

    console.error(
      'Get expenses error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load expenses. Please try again.'

    });

  }

}


/* =========================================================
   GET ONE EXPENSE
========================================================= */

export async function getExpenseById(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    const expenseId =
      Number(
        req.params.expenseId
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    if (
      !Number.isInteger(
        expenseId
      ) ||
      expenseId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid expense ID.'

      });

      return;

    }


    /* =====================================================
       VEHICLE OWNERSHIP
    ===================================================== */

    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       EXPENSE
    ===================================================== */

    const expense =
      await prisma.expense
        .findFirst({

          where: {

            id:
              expenseId,

            vehicleId

          },


          select: {

            id: true,

            vehicleId: true,

            category: true,

            title: true,

            amount: true,

            expenseDate: true,

            odometerKm: true,

            merchant: true,

            notes: true,

            createdAt: true,

            updatedAt: true

          }

        });


    if (!expense) {

      res.status(404).json({

        success: false,

        message:
          'Expense not found.'

      });

      return;

    }


    res.status(200).json({

      success: true,

      expense

    });

  }

  catch (error) {

    console.error(
      'Get expense error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load expense details. Please try again.'

    });

  }

}