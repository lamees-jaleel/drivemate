import type {
  Request,
  Response
} from 'express';

import {
  prisma
} from '../lib/prisma.js';


/* =========================================================
   TYPES
========================================================= */

interface AuthInfo {

  userId: number;

  role: string;

}


type VerificationStatusValue =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';


/* =========================================================
   HELPERS
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
   GET ALL PROFESSIONAL APPLICATIONS

   GET /api/admin/professionals

   Optional:
   ?status=PENDING
   ?status=APPROVED
   ?status=REJECTED
========================================================= */

export async function getProfessionals(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const statusQuery =
      String(
        req.query.status ??
        ''
      )
        .trim()
        .toUpperCase();


    const allowedStatuses:
      VerificationStatusValue[] = [

      'PENDING',
      'APPROVED',
      'REJECTED'

    ];


    let status:
      VerificationStatusValue |
      undefined;


    if (statusQuery) {

      if (
        !allowedStatuses.includes(
          statusQuery as
            VerificationStatusValue
        )
      ) {

        res.status(400).json({

          success: false,

          message:
            'Invalid verification status.'

        });

        return;

      }


      status =
        statusQuery as
          VerificationStatusValue;

    }


    const profiles =
      await prisma
        .professionalProfile
        .findMany({

          where:
            status
              ? {
                  verificationStatus:
                    status
                }
              : undefined,


          select: {

            id: true,

            qualification: true,

            specialization: true,

            yearsOfExperience: true,

            organizationName: true,

            certificateNumber: true,

            serviceLocation: true,

            verificationDocumentPath: true,

            verificationStatus: true,

            verificationNote: true,

            reviewedById: true,

            reviewedAt: true,

            createdAt: true,

            updatedAt: true,


            user: {

              select: {

                id: true,

                fullName: true,

                phone: true,

                email: true,

                address: true,

                role: true,

                accountStatus: true,

                createdAt: true

              }

            },


            reviewedBy: {

              select: {

                id: true,

                fullName: true,

                email: true

              }

            }

          },


          orderBy: {

            createdAt:
              'desc'

          }

        });


    const pendingCount =
      await prisma
        .professionalProfile
        .count({

          where: {

            verificationStatus:
              'PENDING'

          }

        });


    const approvedCount =
      await prisma
        .professionalProfile
        .count({

          where: {

            verificationStatus:
              'APPROVED'

          }

        });


    const rejectedCount =
      await prisma
        .professionalProfile
        .count({

          where: {

            verificationStatus:
              'REJECTED'

          }

        });


    res.status(200).json({

      success: true,

      count:
        profiles.length,

      summary: {

        pending:
          pendingCount,

        approved:
          approvedCount,

        rejected:
          rejectedCount

      },

      professionals:
        profiles

    });

  }

  catch (error) {

    console.error(
      'Get professional applications error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load professional applications.'

    });

  }

}


/* =========================================================
   GET ONE PROFESSIONAL

   GET /api/admin/professionals/:profileId
========================================================= */

export async function getProfessionalById(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const profileId =
      Number(
        req.params.profileId
      );


    if (
      !Number.isInteger(
        profileId
      ) ||
      profileId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid professional profile ID.'

      });

      return;

    }


    const profile =
      await prisma
        .professionalProfile
        .findUnique({

          where: {

            id:
              profileId

          },


          select: {

            id: true,

            qualification: true,

            specialization: true,

            yearsOfExperience: true,

            organizationName: true,

            certificateNumber: true,

            serviceLocation: true,

            verificationDocumentPath: true,

            verificationStatus: true,

            verificationNote: true,

            reviewedById: true,

            reviewedAt: true,

            createdAt: true,

            updatedAt: true,


            user: {

              select: {

                id: true,

                fullName: true,

                phone: true,

                email: true,

                address: true,

                role: true,

                accountStatus: true,

                createdAt: true

              }

            },


            reviewedBy: {

              select: {

                id: true,

                fullName: true,

                email: true

              }

            }

          }

        });


    if (!profile) {

      res.status(404).json({

        success: false,

        message:
          'Professional application not found.'

      });

      return;

    }


    res.status(200).json({

      success: true,

      professional:
        profile

    });

  }

  catch (error) {

    console.error(
      'Get professional application error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load professional application.'

    });

  }

}


/* =========================================================
   APPROVE PROFESSIONAL

   PATCH /api/admin/professionals/:profileId/approve
========================================================= */

export async function approveProfessional(
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


    const profileId =
      Number(
        req.params.profileId
      );


    if (
      !Number.isInteger(
        profileId
      ) ||
      profileId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid professional profile ID.'

      });

      return;

    }


    const note =
      String(
        req.body?.note ??
        ''
      ).trim();


    if (
      note.length >
      500
    ) {

      res.status(400).json({

        success: false,

        message:
          'Verification note must not exceed 500 characters.'

      });

      return;

    }


    /* =====================================================
       LOAD APPLICATION
    ===================================================== */

    const existingProfile =
      await prisma
        .professionalProfile
        .findUnique({

          where: {

            id:
              profileId

          },


          select: {

            id: true,

            userId: true,

            verificationStatus: true,

            user: {

              select: {

                role: true,

                accountStatus: true

              }

            }

          }

        });


    if (!existingProfile) {

      res.status(404).json({

        success: false,

        message:
          'Professional application not found.'

      });

      return;

    }


    if (
      existingProfile
        .verificationStatus !==
      'PENDING'
    ) {

      res.status(409).json({

        success: false,

        message:
          'This professional application has already been reviewed.'

      });

      return;

    }


    /* =====================================================
       APPROVE

       Professional profile:
       PENDING -> APPROVED

       User account:
       PENDING_VERIFICATION -> ACTIVE
    ===================================================== */

    await prisma
      .$transaction([

        prisma
          .professionalProfile
          .update({

            where: {

              id:
                profileId

            },


            data: {

              verificationStatus:
                'APPROVED',

              verificationNote:
                note ||
                null,

              reviewedById:
                auth.userId,

              reviewedAt:
                new Date()

            }

          }),


        prisma
          .user
          .update({

            where: {

              id:
                existingProfile.userId

            },


            data: {

              accountStatus:
                'ACTIVE'

            }

          })

      ]);


    const approvedProfile =
      await prisma
        .professionalProfile
        .findUnique({

          where: {

            id:
              profileId

          },


          select: {

            id: true,

            verificationStatus: true,

            verificationNote: true,

            reviewedAt: true,


            user: {

              select: {

                id: true,

                fullName: true,

                email: true,

                role: true,

                accountStatus: true

              }

            },


            reviewedBy: {

              select: {

                id: true,

                fullName: true,

                email: true

              }

            }

          }

        });


    res.status(200).json({

      success: true,

      message:
        'Professional account approved successfully.',

      professional:
        approvedProfile

    });

  }

  catch (error) {

    console.error(
      'Approve professional error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to approve professional account.'

    });

  }

}


/* =========================================================
   REJECT PROFESSIONAL

   PATCH /api/admin/professionals/:profileId/reject
========================================================= */

export async function rejectProfessional(
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


    const profileId =
      Number(
        req.params.profileId
      );


    if (
      !Number.isInteger(
        profileId
      ) ||
      profileId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid professional profile ID.'

      });

      return;

    }


    const note =
      String(
        req.body?.note ??
        ''
      ).trim();


    if (!note) {

      res.status(400).json({

        success: false,

        message:
          'Please provide a reason for rejection.'

      });

      return;

    }


    if (
      note.length >
      500
    ) {

      res.status(400).json({

        success: false,

        message:
          'Rejection note must not exceed 500 characters.'

      });

      return;

    }


    /* =====================================================
       LOAD APPLICATION
    ===================================================== */

    const existingProfile =
      await prisma
        .professionalProfile
        .findUnique({

          where: {

            id:
              profileId

          },


          select: {

            id: true,

            userId: true,

            verificationStatus: true

          }

        });


    if (!existingProfile) {

      res.status(404).json({

        success: false,

        message:
          'Professional application not found.'

      });

      return;

    }


    if (
      existingProfile
        .verificationStatus !==
      'PENDING'
    ) {

      res.status(409).json({

        success: false,

        message:
          'This professional application has already been reviewed.'

      });

      return;

    }


    /* =====================================================
       REJECT

       Professional:
       PENDING -> REJECTED

       User:
       PENDING_VERIFICATION -> REJECTED
    ===================================================== */

    await prisma
      .$transaction([

        prisma
          .professionalProfile
          .update({

            where: {

              id:
                profileId

            },


            data: {

              verificationStatus:
                'REJECTED',

              verificationNote:
                note,

              reviewedById:
                auth.userId,

              reviewedAt:
                new Date()

            }

          }),


        prisma
          .user
          .update({

            where: {

              id:
                existingProfile.userId

            },


            data: {

              accountStatus:
                'REJECTED'

            }

          })

      ]);


    const rejectedProfile =
      await prisma
        .professionalProfile
        .findUnique({

          where: {

            id:
              profileId

          },


          select: {

            id: true,

            verificationStatus: true,

            verificationNote: true,

            reviewedAt: true,


            user: {

              select: {

                id: true,

                fullName: true,

                email: true,

                role: true,

                accountStatus: true

              }

            },


            reviewedBy: {

              select: {

                id: true,

                fullName: true,

                email: true

              }

            }

          }

        });


    res.status(200).json({

      success: true,

      message:
        'Professional account rejected.',

      professional:
        rejectedProfile

    });

  }

  catch (error) {

    console.error(
      'Reject professional error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to reject professional account.'

    });

  }

}


/* =========================================================
   USER MANAGEMENT
   ========================================================= */

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const roleQuery = req.query.role ? String(req.query.role).toUpperCase() : undefined;

    const users = await prisma.user.findMany({
      where: roleQuery ? { role: roleQuery as any } : undefined,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        accountStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch users.' });
  }
}

export async function updateUserStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.params.userId);
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid account status.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status as any }
    });

    res.status(200).json({ success: true, message: `User account is now ${status.toLowerCase()}.`, user: updated });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Unable to update user status.' });
  }
}


/* =========================================================
   SYSTEM REPORTS
   ========================================================= */

export async function getSystemReports(req: Request, res: Response): Promise<void> {
  try {
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    const userStats = {
      VEHICLE_OWNER: 0,
      DIAGNOSTIC_EXPERT: 0,
      COMPLIANCE_ADVISOR: 0,
      ROADSIDE_RESPONDER: 0,
      ADMIN: 0
    };

    userRoles.forEach(r => {
      if (r.role in userStats) {
        userStats[r.role as keyof typeof userStats] = r._count;
      }
    });

    const totalVehicles = await prisma.vehicle.count();
    const totalMaintenance = await prisma.maintenanceRecord.count();
    const totalExpensesCount = await prisma.expense.count();
    
    const totalExpensesSumResult = await prisma.expense.aggregate({
      _sum: {
        amount: true
      }
    });
    const totalExpensesSum = Number(totalExpensesSumResult._sum.amount ?? 0);

    const documentsByStatus = await prisma.vehicleDocument.groupBy({
      by: ['verificationStatus'],
      _count: true
    });

    const docStats = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0
    };

    documentsByStatus.forEach(d => {
      if (d.verificationStatus in docStats) {
        docStats[d.verificationStatus as keyof typeof docStats] = d._count;
      }
    });

    const roadsideByStatus = await prisma.roadsideRequest.groupBy({
      by: ['status'],
      _count: true
    });

    const roadsideStats = {
      PENDING: 0,
      ACCEPTED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    roadsideByStatus.forEach(r => {
      if (r.status in roadsideStats) {
        roadsideStats[r.status as keyof typeof roadsideStats] = r._count;
      }
    });

    const systemSummary = {
      users: userStats,
      totalVehicles,
      totalMaintenance,
      expenses: {
        count: totalExpensesCount,
        sum: totalExpensesSum
      },
      documents: docStats,
      roadside: roadsideStats
    };

    res.status(200).json({ success: true, summary: systemSummary });
  } catch (error) {
    console.error('Get system reports error:', error);
    res.status(500).json({ success: false, message: 'Unable to compile system reports.' });
  }
}