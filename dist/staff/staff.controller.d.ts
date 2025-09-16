import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    create(createStaffDto: CreateStaffDto): Promise<({
        user: {
            type: import(".prisma/client").$Enums.UserType;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            id: string;
            fullName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            type: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            landmark: string | null;
            formattedAddress: string | null;
            latitude: number | null;
            longitude: number | null;
            country: string;
            logo: string | null;
        };
    } & {
        isActive: boolean;
        id: string;
        userId: string;
        schoolId: string;
        department: string | null;
        employeeNumber: string;
        hireDate: Date;
    }) | ({
        user: {
            type: import(".prisma/client").$Enums.UserType;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            id: string;
            fullName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            type: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            landmark: string | null;
            formattedAddress: string | null;
            latitude: number | null;
            longitude: number | null;
            country: string;
            logo: string | null;
        };
    } & {
        isActive: boolean;
        id: string;
        role: string;
        userId: string;
        schoolId: string;
    })>;
    findAll(schoolId: string): Promise<{
        teachers: ({
            user: {
                type: import(".prisma/client").$Enums.UserType;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                id: string;
                fullName: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                type: string;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                landmark: string | null;
                formattedAddress: string | null;
                latitude: number | null;
                longitude: number | null;
                country: string;
                logo: string | null;
            };
            teacherAssignments: ({
                class: {
                    isActive: boolean;
                    id: string;
                    name: string;
                    schoolId: string;
                    levelId: string;
                    order: number;
                };
                subject: {
                    description: string | null;
                    isActive: boolean;
                    id: string;
                    name: string;
                    code: string;
                    schoolId: string;
                };
            } & {
                isActive: boolean;
                id: string;
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
            isActive: boolean;
            id: string;
            userId: string;
            schoolId: string;
            department: string | null;
            employeeNumber: string;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            user: {
                type: import(".prisma/client").$Enums.UserType;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                id: string;
                fullName: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                type: string;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                landmark: string | null;
                formattedAddress: string | null;
                latitude: number | null;
                longitude: number | null;
                country: string;
                logo: string | null;
            };
        } & {
            isActive: boolean;
            id: string;
            role: string;
            userId: string;
            schoolId: string;
        })[];
    }>;
    findOne(id: string): Promise<({
        user: {
            type: import(".prisma/client").$Enums.UserType;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            id: string;
            fullName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            type: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            landmark: string | null;
            formattedAddress: string | null;
            latitude: number | null;
            longitude: number | null;
            country: string;
            logo: string | null;
        };
        teacherAssignments: ({
            class: {
                isActive: boolean;
                id: string;
                name: string;
                schoolId: string;
                levelId: string;
                order: number;
            };
            subject: {
                description: string | null;
                isActive: boolean;
                id: string;
                name: string;
                code: string;
                schoolId: string;
            };
        } & {
            isActive: boolean;
            id: string;
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
        isActive: boolean;
        id: string;
        userId: string;
        schoolId: string;
        department: string | null;
        employeeNumber: string;
        hireDate: Date;
    }) | ({
        user: {
            type: import(".prisma/client").$Enums.UserType;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            id: string;
            fullName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            type: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            landmark: string | null;
            formattedAddress: string | null;
            latitude: number | null;
            longitude: number | null;
            country: string;
            logo: string | null;
        };
    } & {
        isActive: boolean;
        id: string;
        role: string;
        userId: string;
        schoolId: string;
    })>;
    update(id: string, updateStaffDto: UpdateStaffDto): Promise<({
        user: {
            type: import(".prisma/client").$Enums.UserType;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            id: string;
            fullName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            type: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            landmark: string | null;
            formattedAddress: string | null;
            latitude: number | null;
            longitude: number | null;
            country: string;
            logo: string | null;
        };
        teacherAssignments: ({
            class: {
                isActive: boolean;
                id: string;
                name: string;
                schoolId: string;
                levelId: string;
                order: number;
            };
            subject: {
                description: string | null;
                isActive: boolean;
                id: string;
                name: string;
                code: string;
                schoolId: string;
            };
        } & {
            isActive: boolean;
            id: string;
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
        isActive: boolean;
        id: string;
        userId: string;
        schoolId: string;
        department: string | null;
        employeeNumber: string;
        hireDate: Date;
    }) | ({
        user: {
            type: import(".prisma/client").$Enums.UserType;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            isActive: boolean;
            id: string;
            fullName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            type: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            landmark: string | null;
            formattedAddress: string | null;
            latitude: number | null;
            longitude: number | null;
            country: string;
            logo: string | null;
        };
    } & {
        isActive: boolean;
        id: string;
        role: string;
        userId: string;
        schoolId: string;
    })>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findBySchool(schoolId: string): Promise<{
        teachers: ({
            user: {
                type: import(".prisma/client").$Enums.UserType;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                id: string;
                fullName: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                type: string;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                landmark: string | null;
                formattedAddress: string | null;
                latitude: number | null;
                longitude: number | null;
                country: string;
                logo: string | null;
            };
            teacherAssignments: ({
                class: {
                    isActive: boolean;
                    id: string;
                    name: string;
                    schoolId: string;
                    levelId: string;
                    order: number;
                };
                subject: {
                    description: string | null;
                    isActive: boolean;
                    id: string;
                    name: string;
                    code: string;
                    schoolId: string;
                };
            } & {
                isActive: boolean;
                id: string;
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
            isActive: boolean;
            id: string;
            userId: string;
            schoolId: string;
            department: string | null;
            employeeNumber: string;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            user: {
                type: import(".prisma/client").$Enums.UserType;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
                phone: string | null;
                isActive: boolean;
                id: string;
                fullName: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                type: string;
                isActive: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                street: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                landmark: string | null;
                formattedAddress: string | null;
                latitude: number | null;
                longitude: number | null;
                country: string;
                logo: string | null;
            };
        } & {
            isActive: boolean;
            id: string;
            role: string;
            userId: string;
            schoolId: string;
        })[];
    }>;
}
