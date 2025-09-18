"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolAcademicStructureModule = void 0;
const common_1 = require("@nestjs/common");
const school_academic_structure_controller_1 = require("./school-academic-structure.controller");
const school_academic_structure_service_1 = require("./school-academic-structure.service");
const prisma_module_1 = require("../prisma/prisma.module");
let SchoolAcademicStructureModule = class SchoolAcademicStructureModule {
};
exports.SchoolAcademicStructureModule = SchoolAcademicStructureModule;
exports.SchoolAcademicStructureModule = SchoolAcademicStructureModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [school_academic_structure_controller_1.SchoolAcademicStructureController],
        providers: [school_academic_structure_service_1.SchoolAcademicStructureService],
        exports: [school_academic_structure_service_1.SchoolAcademicStructureService],
    })
], SchoolAcademicStructureModule);
//# sourceMappingURL=school-academic-structure.module.js.map