import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
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
