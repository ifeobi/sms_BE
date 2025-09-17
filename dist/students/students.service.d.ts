import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getParentChildren(parentUserId: string): Promise<{
        children: {
            id: string;
            studentNumber: string;
            name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            status: import(".prisma/client").$Enums.StudentStatus;
            currentClass: string;
            currentLevel: string;
            academicYear: string;
            enrollmentDate: Date;
            school: {
                id: string;
                name: string;
            };
        }[];
        total: number;
    }>;
    getParentChildrenGrades(parentUserId: string, schoolId?: string, termId?: string, academicYear?: string): Promise<{
        students: any[];
        total: number;
    }>;
    getParentChildrenAttendance(parentUserId: string, schoolId?: string, startDate?: string, endDate?: string): Promise<{
        students: any[];
        total: number;
    }>;
    getStudentAcademicRecords(parentUserId: string, studentId: string, termId?: string, subjectId?: string): Promise<{
        student: {
            id: string;
            studentNumber: string;
            name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            status: import(".prisma/client").$Enums.StudentStatus;
            currentClass: string;
            currentLevel: string;
            academicYear: string;
            enrollmentDate: Date;
            school: {
                id: string;
                name: string;
            };
        };
        academicRecords: {
            id: string;
            subject: string;
            assignment: string | undefined;
            score: number;
            maxScore: number;
            grade: string;
            percentage: number;
            gpa: number;
            comments: string | null;
            feedback: string | null;
            gradedAt: Date;
            term: {
                id: string;
                name: string;
                academicYear: string;
            };
            teacher: {
                id: string;
                name: string;
            };
        }[];
        total: number;
        averageGpa: number;
        overallGrade: string;
    }>;
    getStudentAttendance(parentUserId: string, studentId: string, startDate?: string, endDate?: string): Promise<{
        student: {
            id: string;
            studentNumber: string;
            name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            status: import(".prisma/client").$Enums.StudentStatus;
            currentClass: string;
            currentLevel: string;
            academicYear: string;
            enrollmentDate: Date;
            school: {
                id: string;
                name: string;
            };
        };
        attendanceRecords: {
            id: string;
            date: Date;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            checkInTime: null;
            checkOutTime: null;
            notes: string | null;
            class: {
                id: string;
                name: string;
            };
            subject: null;
        }[];
        total: number;
        attendancePercentage: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
    }>;
}
