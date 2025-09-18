import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    create(createStaffDto: CreateStaffDto): Promise<({
        user: {
            id: string;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            type: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        schoolId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        user: {
            id: string;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            type: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        schoolId: string;
        role: string;
    })>;
    findAll(schoolId: string): Promise<{
        teachers: ({
            user: {
                id: string;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                type: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            teacherAssignments: ({
                class: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    schoolId: string;
                    levelId: string;
                    order: number;
                };
                subject: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    code: string;
                    schoolId: string;
                    description: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                academicYear: string;
                classId: string;
                teacherId: string;
                subjectId: string;
                isFormTeacher: boolean;
            })[];
        } & {
            id: string;
            isActive: boolean;
            userId: string;
            schoolId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            user: {
                id: string;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                type: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        } & {
            id: string;
            isActive: boolean;
            userId: string;
            schoolId: string;
            role: string;
        })[];
    }>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            type: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        teacherAssignments: ({
            class: {
                id: string;
                isActive: boolean;
                name: string;
                schoolId: string;
                levelId: string;
                order: number;
            };
            subject: {
                id: string;
                isActive: boolean;
                name: string;
                code: string;
                schoolId: string;
                description: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            academicYear: string;
            classId: string;
            teacherId: string;
            subjectId: string;
            isFormTeacher: boolean;
        })[];
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        schoolId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        user: {
            id: string;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            type: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        schoolId: string;
        role: string;
    })>;
    update(id: string, updateStaffDto: UpdateStaffDto): Promise<({
        user: {
            id: string;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            type: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        teacherAssignments: ({
            class: {
                id: string;
                isActive: boolean;
                name: string;
                schoolId: string;
                levelId: string;
                order: number;
            };
            subject: {
                id: string;
                isActive: boolean;
                name: string;
                code: string;
                schoolId: string;
                description: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            academicYear: string;
            classId: string;
            teacherId: string;
            subjectId: string;
            isFormTeacher: boolean;
        })[];
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        schoolId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        user: {
            id: string;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            fullName: string | null;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            type: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    } & {
        id: string;
        isActive: boolean;
        userId: string;
        schoolId: string;
        role: string;
    })>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findBySchool(schoolId: string): Promise<{
        teachers: ({
            user: {
                id: string;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                type: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
            teacherAssignments: ({
                class: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    schoolId: string;
                    levelId: string;
                    order: number;
                };
                subject: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    code: string;
                    schoolId: string;
                    description: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                academicYear: string;
                classId: string;
                teacherId: string;
                subjectId: string;
                isFormTeacher: boolean;
            })[];
        } & {
            id: string;
            isActive: boolean;
            userId: string;
            schoolId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            user: {
                id: string;
                email: string;
                password: string;
                type: import(".prisma/client").$Enums.UserType;
                firstName: string;
                lastName: string;
                fullName: string | null;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                type: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
        } & {
            id: string;
            isActive: boolean;
            userId: string;
            schoolId: string;
            role: string;
        })[];
    }>;
}
