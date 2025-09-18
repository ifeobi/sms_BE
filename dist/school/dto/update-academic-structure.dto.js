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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAcademicStructureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateAcademicStructureDto {
    selectedLevels;
    commonSubjects;
    commonGradingScales;
    commonAcademicTerms;
    customClassLevels;
    customSubjects;
    customGradingScales;
    customAcademicTerms;
    customCurriculumStructure;
    customAssessmentMethods;
}
exports.UpdateAcademicStructureDto = UpdateAcademicStructureDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected education level IDs as an array of strings',
        example: ['primary', 'jss', 'sss'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "selectedLevels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Common subjects across all levels',
        example: [
            { id: 'pe', name: 'Physical Education' },
            { id: 'art', name: 'Art and Craft' },
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "commonSubjects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Common grading scales across all levels',
        example: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "commonGradingScales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Common academic terms across all levels',
        example: ['First Term', 'Second Term', 'Third Term'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "commonAcademicTerms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom class levels per education level',
        example: [
            {
                educationLevelId: 'primary',
                classLevels: [
                    { id: 'primary1', name: 'Primary 1', ageRange: [6, 7], isGraduationLevel: false }
                ]
            }
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "customClassLevels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom subjects per education level',
        example: [
            {
                educationLevelId: 'primary',
                subjects: [
                    { id: 'math', name: 'Mathematics', category: 'core', isRequired: true }
                ]
            }
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "customSubjects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom grading scales per education level',
        example: [
            {
                educationLevelId: 'primary',
                gradingScales: [
                    { id: 'primary-grading', name: 'Primary Grading', type: 'letter', ranges: [] }
                ]
            }
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "customGradingScales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom academic terms per education level',
        example: [
            {
                educationLevelId: 'primary',
                academicTerms: [
                    { id: 'term1', name: 'First Term', startMonth: 9, endMonth: 12 }
                ]
            }
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "customAcademicTerms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom curriculum structure per education level',
        example: [
            {
                educationLevelId: 'primary',
                curriculumStructure: {
                    coreSubjects: ['math', 'english'],
                    electiveSubjects: ['art', 'music'],
                    assessmentMethods: ['exams', 'projects']
                }
            }
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "customCurriculumStructure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom assessment methods per education level',
        example: [
            {
                educationLevelId: 'primary',
                assessmentMethods: [
                    { id: 'exam', name: 'Examination', weight: 70, type: 'summative' },
                    { id: 'project', name: 'Project Work', weight: 30, type: 'formative' }
                ]
            }
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAcademicStructureDto.prototype, "customAssessmentMethods", void 0);
//# sourceMappingURL=update-academic-structure.dto.js.map