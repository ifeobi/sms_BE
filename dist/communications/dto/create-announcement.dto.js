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
exports.CreateAnnouncementDto = exports.MessagePriority = exports.AnnouncementAudience = exports.AnnouncementType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var AnnouncementType;
(function (AnnouncementType) {
    AnnouncementType["GENERAL"] = "GENERAL";
    AnnouncementType["ACADEMIC"] = "ACADEMIC";
    AnnouncementType["FINANCIAL"] = "FINANCIAL";
    AnnouncementType["EMERGENCY"] = "EMERGENCY";
    AnnouncementType["EVENT"] = "EVENT";
})(AnnouncementType || (exports.AnnouncementType = AnnouncementType = {}));
var AnnouncementAudience;
(function (AnnouncementAudience) {
    AnnouncementAudience["ALL_PARENTS"] = "ALL_PARENTS";
    AnnouncementAudience["ALL_STUDENTS"] = "ALL_STUDENTS";
    AnnouncementAudience["ALL_TEACHERS"] = "ALL_TEACHERS";
    AnnouncementAudience["SPECIFIC_CLASS"] = "SPECIFIC_CLASS";
    AnnouncementAudience["SPECIFIC_STUDENTS"] = "SPECIFIC_STUDENTS";
    AnnouncementAudience["SCHOOL_WIDE"] = "SCHOOL_WIDE";
})(AnnouncementAudience || (exports.AnnouncementAudience = AnnouncementAudience = {}));
var MessagePriority;
(function (MessagePriority) {
    MessagePriority["LOW"] = "LOW";
    MessagePriority["NORMAL"] = "NORMAL";
    MessagePriority["HIGH"] = "HIGH";
    MessagePriority["URGENT"] = "URGENT";
})(MessagePriority || (exports.MessagePriority = MessagePriority = {}));
class CreateAnnouncementDto {
    title;
    content;
    type = AnnouncementType.GENERAL;
    priority = MessagePriority.NORMAL;
    targetAudience = AnnouncementAudience.ALL_PARENTS;
    targetClassIds;
    targetStudentIds;
    scheduledAt;
    expiresAt;
    attachments;
    metadata;
}
exports.CreateAnnouncementDto = CreateAnnouncementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Announcement type',
        enum: AnnouncementType,
        default: AnnouncementType.GENERAL
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AnnouncementType),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Message priority',
        enum: MessagePriority,
        default: MessagePriority.NORMAL
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MessagePriority),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target audience',
        enum: AnnouncementAudience,
        default: AnnouncementAudience.ALL_PARENTS
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AnnouncementAudience),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target class IDs for specific class announcements' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAnnouncementDto.prototype, "targetClassIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target student IDs for specific student announcements' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAnnouncementDto.prototype, "targetStudentIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schedule announcement for later' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Announcement expiration date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File attachments' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAnnouncementDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAnnouncementDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-announcement.dto.js.map