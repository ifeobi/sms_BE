"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicStructureModule = void 0;
const common_1 = require("@nestjs/common");
const academic_structure_service_1 = require("./academic-structure.service");
const academic_structure_controller_1 = require("./academic-structure.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const education_systems_module_1 = require("../education-systems/education-systems.module");
const section_management_module_1 = require("../section-management/section-management.module");
let AcademicStructureModule = class AcademicStructureModule {
};
exports.AcademicStructureModule = AcademicStructureModule;
exports.AcademicStructureModule = AcademicStructureModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, education_systems_module_1.EducationSystemsModule, section_management_module_1.SectionManagementModule],
        controllers: [academic_structure_controller_1.AcademicStructureController],
        providers: [academic_structure_service_1.AcademicStructureService],
        exports: [academic_structure_service_1.AcademicStructureService],
    })
], AcademicStructureModule);
//# sourceMappingURL=academic-structure.module.js.map