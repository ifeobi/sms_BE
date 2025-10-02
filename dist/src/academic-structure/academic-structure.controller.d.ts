import { AcademicStructureService } from './academic-structure.service';
export declare class AcademicStructureController {
    private readonly academicStructureService;
    constructor(academicStructureService: AcademicStructureService);
    getSchoolAcademicStructure(schoolId: string): Promise<{
        config: {
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
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            educationSystemId: string;
            selectedLevels: string[];
            availableLevels: string[];
            customClassNames: import("@prisma/client/runtime/library").JsonValue | null;
            customSubjectNames: import("@prisma/client/runtime/library").JsonValue | null;
        };
        levels: ({
            classes: {
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
            }[];
        } & {
            id: string;
            name: string;
            isActive: boolean;
            schoolId: string;
            order: number;
        })[];
        classes: ({
            level: {
                id: string;
                name: string;
                isActive: boolean;
                schoolId: string;
                order: number;
            };
            sections: ({
                teacher: ({
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
                } & {
                    id: string;
                    isActive: boolean;
                    schoolId: string;
                    userId: string;
                    employeeNumber: string;
                    department: string | null;
                    hireDate: Date;
                }) | null;
            } & {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                schoolId: string;
                capacity: number | null;
                teacherId: string | null;
                classId: string;
            })[];
            subjects: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                schoolId: string;
                code: string;
                category: string | null;
            }[];
        } & {
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
        })[];
        subjects: ({
            classes: ({
                level: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    schoolId: string;
                    order: number;
                };
            } & {
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
            })[];
        } & {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            schoolId: string;
            code: string;
            category: string | null;
        })[];
        academicTerms: {
            id: string;
            name: string;
            isActive: boolean;
            schoolId: string;
            startDate: Date;
            endDate: Date;
            academicYear: string;
        }[];
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
            teacher: {
                id: string;
                isActive: boolean;
                schoolId: string;
                userId: string;
                employeeNumber: string;
                department: string | null;
                hireDate: Date;
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
        educationSystemId: string;
        selectedLevels: string[];
        availableLevels: string[];
    }>;
    getLevels(schoolId: string): Promise<({
        classes: {
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
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        order: number;
    })[]>;
    getClasses(schoolId: string): Promise<({
        level: {
            id: string;
            name: string;
            isActive: boolean;
            schoolId: string;
            order: number;
        };
        sections: ({
            teacher: ({
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
            } & {
                id: string;
                isActive: boolean;
                schoolId: string;
                userId: string;
                employeeNumber: string;
                department: string | null;
                hireDate: Date;
            }) | null;
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            capacity: number | null;
            teacherId: string | null;
            classId: string;
        })[];
        subjects: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            schoolId: string;
            code: string;
            category: string | null;
        }[];
    } & {
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
    })[]>;
    getSubjects(schoolId: string): Promise<({
        classes: ({
            level: {
                id: string;
                name: string;
                isActive: boolean;
                schoolId: string;
                order: number;
            };
        } & {
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
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        schoolId: string;
        code: string;
        category: string | null;
    })[]>;
    getAcademicTerms(schoolId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }[]>;
    getTeacherAssignments(filters: any): Promise<({
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
        teacher: {
            id: string;
            isActive: boolean;
            schoolId: string;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
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
    })[]>;
    createLevel(levelData: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        order: number;
    }>;
    createClass(classData: any): Promise<{
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
    }>;
    createSubject(subjectData: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        schoolId: string;
        code: string;
        category: string | null;
    }>;
    createAcademicTerm(termData: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }>;
    createTeacherAssignment(assignmentData: any): Promise<{
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
    }>;
    updateLevel(id: string, levelData: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        order: number;
    }>;
    toggleLevelStatus(id: string, body: {
        isActive: boolean;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        order: number;
    }>;
    updateClass(id: string, classData: any): Promise<{
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
    }>;
    updateSubject(id: string, subjectData: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        schoolId: string;
        code: string;
        category: string | null;
    }>;
    updateAcademicTerm(id: string, termData: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }>;
    updateTeacherAssignment(id: string, assignmentData: any): Promise<{
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
    }>;
    deleteLevel(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        order: number;
    }>;
    deleteClass(id: string): Promise<{
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
    }>;
    deleteSubject(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        schoolId: string;
        code: string;
        category: string | null;
    }>;
    deleteAcademicTerm(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }>;
    deleteTeacherAssignment(id: string): Promise<{
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
    }>;
    bulkCreateSubjects(subjects: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    bulkCreateClasses(classes: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    bulkCreateTeacherAssignments(assignments: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getSectionsByClass(classId: string): Promise<({
        teacher: ({
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
        } & {
            id: string;
            isActive: boolean;
            schoolId: string;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        }) | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        capacity: number | null;
        teacherId: string | null;
        classId: string;
    })[]>;
    getAvailableTeachers(schoolId: string): Promise<({
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
    } & {
        id: string;
        isActive: boolean;
        schoolId: string;
        userId: string;
        employeeNumber: string;
        department: string | null;
        hireDate: Date;
    })[]>;
    createSection(sectionData: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        capacity: number | null;
        teacherId: string | null;
        classId: string;
    } | null>;
    updateSection(id: string, sectionData: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        capacity: number | null;
        teacherId: string | null;
        classId: string;
    } | null>;
    deleteSection(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        capacity: number | null;
        teacherId: string | null;
        classId: string;
    }>;
}
