import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    create(createStaffDto: CreateStaffDto): Promise<({
        user: {
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
            fullName: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        user: {
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
            fullName: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        role: string;
    })>;
    findAll(schoolId: string): Promise<{
        teachers: ({
            user: {
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
                fullName: string | null;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    schoolId: string;
                    levelId: string;
                    shortName: string | null;
                    sectionName: string | null;
                    sectionOrder: number | null;
                    capacity: number | null;
                    templateUsed: string | null;
                    graduation: boolean;
                    order: number;
                };
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    schoolId: string;
                    code: string;
                    category: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                academicYear: string;
                teacherId: string;
                classId: string;
                subjectId: string;
                isFormTeacher: boolean;
            })[];
        } & {
            id: string;
            isActive: boolean;
            schoolId: string;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            user: {
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
                fullName: string | null;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
            id: string;
            isActive: boolean;
            schoolId: string;
            userId: string;
            role: string;
        })[];
    }>;
    findOne(id: string): Promise<({
        user: {
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
            fullName: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                levelId: string;
                shortName: string | null;
                sectionName: string | null;
                sectionOrder: number | null;
                capacity: number | null;
                templateUsed: string | null;
                graduation: boolean;
                order: number;
            };
            subject: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                schoolId: string;
                code: string;
                category: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            academicYear: string;
            teacherId: string;
            classId: string;
            subjectId: string;
            isFormTeacher: boolean;
        })[];
    } & {
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        user: {
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
            fullName: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        role: string;
    })>;
    update(id: string, updateStaffDto: UpdateStaffDto): Promise<({
        user: {
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
            fullName: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                levelId: string;
                shortName: string | null;
                sectionName: string | null;
                sectionOrder: number | null;
                capacity: number | null;
                templateUsed: string | null;
                graduation: boolean;
                order: number;
            };
            subject: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                schoolId: string;
                code: string;
                category: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            academicYear: string;
            teacherId: string;
            classId: string;
            subjectId: string;
            isFormTeacher: boolean;
        })[];
    } & {
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    }) | ({
        user: {
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
            fullName: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
        };
        school: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        role: string;
    })>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findBySchool(schoolId: string): Promise<{
        teachers: ({
            user: {
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
                fullName: string | null;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    schoolId: string;
                    levelId: string;
                    shortName: string | null;
                    sectionName: string | null;
                    sectionOrder: number | null;
                    capacity: number | null;
                    templateUsed: string | null;
                    graduation: boolean;
                    order: number;
                };
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    schoolId: string;
                    code: string;
                    category: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                academicYear: string;
                teacherId: string;
                classId: string;
                subjectId: string;
                isFormTeacher: boolean;
            })[];
        } & {
            id: string;
            isActive: boolean;
            schoolId: string;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        })[];
        schoolAdmins: ({
            user: {
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
                fullName: string | null;
                createdBy: string | null;
                lastLoginAt: Date | null;
            };
            school: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
            id: string;
            isActive: boolean;
            schoolId: string;
            userId: string;
            role: string;
        })[];
    }>;
}
