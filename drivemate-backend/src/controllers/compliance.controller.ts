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

export async function getDocumentsByStatus(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'COMPLIANCE_ADVISOR') {
      res.status(403).json({ success: false, message: 'Compliance Advisor access required.' });
      return;
    }

    const { status } = req.query;

    const whereClause: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(status).toUpperCase())) {
      whereClause.verificationStatus = String(status).toUpperCase();
    }

    const documents = await prisma.vehicleDocument.findMany({
      where: whereClause,
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: documents.length, documents });
  } catch (error) {
    console.error('Get compliance documents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function reviewDocument(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'COMPLIANCE_ADVISOR') {
      res.status(403).json({ success: false, message: 'Compliance Advisor access required.' });
      return;
    }

    const documentId = Number(req.params.id);
    const { status, note } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid verification status. Must be APPROVED or REJECTED.' });
      return;
    }

    const document = await prisma.vehicleDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found.' });
      return;
    }

    const updated = await prisma.vehicleDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: status,
        verificationNote: note || null,
        reviewedById: auth.userId,
        reviewedAt: new Date()
      },
      include: {
        vehicle: true
      }
    });

    res.status(200).json({ success: true, message: 'Document reviewed successfully.', document: updated });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function getComplianceStats(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth || auth.role !== 'COMPLIANCE_ADVISOR') {
      res.status(403).json({ success: false, message: 'Compliance Advisor access required.' });
      return;
    }

    const pendingReviews = await prisma.vehicleDocument.count({
      where: { verificationStatus: 'PENDING' }
    });

    const completedAdvisories = await prisma.vehicleDocument.count({
      where: { verificationStatus: { in: ['APPROVED', 'REJECTED'] } }
    });

    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringDocuments = await prisma.vehicleDocument.count({
      where: {
        expiryDate: {
          gte: now,
          lte: thirtyDaysLater
        }
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        pendingReviews,
        expiringDocuments,
        activeCases: pendingReviews, // Active cases can map to pending reviews currently under observation
        completedAdvisories
      }
    });
  } catch (error) {
    console.error('Get compliance stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
