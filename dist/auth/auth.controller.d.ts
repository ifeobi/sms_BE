import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
    register(registerDto: RegisterDto): Promise<{
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
    getProfile(req: any): any;
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
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
        };
    }>;
}
