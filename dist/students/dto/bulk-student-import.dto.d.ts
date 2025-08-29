import { Gender } from '@prisma/client';
export declare class BulkStudentDataDto {
    fullName: string;
    sex: Gender;
    dateOfBirth: string;
    email: string;
    phone: string;
    parentFullName: string;
    parentEmail: string;
    parentPhone: string;
}
export declare class BulkStudentImportDto {
    students: BulkStudentDataDto[];
    academicYear?: string;
    levelId?: string;
    classId?: string;
}
export declare class BulkImportResponseDto {
    id: string;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    status: string;
    errorLog?: any;
    createdAt: Date;
}
export declare class BulkImportProgressDto {
    id: string;
    status: string;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    progress: number;
    estimatedTimeRemaining?: number;
}
export declare class VerificationCodeDto {
    email: string;
    code: string;
}
export declare class ParentLinkResponseDto {
    success: boolean;
    message: string;
    parentId?: string;
    studentId?: string;
}
