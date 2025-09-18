import { AcademicStructureService } from './academic-structure.service';
export declare class AcademicStructureController {
    private readonly academicStructureService;
    constructor(academicStructureService: AcademicStructureService);
    getSchoolAcademicStructure(schoolId: string): Promise<{
        config: any;
        levels: ({
            classes: {
                id: string;
                schoolId: string;
                isActive: boolean;
                name: string;
                order: number;
                levelId: string;
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
                description: string | null;
                code: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            order: number;
            levelId: string;
        })[];
        subjects: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            description: string | null;
            code: string;
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
                name: string;
                order: number;
                levelId: string;
            };
            subject: {
                id: string;
                schoolId: string;
                isActive: boolean;
                name: string;
                description: string | null;
                code: string;
            };
            teacher: {
                id: string;
                userId: string;
                schoolId: string;
                isActive: boolean;
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
        educationSystemId: any;
        selectedLevels: any;
        availableLevels: any;
    }>;
    getLevels(schoolId: string): Promise<({
        classes: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            order: number;
            levelId: string;
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
            description: string | null;
            code: string;
        }[];
    } & {
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    })[]>;
    getSubjects(schoolId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        description: string | null;
        code: string;
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
            name: string;
            order: number;
            levelId: string;
        };
        subject: {
            id: string;
            schoolId: string;
            isActive: boolean;
            name: string;
            description: string | null;
            code: string;
        };
        teacher: {
            id: string;
            userId: string;
            schoolId: string;
            isActive: boolean;
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
        name: string;
        order: number;
        levelId: string;
    }>;
    createSubject(subjectData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        description: string | null;
        code: string;
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
        name: string;
        order: number;
        levelId: string;
    }>;
    updateSubject(id: string, subjectData: any): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        description: string | null;
        code: string;
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
        name: string;
        order: number;
        levelId: string;
    }>;
    deleteSubject(id: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        description: string | null;
        code: string;
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
