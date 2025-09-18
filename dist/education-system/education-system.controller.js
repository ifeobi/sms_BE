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
exports.EducationSystemController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const education_system_init_service_1 = require("./education-system-init.service");
let EducationSystemController = class EducationSystemController {
    educationSystemInitService;
    constructor(educationSystemInitService) {
        this.educationSystemInitService = educationSystemInitService;
    }
    async getAvailableCountries() {
        return await this.educationSystemInitService.getAvailableCountries();
    }
    async getAllEducationSystems() {
        return await this.educationSystemInitService.getAllEducationSystems();
    }
    async getEducationSystemByCountry(countryCode) {
        return await this.educationSystemInitService.getEducationSystemByCountry(countryCode);
    }
    async initializeEducationSystems() {
        await this.educationSystemInitService.initializeEducationSystems();
        return { message: 'Education systems initialized successfully' };
    }
    async resetEducationSystems() {
        await this.educationSystemInitService.resetEducationSystems();
        return { message: 'Education systems reset and reinitialized successfully' };
    }
    async getSchoolAcademicStructure(schoolId) {
        return await this.educationSystemInitService.getSchoolAcademicStructure(schoolId);
    }
    async createSchoolAcademicStructure(schoolId, body) {
        return await this.educationSystemInitService.createSchoolAcademicStructure(schoolId, body.templateId, body.selectedLevels);
    }
    async updateSchoolAcademicStructure(schoolId, body) {
        return await this.educationSystemInitService.updateSchoolAcademicStructure(schoolId, body.templateId, body.selectedLevels);
    }
};
exports.EducationSystemController = EducationSystemController;
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "getAvailableCountries", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "getAllEducationSystems", null);
__decorate([
    (0, common_1.Get)(':countryCode'),
    __param(0, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "getEducationSystemByCountry", null);
__decorate([
    (0, common_1.Post)('initialize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "initializeEducationSystems", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "resetEducationSystems", null);
__decorate([
    (0, common_1.Get)('school/:schoolId/academic-structure'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "getSchoolAcademicStructure", null);
__decorate([
    (0, common_1.Post)('school/:schoolId/academic-structure'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "createSchoolAcademicStructure", null);
__decorate([
    (0, common_1.Put)('school/:schoolId/academic-structure'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EducationSystemController.prototype, "updateSchoolAcademicStructure", null);
exports.EducationSystemController = EducationSystemController = __decorate([
    (0, common_1.Controller)('education-systems'),
    __metadata("design:paramtypes", [education_system_init_service_1.EducationSystemInitService])
], EducationSystemController);
//# sourceMappingURL=education-system.controller.js.map