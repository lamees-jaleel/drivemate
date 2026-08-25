import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

interface AuthInfo {
  userId: number;
  role: string;
}

function getAuth(res: Response): AuthInfo | null {
  const auth = res.locals.auth as AuthInfo | undefined;
  return auth ?? null;
}

/* =========================================================
   OWNER ENDPOINTS
   ========================================================= */

export async function createRequest(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'VEHICLE_OWNER') {
      res.status(403).json({ success: false, message: 'Only vehicle owners can request roadside assistance.' });
      return;
    }

    const { vehicleId, issueType, description, location, contactPhone, urgency } = req.body;

    if (!vehicleId || !issueType || !description || !location || !contactPhone) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: Number(vehicleId), ownerId: auth.userId }
    });

    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }

    // Check if there is already an active request
    const existingActive = await prisma.roadsideRequest.findFirst({
      where: {
        ownerId: auth.userId,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
      }
    });

    if (existingActive) {
      res.status(400).json({ success: false, message: 'You already have an active roadside assistance request.' });
      return;
    }

    const request = await prisma.roadsideRequest.create({
      data: {
        vehicleId: Number(vehicleId),
        ownerId: auth.userId,
        issueType,
        description,
        location,
        contactPhone,
        urgency: urgency || 'NORMAL',
        status: 'PENDING'
      },
      include: {
        vehicle: true
      }
    });

    res.status(201).json({ success: true, message: 'Roadside assistance requested successfully.', request });
  } catch (error) {
    console.error('Create roadside request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function getActiveRequest(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const request = await prisma.roadsideRequest.findFirst({
      where: {
        ownerId: auth.userId,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
      },
      include: {
        vehicle: true,
        responder: {
          select: {
            fullName: true,
            phone: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error('Get active request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function cancelRequest(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const requestId = Number(req.params.id);
    const request = await prisma.roadsideRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.ownerId !== auth.userId) {
      res.status(404).json({ success: false, message: 'Request not found.' });
      return;
    }

    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Request is already finalized.' });
      return;
    }

    const updated = await prisma.roadsideRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' }
    });

    res.status(200).json({ success: true, message: 'Request cancelled successfully.', request: updated });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function getOwnerHistory(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const history = await prisma.roadsideRequest.findMany({
      where: {
        ownerId: auth.userId,
        status: { in: ['COMPLETED', 'CANCELLED'] }
      },
      include: {
        vehicle: true,
        responder: {
          select: {
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/* =========================================================
   RESPONDER ENDPOINTS
   ========================================================= */

export async function getAvailableRequests(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'ROADSIDE_RESPONDER') {
      res.status(403).json({ success: false, message: 'Responder access required.' });
      return;
    }

    const requests = await prisma.roadsideRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function getActiveAssistance(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'ROADSIDE_RESPONDER') {
      res.status(403).json({ success: false, message: 'Responder access required.' });
      return;
    }

    const requests = await prisma.roadsideRequest.findMany({
      where: {
        responderId: auth.userId,
        status: { in: ['ACCEPTED', 'IN_PROGRESS'] }
      },
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Get active assistance error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function getCompletedRequests(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'ROADSIDE_RESPONDER') {
      res.status(403).json({ success: false, message: 'Responder access required.' });
      return;
    }

    const requests = await prisma.roadsideRequest.findMany({
      where: {
        responderId: auth.userId,
        status: 'COMPLETED'
      },
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Get completed requests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function acceptRequest(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'ROADSIDE_RESPONDER') {
      res.status(403).json({ success: false, message: 'Responder access required.' });
      return;
    }

    const requestId = Number(req.params.id);
    const request = await prisma.roadsideRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.status !== 'PENDING') {
      res.status(404).json({ success: false, message: 'Pending request not found.' });
      return;
    }

    const updated = await prisma.roadsideRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        responderId: auth.userId,
        acceptedAt: new Date()
      }
    });

    res.status(200).json({ success: true, message: 'Request accepted successfully.', request: updated });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'ROADSIDE_RESPONDER') {
      res.status(403).json({ success: false, message: 'Responder access required.' });
      return;
    }

    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid request status.' });
      return;
    }

    const request = await prisma.roadsideRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.responderId !== auth.userId) {
      res.status(404).json({ success: false, message: 'Request not found.' });
      return;
    }

    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.roadsideRequest.update({
      where: { id: requestId },
      data: updateData
    });

    res.status(200).json({ success: true, message: 'Status updated successfully.', request: updated });
  } catch (error) {
    console.error('Update roadside status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
