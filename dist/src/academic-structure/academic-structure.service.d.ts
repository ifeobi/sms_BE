import { PrismaService } from '../prisma/prisma.service';
import { EducationSystemsService } from '../education-systems/education-systems.service';
import { EducationSystem } from '../education-systems/interfaces/education-system.interface';
import { SectionManagementService } from '../section-management/section-management.service';
export declare class AcademicStructureService {
    private prisma;
    private educationSystemsService;
    private sectionManagementService;
    constructor(prisma: PrismaService, educationSystemsService: EducationSystemsService, sectionManagementService: SectionManagementService);
    getEducationSystemById(id: string): EducationSystem | null;
    generateAcademicStructureForSchool(schoolId: string, educationSystemId: string, selectedLevels: string[], availableLevels: string[], prismaClient?: any): Promise<any>;
    updateSchoolAcademicStructure(schoolId: string, selectedLevels: string[], customClassNames?: Record<string, string>, customSubjectNames?: Record<string, string>): Promise<import(".prisma/client").Prisma.BatchPayload>;
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
    getSectionTemplates(): Promise<{
        id: string;
        name: string;
        description: string;
        pattern: string[];
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCustomSectionPatterns(schoolId: string): Promise<({
        template: {
            id: string;
            name: string;
            description: string;
            pattern: string[];
            isDefault: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        name: string;
        pattern: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        templateId: string | null;
    })[]>;
    createCustomSectionPattern(schoolId: string, name: string, pattern: string[], templateId?: string): Promise<{
        id: string;
        name: string;
        pattern: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        templateId: string | null;
    }>;
    getSectionsForLevel(levelId: string): Promise<{
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
    }[]>;
    createSectionsFromTemplate(levelId: string, schoolId: string, templateId: string, baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromPattern(levelId: string, schoolId: string, pattern: string[], baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addSection(levelId: string, schoolId: string, sectionName: string, baseClassName: string, capacity?: number): Promise<{
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
    updateSection(sectionId: string, updates: {
        sectionName?: string;
        capacity?: number;
        baseClassName?: string;
    }): Promise<{
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
    removeSection(sectionId: string): Promise<{
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
    reorderSections(levelId: string, sectionIds: string[]): Promise<{
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
    }[]>;
    getSectionStatistics(levelId: string): Promise<{
        id: string;
        name: string;
        sectionName: string | null;
        capacity: number | null;
        enrolledStudents: number;
        availableSpots: number | null;
        utilizationRate: number | null;
    }[]>;
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
    toggleLevelStatus(levelId: string, isActive: boolean): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        schoolId: string;
        order: number;
    }>;
    getLevelClassCount(levelId: string, getExpectedCount?: boolean): Promise<{
        count: number;
    }>;
    private createClassesAndSubjectsForLevel;
    private removeClassesAndSubjectsForLevel;
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
    updateSectionArm(id: string, sectionData: any): Promise<{
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
}
