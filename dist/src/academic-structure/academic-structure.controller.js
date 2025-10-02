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
exports.AcademicStructureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const academic_structure_service_1 = require("./academic-structure.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AcademicStructureController = class AcademicStructureController {
    academicStructureService;
    constructor(academicStructureService) {
        this.academicStructureService = academicStructureService;
    }
    async getSchoolAcademicStructure(schoolId) {
        return this.academicStructureService.getSchoolAcademicStructure(schoolId);
    }
    async getLevels(schoolId) {
        return this.academicStructureService.getLevels(schoolId);
    }
    async getClasses(schoolId) {
        return this.academicStructureService.getClasses(schoolId);
    }
    async getSubjects(schoolId) {
        return this.academicStructureService.getSubjects(schoolId);
    }
    async getAcademicTerms(schoolId) {
        return this.academicStructureService.getAcademicTerms(schoolId);
    }
    async getTeacherAssignments(filters) {
        return this.academicStructureService.getTeacherAssignments(filters);
    }
    async createLevel(levelData) {
        return this.academicStructureService.createLevel(levelData);
    }
    async createClass(classData) {
        return this.academicStructureService.createClass(classData);
    }
    async createSubject(subjectData) {
        return this.academicStructureService.createSubject(subjectData);
    }
    async createAcademicTerm(termData) {
        return this.academicStructureService.createAcademicTerm(termData);
    }
    async createTeacherAssignment(assignmentData) {
        return this.academicStructureService.createTeacherAssignment(assignmentData);
    }
    async updateLevel(id, levelData) {
        return this.academicStructureService.updateLevel(id, levelData);
    }
    async toggleLevelStatus(id, body) {
        return this.academicStructureService.toggleLevelStatus(id, body.isActive);
    }
    async updateClass(id, classData) {
        return this.academicStructureService.updateClass(id, classData);
    }
    async updateSubject(id, subjectData) {
        return this.academicStructureService.updateSubject(id, subjectData);
    }
    async updateAcademicTerm(id, termData) {
        return this.academicStructureService.updateAcademicTerm(id, termData);
    }
    async updateTeacherAssignment(id, assignmentData) {
        return this.academicStructureService.updateTeacherAssignment(id, assignmentData);
    }
    async deleteLevel(id) {
        return this.academicStructureService.deleteLevel(id);
    }
    async deleteClass(id) {
        return this.academicStructureService.deleteClass(id);
    }
    async deleteSubject(id) {
        return this.academicStructureService.deleteSubject(id);
    }
    async deleteAcademicTerm(id) {
        return this.academicStructureService.deleteAcademicTerm(id);
    }
    async deleteTeacherAssignment(id) {
        return this.academicStructureService.deleteTeacherAssignment(id);
    }
    async bulkCreateSubjects(subjects) {
        return this.academicStructureService.bulkCreateSubjects(subjects);
    }
    async bulkCreateClasses(classes) {
        return this.academicStructureService.bulkCreateClasses(classes);
    }
    async bulkCreateTeacherAssignments(assignments) {
        return this.academicStructureService.bulkCreateTeacherAssignments(assignments);
    }
    async getSectionsByClass(classId) {
        return this.academicStructureService.getSectionsByClass(classId);
    }
    async getAvailableTeachers(schoolId) {
        return this.academicStructureService.getAvailableTeachers(schoolId);
    }
    async createSection(sectionData) {
        return this.academicStructureService.createSection(sectionData);
    }
    async updateSection(id, sectionData) {
        return this.academicStructureService.updateSectionArm(id, sectionData);
    }
    async deleteSection(id) {
        return this.academicStructureService.deleteSection(id);
    }
};
exports.AcademicStructureController = AcademicStructureController;
__decorate([
    (0, common_1.Get)('school/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complete academic structure for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic structure retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getSchoolAcademicStructure", null);
__decorate([
    (0, common_1.Get)('levels/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all levels for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Levels retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getLevels", null);
__decorate([
    (0, common_1.Get)('classes/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all classes for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Classes retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('subjects/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subjects for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subjects retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('terms/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all academic terms for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic terms retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getAcademicTerms", null);
__decorate([
    (0, common_1.Get)('teacher-assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get teacher assignments with filters' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher assignments retrieved successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getTeacherAssignments", null);
__decorate([
    (0, common_1.Post)('levels'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new level' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Level created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "createLevel", null);
__decorate([
    (0, common_1.Post)('classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new class' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Class created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "createClass", null);
__decorate([
    (0, common_1.Post)('subjects'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subject' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Subject created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Post)('terms'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new academic term' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Academic term created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "createAcademicTerm", null);
__decorate([
    (0, common_1.Post)('teacher-assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new teacher assignment' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Teacher assignment created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "createTeacherAssignment", null);
__decorate([
    (0, common_1.Put)('levels/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a level' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Level updated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "updateLevel", null);
__decorate([
    (0, common_1.Put)('levels/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle level active status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Level status toggled successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "toggleLevelStatus", null);
__decorate([
    (0, common_1.Put)('classes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a class' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class updated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "updateClass", null);
__decorate([
    (0, common_1.Put)('subjects/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subject' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subject updated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "updateSubject", null);
__decorate([
    (0, common_1.Put)('terms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an academic term' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic term updated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "updateAcademicTerm", null);
__decorate([
    (0, common_1.Put)('teacher-assignments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a teacher assignment' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher assignment updated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "updateTeacherAssignment", null);
__decorate([
    (0, common_1.Delete)('levels/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a level' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Level deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "deleteLevel", null);
__decorate([
    (0, common_1.Delete)('classes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a class' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Class deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "deleteClass", null);
__decorate([
    (0, common_1.Delete)('subjects/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subject' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subject deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "deleteSubject", null);
__decorate([
    (0, common_1.Delete)('terms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an academic term' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic term deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "deleteAcademicTerm", null);
__decorate([
    (0, common_1.Delete)('teacher-assignments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a teacher assignment' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher assignment deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "deleteTeacherAssignment", null);
__decorate([
    (0, common_1.Post)('bulk/subjects'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple subjects' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Subjects created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "bulkCreateSubjects", null);
__decorate([
    (0, common_1.Post)('bulk/classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple classes' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Classes created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "bulkCreateClasses", null);
__decorate([
    (0, common_1.Post)('bulk/teacher-assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple teacher assignments' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Teacher assignments created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "bulkCreateTeacherAssignments", null);
__decorate([
    (0, common_1.Get)('sections/class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sections for a class' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sections retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getSectionsByClass", null);
__decorate([
    (0, common_1.Get)('teachers/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available teachers for a school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teachers retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "getAvailableTeachers", null);
__decorate([
    (0, common_1.Post)('sections'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new section/arm' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Section created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "createSection", null);
__decorate([
    (0, common_1.Put)('sections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a section/arm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Section updated successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a section/arm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Section deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicStructureController.prototype, "deleteSection", null);
exports.AcademicStructureController = AcademicStructureController = __decorate([
    (0, swagger_1.ApiTags)('Academic Structure'),
    (0, common_1.Controller)('academic-structure'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [academic_structure_service_1.AcademicStructureService])
], AcademicStructureController);
//# sourceMappingURL=academic-structure.controller.js.map