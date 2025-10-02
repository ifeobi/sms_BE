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
exports.SchoolAdminRegisterDto = exports.AddressDto = exports.SchoolType = exports.Gender = exports.UserType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var UserType;
(function (UserType) {
    UserType["PARENT"] = "PARENT";
    UserType["STUDENT"] = "STUDENT";
    UserType["SCHOOL_ADMIN"] = "SCHOOL_ADMIN";
    UserType["TEACHER"] = "TEACHER";
    UserType["CREATOR"] = "CREATOR";
})(UserType || (exports.UserType = UserType = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
var SchoolType;
(function (SchoolType) {
    SchoolType["ELEMENTARY"] = "ELEMENTARY";
    SchoolType["SECONDARY"] = "SECONDARY";
    SchoolType["TERTIARY"] = "TERTIARY";
})(SchoolType || (exports.SchoolType = SchoolType = {}));
class AddressDto {
    street;
    city;
    state;
    postalCode;
    landmark;
    formattedAddress;
    latitude;
    longitude;
}
exports.AddressDto = AddressDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: '123 Main Street' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "street", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'Lagos' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'Lagos State' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "state", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: '100001', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'Near Central Bank', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "landmark", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], AddressDto.prototype, "formattedAddress", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "longitude", void 0);
class SchoolAdminRegisterDto {
    email;
    password;
    firstName;
    lastName;
    gender;
    role;
    userType;
    schoolName;
    phone;
    website;
    country;
    schoolTypes;
    addresses;
    profilePicture;
    confirmPassword;
}
exports.SchoolAdminRegisterDto = SchoolAdminRegisterDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ enum: Gender, example: Gender.MALE }),
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "gender", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        example: 'principal',
        description: 'Role in school: principal, vice_principal, admin, etc.',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "role", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ enum: UserType, example: UserType.SCHOOL_ADMIN }),
    (0, class_validator_1.IsEnum)(UserType),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "userType", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'Academeka International School' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: '+2348012345678' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "phone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'https://academeka.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "website", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ example: 'NG', description: 'Country code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "country", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: ['ELEMENTARY', 'SECONDARY'],
        description: 'Array of school types',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SchoolAdminRegisterDto.prototype, "schoolTypes", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        type: [AddressDto],
        description: 'Array of school addresses',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", Array)
], SchoolAdminRegisterDto.prototype, "addresses", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "profilePicture", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], SchoolAdminRegisterDto.prototype, "confirmPassword", void 0);
//# sourceMappingURL=school-admin-register.dto.js.map