"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationSystemModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const education_system_init_service_1 = require("./education-system-init.service");
const education_system_controller_1 = require("./education-system.controller");
const school_type_mapping_service_1 = require("./school-type-mapping.service");
let EducationSystemModule = class EducationSystemModule {
};
exports.EducationSystemModule = EducationSystemModule;
exports.EducationSystemModule = EducationSystemModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [education_system_init_service_1.EducationSystemInitService, school_type_mapping_service_1.SchoolTypeMappingService],
        controllers: [education_system_controller_1.EducationSystemController],
        exports: [education_system_init_service_1.EducationSystemInitService, school_type_mapping_service_1.SchoolTypeMappingService],
    })
], EducationSystemModule);
//# sourceMappingURL=education-system.module.js.map