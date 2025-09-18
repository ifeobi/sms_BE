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
    generateAcademicStructureForSchool(schoolId: string, educationSystemId: string, selectedLevels: string[], availableLevels: string[]): Promise<{
        id: string;
        schoolId: string;
        educationSystemId: string;
        selectedLevels: string[];
        availableLevels: string[];
        customClassNames: import("@prisma/client/runtime/library").JsonValue | null;
        customSubjectNames: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSchoolAcademicStructure(schoolId: string, selectedLevels: string[], customClassNames?: Record<string, string>, customSubjectNames?: Record<string, string>): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getSchoolAcademicStructure(schoolId: string): Promise<{
        config: {
            school: {
                id: string;
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
            schoolId: string;
            educationSystemId: string;
            selectedLevels: string[];
            availableLevels: string[];
            customClassNames: import("@prisma/client/runtime/library").JsonValue | null;
            customSubjectNames: import("@prisma/client/runtime/library").JsonValue | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        levels: ({
            classes: {
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                order: number;
                levelId: string;
                sectionName: string | null;
                sectionOrder: number | null;
                capacity: number | null;
                templateUsed: string | null;
            }[];
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            order: number;
        })[];
        classes: ({
            level: {
                id: string;
                schoolId: string;
                isActive: boolean;
                name: string;
                order: number;
            };
            subjects: {
                id: string;
                schoolId: string;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
            }[];
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            order: number;
            levelId: string;
            sectionName: string | null;
            sectionOrder: number | null;
            capacity: number | null;
            templateUsed: string | null;
        })[];
        subjects: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            code: string;
            description: string | null;
        }[];
        academicTerms: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            startDate: Date;
            endDate: Date;
            academicYear: string;
        }[];
        teacherAssignments: ({
            class: {
                id: string;
                schoolId: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                order: number;
                levelId: string;
                sectionName: string | null;
                sectionOrder: number | null;
                capacity: number | null;
                templateUsed: string | null;
            };
            subject: {
                id: string;
                schoolId: string;
                isActive: boolean;
                name: string;
                code: string;
                description: string | null;
            };
            teacher: {
                id: string;
                schoolId: string;
                isActive: boolean;
                userId: string;
                employeeNumber: string;
                department: string | null;
                hireDate: Date;
            };
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        pattern: string[];
        isDefault: boolean;
    }[]>;
    getCustomSectionPatterns(schoolId: string): Promise<({
        template: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            pattern: string[];
            isDefault: boolean;
        } | null;
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        pattern: string[];
        templateId: string | null;
    })[]>;
    createCustomSectionPattern(schoolId: string, name: string, pattern: string[], templateId?: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        pattern: string[];
        templateId: string | null;
    }>;
    getSectionsForLevel(levelId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }[]>;
    createSectionsFromTemplate(levelId: string, schoolId: string, templateId: string, baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromPattern(levelId: string, schoolId: string, pattern: string[], baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addSection(levelId: string, schoolId: string, sectionName: string, baseClassName: string, capacity?: number): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }>;
    updateSection(sectionId: string, updates: {
        sectionName?: string;
        capacity?: number;
        baseClassName?: string;
    }): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }>;
    removeSection(sectionId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }>;
    reorderSections(levelId: string, sectionIds: string[]): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
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
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            order: number;
            levelId: string;
            sectionName: string | null;
            sectionOrder: number | null;
            capacity: number | null;
            templateUsed: string | null;
        }[];
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
    })[]>;
    getClasses(schoolId: string): Promise<({
        level: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            order: number;
        };
        subjects: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            code: string;
            description: string | null;
        }[];
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    })[]>;
    getSubjects(schoolId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
    }[]>;
    getAcademicTerms(schoolId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }[]>;
    getTeacherAssignments(filters: any): Promise<({
        class: {
            id: string;
            schoolId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            order: number;
            levelId: string;
            sectionName: string | null;
            sectionOrder: number | null;
            capacity: number | null;
            templateUsed: string | null;
        };
        subject: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            code: string;
            description: string | null;
        };
        teacher: {
            id: string;
            schoolId: string;
            isActive: boolean;
            userId: string;
            employeeNumber: string;
            department: string | null;
            hireDate: Date;
        };
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        academicYear: string;
        teacherId: string;
        classId: string;
        subjectId: string;
        isFormTeacher: boolean;
    })[]>;
    createLevel(levelData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
    }>;
    createClass(classData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }>;
    createSubject(subjectData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
    }>;
    createAcademicTerm(termData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }>;
    createTeacherAssignment(assignmentData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        academicYear: string;
        teacherId: string;
        classId: string;
        subjectId: string;
        isFormTeacher: boolean;
    }>;
    updateLevel(id: string, levelData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
    }>;
    updateClass(id: string, classData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }>;
    updateSubject(id: string, subjectData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
    }>;
    updateAcademicTerm(id: string, termData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }>;
    updateTeacherAssignment(id: string, assignmentData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        academicYear: string;
        teacherId: string;
        classId: string;
        subjectId: string;
        isFormTeacher: boolean;
    }>;
    deleteLevel(id: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
    }>;
    deleteClass(id: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
    }>;
    deleteSubject(id: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        code: string;
        description: string | null;
    }>;
    deleteAcademicTerm(id: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        startDate: Date;
        endDate: Date;
        academicYear: string;
    }>;
    deleteTeacherAssignment(id: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        academicYear: string;
        teacherId: string;
        classId: string;
        subjectId: string;
        isFormTeacher: boolean;
    }>;
    bulkCreateSubjects(subjects: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    bulkCreateClasses(classes: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    bulkCreateTeacherAssignments(assignments: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
