import { AcademicStructureService } from './academic-structure.service';
export declare class AcademicStructureController {
    private readonly academicStructureService;
    constructor(academicStructureService: AcademicStructureService);
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
