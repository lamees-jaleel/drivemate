import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

async function initTransporter() {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Generate a test account on the fly for development
    console.log('[Email Service] No SMTP config found. Generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('[Email Service] Ethereal test account created for development.');
  }
}

initTransporter();

export async function sendRecoveryOTP(email: string, otp: string) {
  try {
    console.log(`[Email Service] Sending OTP ${otp} to ${email}`);
    const info = await transporter.sendMail({
      from: '"DriveMate Security" <noreply@drivemate.com>',
      to: email,
      subject: `Your DriveMate Recovery Code (${new Date().toLocaleTimeString()})`,
      text: `Your account recovery code is: ${otp}\n\nThis code is valid for 15 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #d9241b;">DriveMate</h2>
          <p>Your account recovery code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 4px;">${otp}</h1>
          <p>This code is valid for 15 minutes. Do not share it with anyone.</p>
        </div>
      `
    });
    
    if (!process.env.SMTP_HOST) {
      console.log(`[Email Service] Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('[Email Service] Failed to send OTP:', error);
  }
}

export async function sendPasswordChangedNotification(email: string) {
  try {
    console.log(`[Email Service] Sending password change notification to ${email}`);
    const info = await transporter.sendMail({
      from: '"DriveMate Security" <noreply@drivemate.com>',
      to: email,
      subject: 'Your DriveMate Password Has Been Changed',
      text: `Hello,\n\nThe password for your DriveMate account was recently changed.\n\nIf you did not make this change, please contact support immediately.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #d9241b;">DriveMate</h2>
          <p>Hello,</p>
          <p>The password for your DriveMate account was recently changed.</p>
          <p>If you did not make this change, please contact support immediately.</p>
        </div>
      `
    });
    
    if (!process.env.SMTP_HOST) {
      console.log(`[Email Service] Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('[Email Service] Failed to send notification:', error);
  }
}
