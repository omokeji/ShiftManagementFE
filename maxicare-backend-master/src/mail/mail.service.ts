import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.warn('Email credentials not configured. Email functionality will be disabled.');
      this.transporter = null;
      return;
    }

    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      service: 'gmail',  // Using Gmail service
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,  // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use app-specific password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection error:', error);
      } else {
        this.logger.log('Server is ready to take our messages');
      }
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Maxicare System'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Message sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    return this.sendMail(to, 'Password Reset Request', html);
  }

  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const html = `
      <h2>Welcome to Maxicare!</h2>
      <p>Hello ${username},</p>
      <p>Thank you for joining us. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `;

    return this.sendMail(to, 'Welcome to Maxicare!', html);
  }
} 