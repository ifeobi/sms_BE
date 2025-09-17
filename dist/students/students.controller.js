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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const students_service_1 = require("./students.service");
const students_response_dto_1 = require("./dto/students-response.dto");
let StudentsController = class StudentsController {
    studentsService;
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async getParentChildren(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'parent') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.studentsService.getParentChildren(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get parent children', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getParentChildrenGrades(req, schoolId, termId, academicYear) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'parent') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.studentsService.getParentChildrenGrades(userId, schoolId, termId, academicYear);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get children grades', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getParentChildrenAttendance(req, schoolId, startDate, endDate) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'parent') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.studentsService.getParentChildrenAttendance(userId, schoolId, startDate, endDate);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get children attendance', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStudentAcademicRecords(req, studentId, termId, subjectId) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'parent') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.studentsService.getStudentAcademicRecords(userId, studentId, termId, subjectId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get student academic records', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStudentAttendance(req, studentId, startDate, endDate) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'parent') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.studentsService.getStudentAttendance(userId, studentId, startDate, endDate);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get student attendance', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Get)('parent-children'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all children for a parent' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Parent children retrieved successfully',
        type: students_response_dto_1.ParentChildrenResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - not a parent' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getParentChildren", null);
__decorate([
    (0, common_1.Get)('parent-children/grades'),
    (0, swagger_1.ApiOperation)({ summary: 'Get grades for all parent children' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Children grades retrieved successfully',
        type: students_response_dto_1.StudentGradesResponseDto,
    }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Filter by term ID' }),
    (0, swagger_1.ApiQuery)({ name: 'academicYear', required: false, description: 'Filter by academic year' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('termId')),
    __param(3, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getParentChildrenGrades", null);
__decorate([
    (0, common_1.Get)('parent-children/attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance for all parent children' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Children attendance retrieved successfully',
        type: students_response_dto_1.StudentAttendanceResponseDto,
    }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getParentChildrenAttendance", null);
__decorate([
    (0, common_1.Get)(':id/academic-records'),
    (0, swagger_1.ApiOperation)({ summary: 'Get academic records for a specific child' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student academic records retrieved successfully',
        type: students_response_dto_1.StudentAcademicRecordsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - not authorized to view this student' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Filter by term ID' }),
    (0, swagger_1.ApiQuery)({ name: 'subjectId', required: false, description: 'Filter by subject ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('termId')),
    __param(3, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getStudentAcademicRecords", null);
__decorate([
    (0, common_1.Get)(':id/attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance records for a specific child' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student attendance retrieved successfully',
        type: students_response_dto_1.StudentAttendanceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied - not authorized to view this student' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getStudentAttendance", null);
exports.StudentsController = StudentsController = __decorate([
    (0, swagger_1.ApiTags)('Students'),
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map