"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportController = void 0;
const common_1 = require("@nestjs/common");
const bulk_import_service_1 = require("./bulk-import.service");
const bulk_student_import_dto_1 = require("./dto/bulk-student-import.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let BulkImportController = class BulkImportController {
    bulkImportService;
    constructor(bulkImportService) {
        this.bulkImportService = bulkImportService;
    }
    async startBulkImport(importData, req) {
        try {
            const schoolId = req.user.schoolId;
            if (!schoolId) {
                throw new common_1.HttpException('School ID not found in user context', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.bulkImportService.startBulkImport(schoolId, req.user.id, importData);
            return {
                id: result.id,
                totalRecords: result.totalRecords,
                successfulRecords: 0,
                failedRecords: 0,
                status: result.status,
                createdAt: new Date(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to start bulk import', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBulkImportProgress(id) {
        try {
            const progress = await this.bulkImportService.getBulkImportProgress(id);
            return {
                id: progress.id,
                status: progress.status,
                totalRecords: progress.totalRecords,
                successfulRecords: progress.successfulRecords,
                failedRecords: progress.failedRecords,
                progress: progress.progress,
                estimatedTimeRemaining: this.calculateEstimatedTime(progress),
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get bulk import progress', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyParentCode(verificationData) {
        try {
            const result = await this.bulkImportService.verifyParentCode(verificationData.email, verificationData.code);
            return {
                success: result.success,
                message: result.message,
                parentId: result.parentId,
                studentId: result.studentId,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Verification failed',
            };
        }
    }
    calculateEstimatedTime(progress) {
        if (progress.status !== 'PROCESSING' || progress.progress === 0) {
            return undefined;
        }
        const elapsedTime = Date.now() - new Date(progress.createdAt).getTime();
        const recordsProcessed = progress.successfulRecords + progress.failedRecords;
        if (recordsProcessed === 0) {
            return undefined;
        }
        const timePerRecord = elapsedTime / recordsProcessed;
        const remainingRecords = progress.totalRecords - recordsProcessed;
        const estimatedTimeRemaining = timePerRecord * remainingRecords;
        return Math.round(estimatedTimeRemaining / 1000);
    }
};
exports.BulkImportController = BulkImportController;
__decorate([
    (0, common_1.Post)('students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start bulk student import' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bulk import started successfully',
        type: bulk_student_import_dto_1.BulkImportResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_student_import_dto_1.BulkStudentImportDto, Object]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "startBulkImport", null);
__decorate([
    (0, common_1.Get)('progress/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get bulk import progress' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk import progress retrieved successfully',
        type: bulk_student_import_dto_1.BulkImportProgressDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bulk import not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "getBulkImportProgress", null);
__decorate([
    (0, common_1.Post)('verify-parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify parent-child relationship code' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Parent verification successful',
        type: bulk_student_import_dto_1.ParentLinkResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid verification code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_student_import_dto_1.VerificationCodeDto]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "verifyParentCode", null);
exports.BulkImportController = BulkImportController = __decorate([
    (0, swagger_1.ApiTags)('Bulk Student Import'),
    (0, common_1.Controller)('bulk-import'),
    __metadata("design:paramtypes", [bulk_import_service_1.BulkImportService])
], BulkImportController);
//# sourceMappingURL=bulk-import.controller.js.map