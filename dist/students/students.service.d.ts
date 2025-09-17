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
            email: any;
            phone: any;
            avatar: any;
            status: import(".prisma/client").$Enums.StudentStatus;
            currentClass: any;
            currentLevel: any;
            academicYear: string;
            enrollmentDate: Date;
            school: any;
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
            id: any;
            studentNumber: any;
            name: string;
            email: any;
            phone: any;
            avatar: any;
            status: any;
            currentClass: any;
            currentLevel: any;
            academicYear: any;
            enrollmentDate: any;
            school: any;
        };
        academicRecords: {
            id: string;
            subject: any;
            assignment: any;
            score: number;
            maxScore: number;
            grade: string;
            percentage: number;
            gpa: number;
            comments: string | null;
            feedback: string | null;
            gradedAt: Date;
            term: any;
            teacher: {
                id: any;
                name: string;
            };
        }[];
        total: number;
        averageGpa: number;
        overallGrade: string;
    }>;
    getStudentAttendance(parentUserId: string, studentId: string, startDate?: string, endDate?: string): Promise<{
        student: {
            id: any;
            studentNumber: any;
            name: string;
            email: any;
            phone: any;
            avatar: any;
            status: any;
            currentClass: any;
            currentLevel: any;
            academicYear: any;
            enrollmentDate: any;
            school: any;
        };
        attendanceRecords: {
            id: string;
            date: Date;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            checkInTime: any;
            checkOutTime: any;
            notes: any;
            class: any;
            subject: any;
        }[];
        total: number;
        attendancePercentage: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
    }>;
}
