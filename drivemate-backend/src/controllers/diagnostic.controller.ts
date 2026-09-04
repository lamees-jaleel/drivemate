import type {
  Request,
  Response
} from 'express';

import {
  prisma
} from '../lib/prisma.js';

interface AuthInfo {
  userId: number;
  role: string;
}

function getAuth(res: Response): AuthInfo | null {
  const auth = res.locals.auth as AuthInfo | undefined;
  return auth ?? null;
}

/* =========================================================
   CREATE DIAGNOSTIC REQUEST (BOOK SLOT)
========================================================= */
export async function createDiagnosticRequest(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized access.'
      });
      return;
    }

    const vehicleId = Number(req.params.vehicleId);
    const { title, concernType, symptoms, urgency, odometerKm, providerType, shopName } = req.body;

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        ownerId: auth.userId
      }
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Vehicle not found or access denied.'
      });
      return;
    }

    // Basic Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid title for the request.'
      });
      return;
    }

    if (!concernType || typeof concernType !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Please select a concern type.'
      });
      return;
    }

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide details about the vehicle symptoms.'
      });
      return;
    }

    const parsedOdometer = odometerKm ? Number(odometerKm) : vehicle.odometerKm;

    const request = await prisma.diagnosticRequest.create({
      data: {
        vehicleId,
        title,
        concernType: concernType as any,
        symptoms,
        urgency: (urgency || 'NORMAL') as any,
        providerType: (providerType || 'DRIVEMATE_EXPERT') as any,
        shopName: shopName || null,
        odometerKm: parsedOdometer,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance booking request submitted successfully.',
      request
    });
  } catch (error) {
    console.error('Error creating diagnostic request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit booking request.'
    });
  }
}

/* =========================================================
   GET VEHICLE DIAGNOSTIC REQUESTS (OWNER LIST)
========================================================= */
export async function getVehicleDiagnosticRequests(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized access.'
      });
      return;
    }

    const vehicleId = Number(req.params.vehicleId);

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        ownerId: auth.userId
      }
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Vehicle not found or access denied.'
      });
      return;
    }

    const requests = await prisma.diagnosticRequest.findMany({
      where: {
        vehicleId
      },
      include: {
        expert: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        report: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const mappedRequests = requests.map(req => ({
      ...req,
      expert: req.expert ? {
        id: req.expert.id,
        name: req.expert.fullName,
        email: req.expert.email
      } : null
    }));

    res.status(200).json({
      success: true,
      requests: mappedRequests
    });
  } catch (error) {
    console.error('Error fetching vehicle diagnostic requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load booking history.'
    });
  }
}

/* =========================================================
   GET EXPERT AVAILABLE REQUESTS (PENDING & ASSIGNED)
========================================================= */
export async function getExpertRequests(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'DIAGNOSTIC_EXPERT') {
      res.status(403).json({
        success: false,
        message: 'Access restricted to diagnostic experts.'
      });
      return;
    }

    const { status } = req.query;

    const whereClause: any = {};
    if (status === 'AVAILABLE') {
      whereClause.status = 'PENDING';
    } else if (status === 'ACTIVE') {
      whereClause.expertId = auth.userId;
      whereClause.status = {
        in: ['ACCEPTED', 'IN_PROGRESS']
      };
    } else if (status === 'COMPLETED') {
      whereClause.expertId = auth.userId;
      whereClause.status = 'COMPLETED';
    }

    const requests = await prisma.diagnosticRequest.findMany({
      where: whereClause,
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            registrationNumber: true,
            manufacturingYear: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching expert diagnostic requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load maintenance requests.'
    });
  }
}

/* =========================================================
   ACCEPT DIAGNOSTIC REQUEST (EXPERT ACCEPT)
========================================================= */
export async function acceptDiagnosticRequest(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'DIAGNOSTIC_EXPERT') {
      res.status(403).json({
        success: false,
        message: 'Access restricted to diagnostic experts.'
      });
      return;
    }

    const id = Number(req.params.id);

    const request = await prisma.diagnosticRequest.findUnique({
      where: { id }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: 'This slot request has already been handled.'
      });
      return;
    }

    const updatedRequest = await prisma.diagnosticRequest.update({
      where: { id },
      data: {
        expertId: auth.userId,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully. You are now the assigned provider.',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error accepting diagnostic request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept booking request.'
    });
  }
}

/* =========================================================
   UPDATE DIAGNOSTIC REQUEST STATUS
========================================================= */
export async function updateDiagnosticRequestStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'DIAGNOSTIC_EXPERT') {
      res.status(403).json({
        success: false,
        message: 'Access restricted to diagnostic experts.'
      });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    const request = await prisma.diagnosticRequest.findUnique({
      where: { id }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
      return;
    }

    if (request.expertId !== auth.userId) {
      res.status(403).json({
        success: false,
        message: 'You are not the assigned provider for this request.'
      });
      return;
    }

    const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status update option.'
      });
      return;
    }

    const updateData: any = {
      status: status as any
    };

    if (status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedRequest = await prisma.diagnosticRequest.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status} successfully.`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status.'
    });
  }
}

export async function submitDiagnosticReport(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'DIAGNOSTIC_EXPERT') {
      res.status(403).json({
        success: false,
        message: 'Access restricted to diagnostic experts.'
      });
      return;
    }

    const id = Number(req.params.id);
    const reportData = req.body;

    const request = await prisma.diagnosticRequest.findUnique({
      where: { id }
    });

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
      return;
    }

    if (request.expertId !== auth.userId) {
      res.status(403).json({
        success: false,
        message: 'You are not the assigned provider for this request.'
      });
      return;
    }

    if (request.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        message: 'Can only submit a report for a request that is IN_PROGRESS.'
      });
      return;
    }

    const createdReport = await prisma.diagnosticReport.create({
      data: {
        requestId: id,
        findings: reportData.findings,
        suspectedCause: reportData.suspectedCause,
        severity: reportData.severity,
        safeToDrive: reportData.safeToDrive,
        recommendedAction: reportData.recommendedAction,
        estimatedRepairCost: reportData.estimatedRepairCost,
        followUpRequired: reportData.followUpRequired,
        followUpNotes: reportData.followUpNotes
      }
    });

    // Also mark request as COMPLETED
    const updatedRequest = await prisma.diagnosticRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report submitted and request completed successfully.',
      report: createdReport,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit diagnostic report.'
    });
  }
}
