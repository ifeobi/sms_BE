import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffService {
    private prisma;
    constructor(prisma: PrismaService);
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
        schoolId: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
        userId: string;
        department: string | null;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
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
        schoolId: string;
        role: string;
        userId: string;
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
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    schoolId: string;
                    levelId: string;
                    sectionName: string | null;
                    sectionOrder: number | null;
                    capacity: number | null;
                    templateUsed: string | null;
                    order: number;
                };
                subject: {
                    id: string;
                    name: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
                    description: string | null;
                    isActive: boolean;
                    schoolId: string;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
                    code: string;
                    schoolId: string;
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
            schoolId: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
            userId: string;
            department: string | null;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
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
            schoolId: string;
            role: string;
            userId: string;
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
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                levelId: string;
                sectionName: string | null;
                sectionOrder: number | null;
                capacity: number | null;
                templateUsed: string | null;
                order: number;
            };
            subject: {
                id: string;
                name: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
                description: string | null;
                isActive: boolean;
                schoolId: string;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
                code: string;
                schoolId: string;
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
        schoolId: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
        userId: string;
        department: string | null;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
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
        schoolId: string;
        role: string;
        userId: string;
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
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                levelId: string;
                sectionName: string | null;
                sectionOrder: number | null;
                capacity: number | null;
                templateUsed: string | null;
                order: number;
            };
            subject: {
                id: string;
                name: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
                description: string | null;
                isActive: boolean;
                schoolId: string;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
                code: string;
                schoolId: string;
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
        schoolId: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
        userId: string;
        department: string | null;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
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
        schoolId: string;
        role: string;
        userId: string;
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
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    schoolId: string;
                    levelId: string;
                    sectionName: string | null;
                    sectionOrder: number | null;
                    capacity: number | null;
                    templateUsed: string | null;
                    order: number;
                };
                subject: {
                    id: string;
                    name: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
                    description: string | null;
                    isActive: boolean;
                    schoolId: string;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
                    code: string;
                    schoolId: string;
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
            schoolId: string;
<<<<<<< HEAD:dist/staff/staff.service.d.ts
=======
            userId: string;
            department: string | null;
>>>>>>> origin/main:dist/src/staff/staff.service.d.ts
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
            schoolId: string;
            role: string;
            userId: string;
        })[];
    }>;
}
