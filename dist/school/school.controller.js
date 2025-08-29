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
exports.SchoolController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const school_service_1 = require("./school.service");
const swagger_1 = require("@nestjs/swagger");
let SchoolController = class SchoolController {
    schoolService;
    constructor(schoolService) {
        this.schoolService = schoolService;
    }
    async getSchoolProfile(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'school_admin') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.schoolService.getSchoolProfile(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get school profile', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSchoolAdminRole(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'school_admin') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.schoolService.getSchoolAdminRole(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get school admin role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDashboardStats(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'school_admin') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.schoolService.getDashboardStats(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get dashboard stats', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRecentActivity(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'school_admin') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.schoolService.getRecentActivity(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get recent activity', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUpcomingEvents(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'school_admin') {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            return await this.schoolService.getUpcomingEvents(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get upcoming events', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SchoolController = SchoolController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get school profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'School profile retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getSchoolProfile", null);
__decorate([
    (0, common_1.Get)('admin-role'),
    (0, swagger_1.ApiOperation)({ summary: 'Get school admin role and details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'School admin role retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getSchoolAdminRole", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard stats retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent activity' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent activity retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('dashboard/events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming events' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Upcoming events retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "getUpcomingEvents", null);
exports.SchoolController = SchoolController = __decorate([
    (0, swagger_1.ApiTags)('School'),
    (0, common_1.Controller)('school'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [school_service_1.SchoolService])
], SchoolController);
//# sourceMappingURL=school.controller.js.map