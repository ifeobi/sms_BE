"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsModule = void 0;
const common_1 = require("@nestjs/common");
const bulk_import_controller_1 = require("./bulk-import.controller");
const bulk_import_service_1 = require("./bulk-import.service");
const students_controller_1 = require("./students.controller");
const students_service_1 = require("./students.service");
const prisma_module_1 = require("../prisma/prisma.module");
const email_module_1 = require("../email/email.module");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, email_module_1.EmailModule],
        controllers: [bulk_import_controller_1.BulkImportController, students_controller_1.StudentsController],
        providers: [bulk_import_service_1.BulkImportService, students_service_1.StudentsService],
        exports: [bulk_import_service_1.BulkImportService, students_service_1.StudentsService],
    })
], StudentsModule);
//# sourceMappingURL=students.module.js.map