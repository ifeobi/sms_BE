import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createStaffDto: CreateStaffDto): Promise<({
        school: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            type: string;
            updatedAt: Date;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            latitude: number | null;
            longitude: number | null;
            formattedAddress: string | null;
            landmark: string | null;
            logo: string | null;
        };
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        school: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            type: string;
            updatedAt: Date;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            latitude: number | null;
            longitude: number | null;
            formattedAddress: string | null;
            landmark: string | null;
            logo: string | null;
        };
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        userId: string;
        role: string;
    })>;
    findAll(schoolId: string): Promise<{
        teachers: ({
            school: {
                id: string;
                createdAt: Date;
                name: string;
                isActive: boolean;
                type: string;
                updatedAt: Date;
                country: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                latitude: number | null;
                longitude: number | null;
                formattedAddress: string | null;
                landmark: string | null;
                logo: string | null;
            };
            user: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            teacherAssignments: ({
                class: {
                    id: string;
                    schoolId: string;
                    name: string;
                    isActive: boolean;
                    order: number;
                    levelId: string;
                };
                subject: {
                    id: string;
                    schoolId: string;
                    name: string;
                    isActive: boolean;
                    description: string | null;
                    code: string;
                };
            } & {
                id: string;
                schoolId: string;
                createdAt: Date;
                isActive: boolean;
                academicYear: string;
                updatedAt: Date;
                teacherId: string;
                classId: string;
                subjectId: string;
                isFormTeacher: boolean;
            })[];
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            school: {
                id: string;
                createdAt: Date;
                name: string;
                isActive: boolean;
                type: string;
                updatedAt: Date;
                country: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                latitude: number | null;
                longitude: number | null;
                formattedAddress: string | null;
                landmark: string | null;
                logo: string | null;
            };
            user: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            userId: string;
            role: string;
        })[];
    }>;
    findOne(id: string): Promise<({
        school: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            type: string;
            updatedAt: Date;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            latitude: number | null;
            longitude: number | null;
            formattedAddress: string | null;
            landmark: string | null;
            logo: string | null;
        };
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        teacherAssignments: ({
            class: {
                id: string;
                schoolId: string;
                name: string;
                isActive: boolean;
                order: number;
                levelId: string;
            };
            subject: {
                id: string;
                schoolId: string;
                name: string;
                isActive: boolean;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            isActive: boolean;
            academicYear: string;
            updatedAt: Date;
            teacherId: string;
            classId: string;
            subjectId: string;
            isFormTeacher: boolean;
        })[];
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        school: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            type: string;
            updatedAt: Date;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            latitude: number | null;
            longitude: number | null;
            formattedAddress: string | null;
            landmark: string | null;
            logo: string | null;
        };
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        userId: string;
        role: string;
    })>;
    update(id: string, updateStaffDto: UpdateStaffDto): Promise<({
        school: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            type: string;
            updatedAt: Date;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            latitude: number | null;
            longitude: number | null;
            formattedAddress: string | null;
            landmark: string | null;
            logo: string | null;
        };
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        teacherAssignments: ({
            class: {
                id: string;
                schoolId: string;
                name: string;
                isActive: boolean;
                order: number;
                levelId: string;
            };
            subject: {
                id: string;
                schoolId: string;
                name: string;
                isActive: boolean;
                description: string | null;
                code: string;
            };
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            isActive: boolean;
            academicYear: string;
            updatedAt: Date;
            teacherId: string;
            classId: string;
            subjectId: string;
            isFormTeacher: boolean;
        })[];
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        school: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            type: string;
            updatedAt: Date;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            latitude: number | null;
            longitude: number | null;
            formattedAddress: string | null;
            landmark: string | null;
            logo: string | null;
        };
        user: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        userId: string;
        role: string;
    })>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findBySchool(schoolId: string): Promise<{
        teachers: ({
            school: {
                id: string;
                createdAt: Date;
                name: string;
                isActive: boolean;
                type: string;
                updatedAt: Date;
                country: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                latitude: number | null;
                longitude: number | null;
                formattedAddress: string | null;
                landmark: string | null;
                logo: string | null;
            };
            user: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            teacherAssignments: ({
                class: {
                    id: string;
                    schoolId: string;
                    name: string;
                    isActive: boolean;
                    order: number;
                    levelId: string;
                };
                subject: {
                    id: string;
                    schoolId: string;
                    name: string;
                    isActive: boolean;
                    description: string | null;
                    code: string;
                };
            } & {
                id: string;
                schoolId: string;
                createdAt: Date;
                isActive: boolean;
                academicYear: string;
                updatedAt: Date;
                teacherId: string;
                classId: string;
                subjectId: string;
                isFormTeacher: boolean;
            })[];
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            school: {
                id: string;
                createdAt: Date;
                name: string;
                isActive: boolean;
                type: string;
                updatedAt: Date;
                country: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                latitude: number | null;
                longitude: number | null;
                formattedAddress: string | null;
                landmark: string | null;
                logo: string | null;
            };
            user: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            userId: string;
            role: string;
        })[];
    }>;
}
