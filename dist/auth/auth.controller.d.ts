import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
        };
    }>;
    register(registerDto: any): Promise<{
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
        success: boolean;
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        requiresEmailVerification: boolean;
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
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        website: string | null;
        bio: string | null;
        country: string | null;
        profilePicture: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | {
        role: string;
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        website: string | null;
        bio: string | null;
        country: string | null;
        profilePicture: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | {
        categories: string[];
        plan: string;
        verified: boolean;
        rating: number;
        totalProducts: number;
        totalSales: number;
        totalRevenue: number;
        joinDate: Date;
        specialties: string[];
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        website: string | null;
        bio: string | null;
        country: string | null;
        profilePicture: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, updateDto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        website: string | null;
        bio: string | null;
        country: string | null;
        profilePicture: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | {
        role: string;
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        website: string | null;
        bio: string | null;
        country: string | null;
        profilePicture: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | {
        categories: string[];
        plan: string;
        verified: boolean;
        rating: number;
        totalProducts: number;
        totalSales: number;
        totalRevenue: number;
        joinDate: Date;
        specialties: string[];
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        website: string | null;
        bio: string | null;
        country: string | null;
        profilePicture: string | null;
        isActive: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
    verifyCreatorEmail(data: {
        email: string;
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
        access_token: string;
        user: {
            id: string;
            email: string;
            type: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        creator: {
            id: string | undefined;
            categories: string[] | undefined;
            plan: string | undefined;
        };
    }>;
}
