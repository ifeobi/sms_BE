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
exports.ParentLinkResponseDto = exports.VerificationCodeDto = exports.BulkImportProgressDto = exports.BulkImportResponseDto = exports.BulkStudentImportDto = exports.BulkStudentDataDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class BulkStudentDataDto {
    fullName;
    sex;
    dateOfBirth;
    email;
    phone;
    parentFullName;
    parentEmail;
    parentPhone;
}
exports.BulkStudentDataDto = BulkStudentDataDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Gender),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "sex", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "parentFullName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "parentEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentDataDto.prototype, "parentPhone", void 0);
class BulkStudentImportDto {
    students;
    academicYear;
    levelId;
    classId;
}
exports.BulkStudentImportDto = BulkStudentImportDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkStudentDataDto),
    __metadata("design:type", Array)
], BulkStudentImportDto.prototype, "students", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentImportDto.prototype, "academicYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentImportDto.prototype, "levelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkStudentImportDto.prototype, "classId", void 0);
class BulkImportResponseDto {
    id;
    totalRecords;
    successfulRecords;
    failedRecords;
    status;
    errorLog;
    createdAt;
}
exports.BulkImportResponseDto = BulkImportResponseDto;
class BulkImportProgressDto {
    id;
    status;
    totalRecords;
    successfulRecords;
    failedRecords;
    progress;
    estimatedTimeRemaining;
}
exports.BulkImportProgressDto = BulkImportProgressDto;
class VerificationCodeDto {
    email;
    code;
}
exports.VerificationCodeDto = VerificationCodeDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerificationCodeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerificationCodeDto.prototype, "code", void 0);
class ParentLinkResponseDto {
    success;
    message;
    parentId;
    studentId;
}
exports.ParentLinkResponseDto = ParentLinkResponseDto;
//# sourceMappingURL=bulk-student-import.dto.js.map