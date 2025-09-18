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
exports.SchoolAcademicStructureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const school_academic_structure_service_1 = require("./school-academic-structure.service");
const update_academic_structure_dto_1 = require("./dto/update-academic-structure.dto");
let SchoolAcademicStructureController = class SchoolAcademicStructureController {
    academicStructureService;
    constructor(academicStructureService) {
        this.academicStructureService = academicStructureService;
    }
    async getAcademicStructure(req) {
        console.log('📥📥📥 GET REQUEST RECEIVED IN CONTROLLER 📥📥📥');
        console.log('User ID:', req.user?.id);
        const userId = req.user.id;
        const result = await this.academicStructureService.getAcademicStructureByUserId(userId);
        console.log('📥 GET Controller returning result with selectedLevels:', result?.selectedLevels);
        return result;
    }
    async updateAcademicStructure(req, updateDto) {
        console.log('🎯🎯🎯 PUT REQUEST RECEIVED IN CONTROLLER 🎯🎯🎯');
        console.log('Raw request body:', req.body);
        console.log('Parsed DTO:', updateDto);
        console.log('DTO selectedLevels:', updateDto?.selectedLevels);
        console.log('DTO selectedLevels type:', typeof updateDto?.selectedLevels);
        console.log('User ID:', req.user?.id);
        const userId = req.user.id;
        const result = await this.academicStructureService.updateAcademicStructure(userId, updateDto);
        console.log('🎯 Controller returning result:', result);
        return result;
    }
};
exports.SchoolAcademicStructureController = SchoolAcademicStructureController;
__decorate([
    (0, common_1.Get)('academic-structure'),
    (0, swagger_1.ApiOperation)({ summary: 'Get school academic structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Academic structure retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Academic structure not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchoolAcademicStructureController.prototype, "getAcademicStructure", null);
__decorate([
    (0, common_1.Put)('academic-structure'),
    (0, swagger_1.ApiOperation)({ summary: 'Update school academic structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Academic structure updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Academic structure not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_academic_structure_dto_1.UpdateAcademicStructureDto]),
    __metadata("design:returntype", Promise)
], SchoolAcademicStructureController.prototype, "updateAcademicStructure", null);
exports.SchoolAcademicStructureController = SchoolAcademicStructureController = __decorate([
    (0, swagger_1.ApiTags)('School Academic Structure'),
    (0, common_1.Controller)('school'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [school_academic_structure_service_1.SchoolAcademicStructureService])
], SchoolAcademicStructureController);
//# sourceMappingURL=school-academic-structure.controller.js.map