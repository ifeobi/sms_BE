import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            type: any;
            firstName: any;
            lastName: any;
            profilePicture: any;
            schoolId: string | null;
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
            schoolId: string;
        };
        school: {
            id: string;
            name: string;
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
    loginLocal(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            type: any;
            firstName: any;
            lastName: any;
            profilePicture: any;
            schoolId: string | null;
        };
    }>;
    getProfile(req: any): Promise<any>;
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
    sendVerificationEmail(data: {
        email: string;
        userType: string;
        userName?: string;
    }): Promise<{
        success: boolean;
        message: string;
        email: string;
        userType: string;
    }>;
    verifyEmail(data: {
        email: string;
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
        email: string;
    }>;
    resendVerificationEmail(data: {
        email: string;
        userType: string;
        userName?: string;
    }): Promise<{
        success: boolean;
        message: string;
        email: string;
        userType: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
