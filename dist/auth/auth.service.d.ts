import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService, prisma: PrismaService);
    validateUser(email: string, password: string, userType?: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            type: any;
            firstName: any;
            lastName: any;
            profilePicture: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            type: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        school: {
            id: string;
            name: string;
            type: string;
        };
    } | {
        access_token: string;
        user: {
            id: string;
            email: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
    }>;
    private registerSchoolAdmin;
    createMasterAccount(): Promise<{
        message: string;
        credentials?: undefined;
        user?: undefined;
    } | {
        message: string;
        credentials: {
            email: string;
            password: string;
        };
        user: {
            id: string;
            email: string;
            type: string;
            firstName: string;
            lastName: string;
        };
    }>;
    sendVerificationEmail(email: string, userType: string, userName?: string): Promise<{
        success: boolean;
        message: string;
        email: string;
        userType: string;
    }>;
    verifyEmail(email: string, code: string): Promise<{
        success: boolean;
        message: string;
        email: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateResetToken;
    getSchoolAdminProfile(userId: string): Promise<{
        isActive: boolean;
        role: string;
        schoolId: string;
    } | null>;
    getUserProfile(user: any): Promise<{
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    } | {
        role: string;
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
}
