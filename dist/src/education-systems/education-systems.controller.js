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
exports.EducationSystemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const education_systems_service_1 = require("./education-systems.service");
let EducationSystemsController = class EducationSystemsController {
    educationSystemsService;
    constructor(educationSystemsService) {
        this.educationSystemsService = educationSystemsService;
    }
    getAllEducationSystems() {
        return this.educationSystemsService.getAllEducationSystems();
    }
    getAvailableCountries() {
        return this.educationSystemsService.getAvailableCountries();
    }
    getSchoolLevelDisplayNames(countryCode) {
        return this.educationSystemsService.getSchoolLevelDisplayNames(countryCode);
    }
    getEducationSystemById(id) {
        return this.educationSystemsService.getEducationSystemById(id);
    }
};
exports.EducationSystemsController = EducationSystemsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all education systems' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Education systems retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], EducationSystemsController.prototype, "getAllEducationSystems", null);
__decorate([
    (0, common_1.Get)('countries'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available countries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Countries retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EducationSystemsController.prototype, "getAvailableCountries", null);
__decorate([
    (0, common_1.Get)('countries/:countryCode/levels'),
    (0, swagger_1.ApiOperation)({ summary: 'Get school levels for a country' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'School levels retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EducationSystemsController.prototype, "getSchoolLevelDisplayNames", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get education system by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Education system retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Education system not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], EducationSystemsController.prototype, "getEducationSystemById", null);
exports.EducationSystemsController = EducationSystemsController = __decorate([
    (0, swagger_1.ApiTags)('Education Systems'),
    (0, common_1.Controller)('education-systems'),
    __metadata("design:paramtypes", [education_systems_service_1.EducationSystemsService])
], EducationSystemsController);
//# sourceMappingURL=education-systems.controller.js.map