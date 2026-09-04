import type { Request, Response } from 'express';
import { existsSync, unlinkSync } from 'node:fs';
import { relative } from 'node:path';
import { prisma } from '../lib/prisma.js';

interface AuthInfo {
  userId: number;
  role: string;
}

function getAuth(res: Response): AuthInfo | null {
  return (res.locals.auth as AuthInfo | undefined) ?? null;
}

function removeUploadedFile(file: Express.Multer.File | undefined): void {
  if (!file || !existsSync(file.path)) return;
  try {
    unlinkSync(file.path);
  } catch (error) {
    console.error('Unable to remove uploaded document:', error);
  }
}

export async function getExpertRenewalRequests(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { status } = req.query;
    let statusFilter: string[] = [];

    if (status === 'AVAILABLE') {
      statusFilter = ['PENDING'];
    } else if (status === 'ACTIVE') {
      statusFilter = ['ACCEPTED', 'IN_PROGRESS'];
    } else if (status === 'COMPLETED') {
      statusFilter = ['COMPLETED'];
    } else {
      statusFilter = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'CANCELLED'];
    }

    const requests = await prisma.documentRenewalRequest.findMany({
      where: {
        status: { in: statusFilter as any },
        OR: [
          { expertId: null },
          { expertId: auth.userId }
        ]
      },
      include: {
        owner: { select: { fullName: true, phone: true } },
        vehicle: true,
        document: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching expert renewals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function acceptRenewalRequest(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const id = Number(req.params.id);
    const request = await prisma.documentRenewalRequest.findUnique({ where: { id } });

    if (!request || request.status !== 'PENDING') {
      res.status(400).json({ success: false, message: 'Request not available.' });
      return;
    }

    const updated = await prisma.documentRenewalRequest.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        expertId: auth.userId,
        acceptedAt: new Date()
      }
    });

    res.status(200).json({ success: true, request: updated });
  } catch (error) {
    console.error('Error accepting renewal request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateRenewalStatus(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    const request = await prisma.documentRenewalRequest.findUnique({ where: { id } });
    if (!request || request.expertId !== auth.userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const updated = await prisma.documentRenewalRequest.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, request: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function completeRenewalRequest(req: Request, res: Response): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      removeUploadedFile(req.file);
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const id = Number(req.params.id);
    const request = await prisma.documentRenewalRequest.findUnique({
      where: { id },
      include: { document: true }
    });

    if (!request || request.expertId !== auth.userId) {
      removeUploadedFile(req.file);
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'Document file is required.' });
      return;
    }

    const { documentNumber, provider, issueDate, expiryDate, notes } = req.body;
    
    let parsedIssueDate = null;
    let parsedExpiryDate = null;
    
    if (issueDate) parsedIssueDate = new Date(issueDate);
    if (expiryDate) parsedExpiryDate = new Date(expiryDate);

    const storedPath = relative(process.cwd(), req.file.path).replace(/\\/g, '/');

    // Update document
    await prisma.vehicleDocument.update({
      where: { id: request.documentId },
      data: {
        documentNumber: documentNumber || null,
        provider: provider || null,
        issueDate: parsedIssueDate,
        expiryDate: parsedExpiryDate,
        notes: notes || null,
        filePath: storedPath,
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size
      }
    });

    // Update request
    const updatedRequest = await prisma.documentRenewalRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    res.status(200).json({ success: true, request: updatedRequest });
  } catch (error) {
    removeUploadedFile(req.file);
    console.error('Error completing renewal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
