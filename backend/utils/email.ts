import nodemailer from 'nodemailer';
import { logger } from './logger';

// Email transporter configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use SendGrid or other email service
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Development: Use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
};

const transporter = createTransporter();

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to Yoru's Random Test Platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976d2;">Welcome to Yoru's Random Test Platform!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining our professional services marketplace. We're excited to have you on board!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and book appointments with verified professionals</li>
          <li>Manage your profile and preferences</li>
          <li>Track your appointments and payments</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Yoru's Random Test Platform Team</p>
      </div>
    `,
  }),

  emailVerification: (name: string, verificationUrl: string) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976d2;">Verify Your Email Address</h1>
        <p>Hi ${name},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Yoru's Random Test Platform Team</p>
      </div>
    `,
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976d2;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Yoru's Random Test Platform Team</p>
      </div>
    `,
  }),

  appointmentConfirmation: (customerName: string, professionalName: string, date: string, time: string) => ({
    subject: 'Appointment Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976d2;">Appointment Confirmed</h1>
        <p>Hi ${customerName},</p>
        <p>Your appointment with ${professionalName} has been confirmed!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3>Appointment Details:</h3>
          <p><strong>Professional:</strong> ${professionalName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
        <p>You'll receive a Zoom meeting link closer to your appointment time.</p>
        <p>Best regards,<br>The Yoru's Random Test Platform Team</p>
      </div>
    `,
  }),

  appointmentReminder: (customerName: string, professionalName: string, date: string, time: string, zoomLink?: string) => ({
    subject: 'Appointment Reminder - Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1976d2;">Appointment Reminder</h1>
        <p>Hi ${customerName},</p>
        <p>This is a reminder that you have an appointment tomorrow with ${professionalName}.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3>Appointment Details:</h3>
          <p><strong>Professional:</strong> ${professionalName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          ${zoomLink ? `<p><strong>Zoom Link:</strong> <a href="${zoomLink}">${zoomLink}</a></p>` : ''}
        </div>
        <p>Please be ready a few minutes before your scheduled time.</p>
        <p>Best regards,<br>The Yoru's Random Test Platform Team</p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  template: { subject: string; html: string }
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@yoru-test-platform.com',
      to,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Email sent to ${to}: ${nodemailer.getTestMessageUrl(result)}`);
    } else {
      logger.info(`Email sent to ${to}: ${result.messageId}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

// Bulk email function
export const sendBulkEmail = async (
  recipients: string[],
  template: { subject: string; html: string }
): Promise<{ success: string[]; failed: string[] }> => {
  const success: string[] = [];
  const failed: string[] = [];

  for (const recipient of recipients) {
    const sent = await sendEmail(recipient, template);
    if (sent) {
      success.push(recipient);
    } else {
      failed.push(recipient);
    }
  }

  return { success, failed };
};
