import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BulkStudentImportDto } from './dto/bulk-student-import.dto';
export declare class BulkImportService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    startBulkImport(schoolId: string, importedBy: string, importData: BulkStudentImportDto): Promise<{
        id: string;
        totalRecords: number;
        status: import(".prisma/client").$Enums.BulkImportStatus;
        message: string;
    }>;
    private processBulkImport;
    private processStudentRecord;
    private createOrGetParentUser;
    private createStudentUser;
    private generateStudentNumber;
    private generateVerificationCode;
    private generateStudentPassword;
    private generateParentPassword;
    private getDefaultLevelId;
    private getDefaultClassId;
    private updateBulkImportProgress;
    private updateBulkImportStatus;
    private sendStudentWelcomeEmail;
    private sendParentWelcomeEmail;
    private sendParentInvitationEmail;
    getBulkImportProgress(bulkImportId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BulkImportStatus;
        totalRecords: number;
        successfulRecords: number;
        failedRecords: number;
        progress: number;
        errorLog: any;
        createdAt: Date;
        completedAt: Date | null;
    }>;
    verifyParentCode(email: string, code: string): Promise<{
        success: boolean;
        message: string;
        parentId: string;
        studentId: string;
    }>;
}
