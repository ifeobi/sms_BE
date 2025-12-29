import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(
    email: string,
    code: string,
    userName: string,
    userType: string,
  ): Promise<boolean> {
    try {
      console.log('=== EMAIL DEBUG ===');
      console.log('SMTP_HOST:', process.env.SMTP_HOST);
      console.log('SMTP_PORT:', process.env.SMTP_PORT);
      console.log('SMTP_USER:', process.env.SMTP_USER);
      console.log(
        'SMTP_PASS:',
        process.env.SMTP_PASS ? '***SET***' : '***NOT SET***',
      );
      console.log('Sending to:', email);
      console.log('Code:', code);
      console.log('===================');

      const htmlContent = this.getVerificationEmailTemplate(
        userName,
        code,
        userType,
      );

      await this.mailerService.sendMail({
        to: email,
        subject: 'Your SMS Platform Verification Code',
        html: htmlContent,
      });

      console.log('✅ Email sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      console.error('Error details:', error.message);
      return false;
    }
  }

  async sendWelcomeEmail(
    email: string,
    userName: string,
    userType: string,
  ): Promise<boolean> {
    try {
      const htmlContent = this.getWelcomeEmailTemplate(userName, userType);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to SMS Platform',
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
    userType: string,
  ): Promise<boolean> {
    try {
      console.log('=== PASSWORD RESET EMAIL DEBUG ===');
      console.log('SMTP_HOST:', process.env.SMTP_HOST);
      console.log('SMTP_PORT:', process.env.SMTP_PORT);
      console.log('SMTP_USER:', process.env.SMTP_USER);
      console.log(
        'SMTP_PASS:',
        process.env.SMTP_PASS ? '***SET***' : '***NOT SET***',
      );
      console.log('Sending password reset email to:', email);
      console.log('Reset token:', resetToken);
      console.log('===================================');

      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ SMTP credentials not configured!');
        console.error('Please set SMTP_USER and SMTP_PASS in your .env file');
        console.error('For development, you can use Mailtrap or Ethereal Email');
        console.error('See EMAIL_SETUP.md for instructions');
        return false;
      }

      const htmlContent = this.getPasswordResetEmailTemplate(
        userName,
        resetToken,
        userType,
      );

      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request - SMS Platform',
        html: htmlContent,
      });

      console.log('✅ Password reset email sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide helpful error messages
      if (error.message && error.message.includes('ETIMEDOUT')) {
        console.error('⚠️ Connection timeout - Check your network/firewall settings');
        console.error('⚠️ Make sure port 587 is not blocked');
        console.error('⚠️ If using Gmail, ensure you have a valid App Password');
      } else if (error.message && error.message.includes('EAUTH')) {
        console.error('⚠️ Authentication failed - Check your SMTP credentials');
        console.error('⚠️ For Gmail, make sure you\'re using an App Password, not your regular password');
      }
      
      return false;
    }
  }

  // New methods for bulk student import
  async sendStudentWelcomeEmail(data: {
    to: string;
    studentName: string;
    email: string;
    password: string;
    schoolName: string;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getStudentWelcomeEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: `Welcome to ${data.schoolName} - Student Account Created`,
        html: htmlContent,
      });

      console.log(`✅ Student welcome email sent to ${data.to}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send student welcome email:', error);
      return false;
    }
  }

  async sendParentWelcomeEmail(data: {
    to: string;
    parentName: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getParentWelcomeEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: 'Welcome to SMS Platform - Parent Account Created',
        html: htmlContent,
      });

      console.log(`✅ Parent welcome email sent to ${data.to}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send parent welcome email:', error);
      return false;
    }
  }

  async sendParentInvitationEmail(data: {
    to: string;
    parentName: string;
    studentName: string;
    verificationCode: string;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getParentInvitationEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: `Link Your Account to ${data.studentName} - SMS Platform`,
        html: htmlContent,
      });

      console.log(`✅ Parent invitation email sent to ${data.to}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send parent invitation email:', error);
      return false;
    }
  }

  private getVerificationEmailTemplate(
    userName: string,
    code: string,
    userType: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: #1976d2; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background: #ffffff; 
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            color: #1976d2; 
            padding: 20px; 
            background: #f8f9fa; 
            margin: 20px 0; 
            border-radius: 8px; 
            border: 2px solid #e3f2fd;
            letter-spacing: 4px;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
          .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMS Platform</h1>
            <p>${userType} Registration Verification</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName},</h2>
            
            <p>Thank you for registering on our School Management System platform. To complete your registration, please use the verification code below:</p>
            
            <div class="code">${code}</div>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This code expires in 15 minutes</li>
                <li>Keep this code secure and don't share it with others</li>
                <li>If you didn't request this verification code, please ignore this email</li>
              </ul>
            </div>
            
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(userName: string, userType: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SMS Platform</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: #1976d2; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background: #ffffff; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMS Platform</h1>
            <p>Welcome ${userType}!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName},</h2>
            
            <p>Welcome to our School Management System platform! Your account has been created successfully.</p>
            
            <p>You can now access all the features available for ${userType}s on our platform.</p>
            
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    userName: string,
    resetToken: string,
    userType: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - SMS Platform</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: #d32f2f; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background: #ffffff; 
          }
          .token { 
            font-size: 24px; 
            font-weight: bold; 
            text-align: center; 
            color: #d32f2f; 
            padding: 20px; 
            background: #f8f9fa; 
            margin: 20px 0; 
            border-radius: 8px; 
            border: 2px solid #ffcdd2;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
          .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .button {
            display: inline-block;
            background: #d32f2f;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMS Platform</h1>
            <p>Password Reset Request</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName},</h2>
            
            <p>We received a request to reset your password for your ${userType} account on our School Management System platform.</p>
            
            <p>Use the reset token below to create a new password:</p>
            
            <div class="token">${resetToken}</div>
            
            <div class="warning">
              <strong>Important Security Information:</strong>
              <ul>
                <li>This reset token expires in 15 minutes</li>
                <li>Keep this token secure and don't share it with others</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your current password will remain unchanged until you complete the reset process</li>
              </ul>
            </div>
            
            <p>If you have any questions or concerns, please contact our support team.</p>
            
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // New methods for bulk student import
  private getStudentWelcomeEmailTemplate(data: {
    to: string;
    studentName: string;
    email: string;
    password: string;
    schoolName: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${data.schoolName} - Student Account Created</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: #1976d2; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background: #ffffff; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMS Platform</h1>
            <p>Welcome ${data.studentName}!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.studentName},</h2>
            
            <p>Welcome to ${data.schoolName}! Your student account has been created successfully.</p>
            
            <p>Your login details:</p>
            <ul>
              <li>Email: ${data.email}</li>
              <li>Password: ${data.password}</li>
            </ul>
            
            <p>You can now access all the features available for students on our platform.</p>
            
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getParentWelcomeEmailTemplate(data: {
    to: string;
    parentName: string;
    email: string;
    password: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SMS Platform - Parent Account Created</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: #1976d2; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background: #ffffff; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMS Platform</h1>
            <p>Welcome ${data.parentName}!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.parentName},</h2>
            
            <p>Welcome to SMS Platform! Your parent account has been created successfully.</p>
            
            <p>Your login details:</p>
            <ul>
              <li>Email: ${data.email}</li>
              <li>Password: ${data.password}</li>
            </ul>
            
            <p>You can now access all the features available for parents on our platform.</p>
            
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getParentInvitationEmailTemplate(data: {
    to: string;
    parentName: string;
    studentName: string;
    verificationCode: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Your Account to ${data.studentName} - SMS Platform</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: #1976d2; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
          }
          .content { 
            padding: 20px; 
            background: #ffffff; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SMS Platform</h1>
            <p>Link Your Account to ${data.studentName}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.parentName},</h2>
            
            <p>You have been invited to link your account to ${data.studentName}'s account on our School Management System platform.</p>
            
            <p>Please use the verification code below to complete the linking process:</p>
            
            <div class="code">${data.verificationCode}</div>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This code expires in 15 minutes</li>
                <li>Keep this code secure and don't share it with others</li>
                <li>If you didn't receive this invitation, please ignore this email</li>
              </ul>
            </div>
            
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==================== TEACHER NOTIFICATION EMAILS ====================

  async sendAssignmentReminderEmail(data: {
    to: string;
    teacherName: string;
    assignmentTitle: string;
    assignmentDescription: string;
    dueDate: Date;
    className: string;
    subjectName: string;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getAssignmentReminderEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: `Assignment Reminder: ${data.assignmentTitle}`,
        html: htmlContent,
      });

      this.logger.log(`✅ Assignment reminder email sent to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send assignment reminder email:', error);
      return false;
    }
  }

  async sendWeeklySummaryEmail(data: {
    to: string;
    teacherName: string;
    weekStartDate: Date;
    assignmentsCreated: number;
    assignmentsGraded: number;
    attendanceRecords: number;
    classesTaught: number;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getWeeklySummaryEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: 'Your Weekly Teaching Summary',
        html: htmlContent,
      });

      this.logger.log(`✅ Weekly summary email sent to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send weekly summary email:', error);
      return false;
    }
  }

  async sendParentCommunicationEmail(data: {
    to: string;
    teacherName: string;
    parentName: string;
    messagePreview: string;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getParentCommunicationEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: `New Message from ${data.parentName}`,
        html: htmlContent,
      });

      this.logger.log(`✅ Parent communication email sent to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send parent communication email:', error);
      return false;
    }
  }

  private getAssignmentReminderEmailTemplate(data: {
    teacherName: string;
    assignmentTitle: string;
    assignmentDescription: string;
    dueDate: Date;
    className: string;
    subjectName: string;
  }): string {
    const dueDateStr = new Date(data.dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assignment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #ffffff; }
          .assignment-box { background: #f8f9fa; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .due-date { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Assignment Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.teacherName},</h2>
            <p>This is a reminder about an upcoming assignment deadline.</p>
            <div class="assignment-box">
              <h3>${data.assignmentTitle}</h3>
              <p><strong>Subject:</strong> ${data.subjectName}</p>
              <p><strong>Class:</strong> ${data.className}</p>
              <p>${data.assignmentDescription}</p>
            </div>
            <div class="due-date">
              <strong>⏰ Due Date:</strong> ${dueDateStr}
            </div>
            <p>Please ensure all students are aware of this deadline and that grading is prepared.</p>
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWeeklySummaryEmailTemplate(data: {
    teacherName: string;
    weekStartDate: Date;
    assignmentsCreated: number;
    assignmentsGraded: number;
    attendanceRecords: number;
    classesTaught: number;
  }): string {
    const weekEndDate = new Date(data.weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const weekRange = `${data.weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #ffffff; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #e3f2fd; }
          .stat-number { font-size: 32px; font-weight: bold; color: #1976d2; }
          .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Summary</h1>
            <p>${weekRange}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.teacherName},</h2>
            <p>Here's a summary of your teaching activities for the past week:</p>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-number">${data.assignmentsCreated}</div>
                <div class="stat-label">Assignments Created</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.assignmentsGraded}</div>
                <div class="stat-label">Assignments Graded</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.attendanceRecords}</div>
                <div class="stat-label">Attendance Records</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${data.classesTaught}</div>
                <div class="stat-label">Classes Taught</div>
              </div>
            </div>
            <p>Keep up the great work! Continue making a positive impact on your students' education.</p>
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getParentCommunicationEmailTemplate(data: {
    teacherName: string;
    parentName: string;
    messagePreview: string;
  }): string {
    const preview = data.messagePreview.length > 150 
      ? data.messagePreview.substring(0, 150) + '...' 
      : data.messagePreview;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Parent Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #ffffff; }
          .message-box { background: #f8f9fa; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Parent Message</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.teacherName},</h2>
            <p>You have received a new message from <strong>${data.parentName}</strong>.</p>
            <div class="message-box">
              <p><strong>Message Preview:</strong></p>
              <p>${preview}</p>
            </div>
            <p>Please log in to your account to view and respond to this message.</p>
            <p style="text-align: center;">
              <a href="#" class="button">View Message</a>
            </p>
            <p>Best regards,<br>The SMS Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==================== TEACHER WELCOME EMAIL ====================

  async sendTeacherWelcomeEmail(data: {
    to: string;
    teacherName: string;
    email: string;
    password: string;
    schoolName: string;
  }): Promise<boolean> {
    try {
      const htmlContent = this.getTeacherWelcomeEmailTemplate(data);

      await this.mailerService.sendMail({
        to: data.to,
        subject: `Welcome to ${data.schoolName} - Teacher Account Created`,
        html: htmlContent,
      });

      this.logger.log(`✅ Teacher welcome email sent to ${data.to}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send teacher welcome email:', error);
      return false;
    }
  }

  private getTeacherWelcomeEmailTemplate(data: {
    teacherName: string;
    email: string;
    password: string;
    schoolName: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${data.schoolName} - Teacher Account Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #ffffff; }
          .credentials-box { background: #f8f9fa; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .password-box { background: #fff3cd; border: 2px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .password { font-size: 24px; font-weight: bold; color: #d32f2f; font-family: 'Courier New', monospace; letter-spacing: 2px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👨‍🏫 Welcome to ${data.schoolName}!</h1>
            <p>Teacher Account Created</p>
          </div>
          <div class="content">
            <h2>Hello ${data.teacherName},</h2>
            <p>Welcome to ${data.schoolName}! Your teacher account has been created successfully.</p>
            <p>You can now access the School Management System platform with the following credentials:</p>
            <div class="credentials-box">
              <p><strong>Email:</strong> ${data.email}</p>
            </div>
            <div class="password-box">
              <p style="margin: 0 0 10px 0;"><strong>Your Temporary Password:</strong></p>
              <div class="password">${data.password}</div>
            </div>
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul style="margin: 10px 0;">
                <li>Please change your password immediately after your first login</li>
                <li>Keep your password secure and don't share it with others</li>
                <li>If you didn't request this account, please contact your school administrator</li>
              </ul>
            </div>
            <p>You can now log in to access all the features available for teachers on our platform.</p>
            <p>Best regards,<br>The ${data.schoolName} Administration Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 SMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
