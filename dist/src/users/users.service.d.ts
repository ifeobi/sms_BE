import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
<<<<<<< HEAD:dist/users/users.service.d.ts
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
=======
        fullName: string | null;
>>>>>>> db67707b5f638e05d1e4e5a968ef80acf8a00176:dist/src/users/users.service.d.ts
        createdBy: string | null;
        lastLoginAt: Date | null;
        fullName: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
<<<<<<< HEAD:dist/users/users.service.d.ts
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
=======
        fullName: string | null;
>>>>>>> db67707b5f638e05d1e4e5a968ef80acf8a00176:dist/src/users/users.service.d.ts
        createdBy: string | null;
        lastLoginAt: Date | null;
        fullName: string | null;
    }>;
    findByEmail(email: string, type?: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
<<<<<<< HEAD:dist/users/users.service.d.ts
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
=======
        fullName: string | null;
>>>>>>> db67707b5f638e05d1e4e5a968ef80acf8a00176:dist/src/users/users.service.d.ts
        createdBy: string | null;
        lastLoginAt: Date | null;
        fullName: string | null;
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
<<<<<<< HEAD:dist/users/users.service.d.ts
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
=======
        fullName: string | null;
>>>>>>> db67707b5f638e05d1e4e5a968ef80acf8a00176:dist/src/users/users.service.d.ts
        createdBy: string | null;
        lastLoginAt: Date | null;
        fullName: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
<<<<<<< HEAD:dist/users/users.service.d.ts
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
=======
        fullName: string | null;
>>>>>>> db67707b5f638e05d1e4e5a968ef80acf8a00176:dist/src/users/users.service.d.ts
        createdBy: string | null;
        lastLoginAt: Date | null;
        fullName: string | null;
    }>;
    findByType(type: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.UserType;
        email: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        phone: string | null;
    }[]>;
}
