export declare class StudentDto {
    id: string;
    studentNumber: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: string;
    currentClass: string;
    currentLevel: string;
    academicYear: string;
    enrollmentDate: Date;
    school: {
        id: string;
        name: string;
        address?: string;
    };
}
export declare class AcademicRecordDto {
    id: string;
    subject: string;
    assignment?: string;
    score: number;
    maxScore: number;
    grade: string;
    percentage: number;
    gpa: number;
    comments?: string;
    feedback?: string;
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
}
export declare class AttendanceRecordDto {
    id: string;
    date: Date;
    status: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;
    class: {
        id: string;
        name: string;
    };
    subject?: {
        id: string;
        name: string;
    };
}
export declare class ParentChildrenResponseDto {
    children: StudentDto[];
    total: number;
}
export declare class StudentAcademicRecordsResponseDto {
    student: StudentDto;
    academicRecords: AcademicRecordDto[];
    total: number;
    averageGpa: number;
    overallGrade: string;
}
export declare class StudentAttendanceResponseDto {
    student: StudentDto;
    attendanceRecords: AttendanceRecordDto[];
    total: number;
    attendancePercentage: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
}
export declare class StudentGradesResponseDto {
    students: StudentAcademicRecordsResponseDto[];
    total: number;
}
