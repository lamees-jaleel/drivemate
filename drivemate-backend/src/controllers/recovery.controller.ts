import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { sendRecoveryOTP, sendPasswordChangedNotification } from '../services/email.service.js';
import { validateIdentify, validateVerify, validateReset, validateResend } from '../validators/recovery.validator.js';

const OTP_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain || !localPart) return email;
  const maskedLocal = localPart.charAt(0) + '***' + (localPart.length > 2 ? localPart.slice(-1) : '');
  return `${maskedLocal}@${domain}`;
}

export async function identifyAccount(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateIdentify(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: validation.errors });
      return;
    }

    const email = req.body.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // If user does not exist, return explicit error
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'This email address is not registered in our system.'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    // Create session
    const session = await prisma.recoverySession.create({
      data: {
        userId: user.id,
        email: user.email,
        otpHash,
        expiresAt,
        step: 'INITIATED',
        lastResendAt: new Date()
      }
    });

    await sendRecoveryOTP(user.email, otp);

    res.status(200).json({
      success: true,
      sessionId: session.id,
      maskedEmail: maskEmail(user.email),
      message: 'Recovery OTP sent successfully.'
    });
  } catch (error) {
    console.error('identifyAccount error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during account identification.' });
  }
}

export async function verifyOTP(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateVerify(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: validation.errors });
      return;
    }

    const { sessionId, otp } = req.body;
    const session = await prisma.recoverySession.findUnique({ where: { id: sessionId } });

    if (!session || session.step !== 'INITIATED') {
      res.status(400).json({ success: false, message: 'Invalid or expired recovery session.' });
      return;
    }

    if (new Date() > session.expiresAt) {
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      return;
    }

    if (session.attempts >= MAX_ATTEMPTS) {
      res.status(429).json({ success: false, message: 'Too many failed attempts. Please start over.' });
      return;
    }

    const isValid = await bcrypt.compare(otp, session.otpHash);
    if (!isValid) {
      await prisma.recoverySession.update({
        where: { id: sessionId },
        data: { attempts: session.attempts + 1 }
      });
      res.status(400).json({ success: false, message: 'Invalid OTP.' });
      return;
    }

    await prisma.recoverySession.update({
      where: { id: sessionId },
      data: { step: 'VERIFIED' }
    });

    res.status(200).json({ success: true, message: 'OTP verified successfully. You can now reset your password.' });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during OTP verification.' });
  }
}

export async function resendOTP(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateResend(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: validation.errors });
      return;
    }

    const { sessionId } = req.body;
    const session = await prisma.recoverySession.findUnique({ where: { id: sessionId } });

    if (!session || session.step !== 'INITIATED') {
      res.status(400).json({ success: false, message: 'Invalid or expired recovery session.' });
      return;
    }

    if (session.lastResendAt) {
      const secondsSinceLastResend = (new Date().getTime() - session.lastResendAt.getTime()) / 1000;
      if (secondsSinceLastResend < RESEND_COOLDOWN_SECONDS) {
        res.status(429).json({ success: false, message: `Please wait before requesting another OTP.` });
        return;
      }
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    await prisma.recoverySession.update({
      where: { id: sessionId },
      data: {
        otpHash,
        expiresAt,
        lastResendAt: new Date(),
        attempts: 0 // Reset attempts on resend
      }
    });

    await sendRecoveryOTP(session.email, otp);

    res.status(200).json({ success: true, message: 'A new OTP has been sent.' });
  } catch (error) {
    console.error('resendOTP error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during OTP resend.' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateReset(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: validation.errors });
      return;
    }

    const { sessionId, password } = req.body;
    const session = await prisma.recoverySession.findUnique({ where: { id: sessionId } });

    if (!session || session.step !== 'VERIFIED') {
      res.status(400).json({ success: false, message: 'Invalid or incomplete recovery session.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12); // Match auth.controller's rounds (12)

    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash }
    });

    // Revoke session
    await prisma.recoverySession.delete({ where: { id: sessionId } });

    await sendPasswordChangedNotification(session.email);

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during password reset.' });
  }
}
