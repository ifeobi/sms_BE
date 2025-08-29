import { MailerService } from '@nestjs-modules/mailer';
export declare class EmailService {
    private mailerService;
    constructor(mailerService: MailerService);
    sendVerificationEmail(email: string, code: string, userName: string, userType: string): Promise<boolean>;
    sendWelcomeEmail(email: string, userName: string, userType: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetToken: string, userName: string, userType: string): Promise<boolean>;
    sendStudentWelcomeEmail(data: {
        to: string;
        studentName: string;
        email: string;
        password: string;
        schoolName: string;
    }): Promise<boolean>;
    sendParentWelcomeEmail(data: {
        to: string;
        parentName: string;
        email: string;
        password: string;
    }): Promise<boolean>;
    sendParentInvitationEmail(data: {
        to: string;
        parentName: string;
        studentName: string;
        verificationCode: string;
    }): Promise<boolean>;
    private getVerificationEmailTemplate;
    private getWelcomeEmailTemplate;
    private getPasswordResetEmailTemplate;
    private getStudentWelcomeEmailTemplate;
    private getParentWelcomeEmailTemplate;
    private getParentInvitationEmailTemplate;
}
