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
exports.UserSettingsResponseDto = exports.UpdateUserSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateUserSettingsDto {
    emailNotifications;
    pushNotifications;
    smsNotifications;
    showEmail;
    showPhone;
    profileVisibility;
    language;
    timezone;
    dateFormat;
}
exports.UpdateUserSettingsDto = UpdateUserSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable email notifications', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable push notifications', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "pushNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable SMS notifications', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "smsNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Show email address in profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "showEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Show phone number in profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserSettingsDto.prototype, "showPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile visibility level', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "profileVisibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User language preference', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User timezone', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date format preference', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserSettingsDto.prototype, "dateFormat", void 0);
class UserSettingsResponseDto {
    id;
    userId;
    emailNotifications;
    pushNotifications;
    smsNotifications;
    showEmail;
    showPhone;
    profileVisibility;
    language;
    timezone;
    dateFormat;
    createdAt;
    updatedAt;
}
exports.UserSettingsResponseDto = UserSettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSettingsResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSettingsResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSettingsResponseDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSettingsResponseDto.prototype, "pushNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSettingsResponseDto.prototype, "smsNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSettingsResponseDto.prototype, "showEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSettingsResponseDto.prototype, "showPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSettingsResponseDto.prototype, "profileVisibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSettingsResponseDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSettingsResponseDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSettingsResponseDto.prototype, "dateFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserSettingsResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserSettingsResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-settings.dto.js.map