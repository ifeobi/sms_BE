import { BulkImportService } from './bulk-import.service';
import { BulkStudentImportDto, VerificationCodeDto, BulkImportResponseDto, BulkImportProgressDto, ParentLinkResponseDto } from './dto/bulk-student-import.dto';
export declare class BulkImportController {
    private readonly bulkImportService;
    constructor(bulkImportService: BulkImportService);
    startBulkImport(importData: BulkStudentImportDto, req: any): Promise<BulkImportResponseDto>;
    getBulkImportProgress(id: string): Promise<BulkImportProgressDto>;
    verifyParentCode(verificationData: VerificationCodeDto): Promise<ParentLinkResponseDto>;
    private calculateEstimatedTime;
}
