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
exports.SectionManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const section_management_service_1 = require("./section-management.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SectionManagementController = class SectionManagementController {
    sectionManagementService;
    constructor(sectionManagementService) {
        this.sectionManagementService = sectionManagementService;
    }
    getSectionTemplates() {
        return this.sectionManagementService.getSectionTemplates();
    }
    getCustomSectionPatterns(schoolId) {
        return this.sectionManagementService.getCustomSectionPatterns(schoolId);
    }
    createCustomSectionPattern(body) {
        return this.sectionManagementService.createCustomSectionPattern(body.schoolId, body.name, body.pattern, body.templateId);
    }
    getSectionsForLevel(levelId) {
        return this.sectionManagementService.getSectionsForLevel(levelId);
    }
    createSectionsFromTemplate(body) {
        return this.sectionManagementService.createSectionsFromTemplate(body.levelId, body.schoolId, body.templateId, body.baseClassName, body.capacity);
    }
    createSectionsFromCustomPattern(body) {
        return this.sectionManagementService.createSectionsFromCustomPattern(body.levelId, body.schoolId, body.customPatternId, body.baseClassName, body.capacity);
    }
    createSectionsFromPattern(body) {
        return this.sectionManagementService.createSectionsFromPattern(body.levelId, body.schoolId, body.pattern, body.baseClassName, body.capacity);
    }
    addSection(body) {
        return this.sectionManagementService.addSection(body.levelId, body.schoolId, body.sectionName, body.baseClassName, body.capacity);
    }
    updateSection(sectionId, body) {
        return this.sectionManagementService.updateSection(sectionId, body);
    }
    removeSection(sectionId) {
        return this.sectionManagementService.removeSection(sectionId);
    }
    reorderSections(levelId, body) {
        return this.sectionManagementService.reorderSections(levelId, body.sectionIds);
    }
    getSectionStatistics(levelId) {
        return this.sectionManagementService.getSectionStatistics(levelId);
    }
};
exports.SectionManagementController = SectionManagementController;
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all section templates' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Section templates retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "getSectionTemplates", null);
__decorate([
    (0, common_1.Get)('custom-patterns/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get custom section patterns for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Custom section patterns retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "getCustomSectionPatterns", null);
__decorate([
    (0, common_1.Post)('custom-patterns'),
    (0, swagger_1.ApiOperation)({ summary: 'Create custom section pattern' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Custom section pattern created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "createCustomSectionPattern", null);
__decorate([
    (0, common_1.Get)('sections/:levelId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sections for a specific level' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sections retrieved successfully' }),
    __param(0, (0, common_1.Param)('levelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "getSectionsForLevel", null);
__decorate([
    (0, common_1.Post)('sections/template'),
    (0, swagger_1.ApiOperation)({ summary: 'Create sections from template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sections created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "createSectionsFromTemplate", null);
__decorate([
    (0, common_1.Post)('sections/custom-pattern'),
    (0, swagger_1.ApiOperation)({ summary: 'Create sections from custom pattern' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sections created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "createSectionsFromCustomPattern", null);
__decorate([
    (0, common_1.Post)('sections/pattern'),
    (0, swagger_1.ApiOperation)({ summary: 'Create sections from pattern array' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sections created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "createSectionsFromPattern", null);
__decorate([
    (0, common_1.Post)('sections/add'),
    (0, swagger_1.ApiOperation)({ summary: 'Add single section to a level' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Section added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "addSection", null);
__decorate([
    (0, common_1.Put)('sections/:sectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Section updated successfully' }),
    __param(0, (0, common_1.Param)('sectionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Delete)('sections/:sectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove section' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Section removed successfully' }),
    __param(0, (0, common_1.Param)('sectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "removeSection", null);
__decorate([
    (0, common_1.Put)('sections/reorder/:levelId'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder sections' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sections reordered successfully' }),
    __param(0, (0, common_1.Param)('levelId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "reorderSections", null);
__decorate([
    (0, common_1.Get)('sections/:levelId/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get section statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Section statistics retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('levelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionManagementController.prototype, "getSectionStatistics", null);
exports.SectionManagementController = SectionManagementController = __decorate([
    (0, swagger_1.ApiTags)('Section Management'),
    (0, common_1.Controller)('section-management'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [section_management_service_1.SectionManagementService])
], SectionManagementController);
//# sourceMappingURL=section-management.controller.js.map