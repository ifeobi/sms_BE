import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
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
}
