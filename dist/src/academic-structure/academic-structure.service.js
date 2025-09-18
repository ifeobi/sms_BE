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
exports.AcademicStructureService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const education_systems_service_1 = require("../education-systems/education-systems.service");
const section_management_service_1 = require("../section-management/section-management.service");
let AcademicStructureService = class AcademicStructureService {
    prisma;
    educationSystemsService;
    sectionManagementService;
    constructor(prisma, educationSystemsService, sectionManagementService) {
        this.prisma = prisma;
        this.educationSystemsService = educationSystemsService;
        this.sectionManagementService = sectionManagementService;
    }
    getEducationSystemById(id) {
        return this.educationSystemsService.getEducationSystemById(id);
    }
    async generateAcademicStructureForSchool(schoolId, educationSystemId, selectedLevels, availableLevels) {
        const educationSystem = this.educationSystemsService.getEducationSystemById(educationSystemId);
        if (!educationSystem) {
            throw new Error(`Education system ${educationSystemId} not found`);
        }
        const schoolConfig = await this.prisma.schoolAcademicConfig.create({
            data: {
                schoolId,
                educationSystemId,
                selectedLevels,
                availableLevels,
                customClassNames: {},
                customSubjectNames: {},
                isActive: true,
            },
        });
        for (const levelId of selectedLevels) {
            const level = educationSystem.levels.find((l) => l.id === levelId);
            if (!level)
                continue;
            const levelRecord = await this.prisma.level.create({
                data: {
                    name: level.name,
                    order: level.order,
                    schoolId,
                    isActive: true,
                },
            });
            for (const classLevel of level.classLevels) {
                const classRecord = await this.prisma.class.create({
                    data: {
                        name: classLevel.name,
                        order: classLevel.order,
                        levelId: levelRecord.id,
                        schoolId,
                        isActive: true,
                    },
                });
                for (const subjectName of classLevel.subjects) {
                    await this.prisma.subject.create({
                        data: {
                            name: subjectName,
                            code: subjectName.toUpperCase().replace(/\s+/g, '_'),
                            description: `${subjectName} for ${classLevel.name}`,
                            schoolId,
                            isActive: true,
                        },
                    });
                }
            }
        }
        return schoolConfig;
    }
    async updateSchoolAcademicStructure(schoolId, selectedLevels, customClassNames, customSubjectNames) {
        const updatedConfig = await this.prisma.schoolAcademicConfig.updateMany({
            where: { schoolId },
            data: {
                selectedLevels,
                customClassNames: customClassNames || {},
                customSubjectNames: customSubjectNames || {},
            },
        });
        await this.prisma.level.updateMany({
            where: { schoolId },
            data: { isActive: false },
        });
        const config = await this.prisma.schoolAcademicConfig.findFirst({
            where: { schoolId },
        });
        if (!config) {
            throw new Error('School academic config not found');
        }
        const educationSystem = this.educationSystemsService.getEducationSystemById(config.educationSystemId);
        if (!educationSystem) {
            throw new Error('Education system not found');
        }
        for (const levelId of selectedLevels) {
            const level = educationSystem.levels.find((l) => l.id === levelId);
            if (!level)
                continue;
            let levelRecord = await this.prisma.level.findFirst({
                where: {
                    schoolId,
                    name: level.name,
                },
            });
            if (levelRecord) {
                levelRecord = await this.prisma.level.update({
                    where: { id: levelRecord.id },
                    data: {
                        isActive: true,
                        order: level.order,
                    },
                });
            }
            else {
                levelRecord = await this.prisma.level.create({
                    data: {
                        name: level.name,
                        order: level.order,
                        schoolId,
                        isActive: true,
                    },
                });
            }
            for (const classLevel of level.classLevels) {
                const className = customClassNames?.[classLevel.id] || classLevel.name;
                let classRecord = await this.prisma.class.findFirst({
                    where: {
                        schoolId,
                        name: className,
                    },
                });
                if (classRecord) {
                    classRecord = await this.prisma.class.update({
                        where: { id: classRecord.id },
                        data: {
                            isActive: true,
                            order: classLevel.order,
                            levelId: levelRecord.id,
                        },
                    });
                }
                else {
                    classRecord = await this.prisma.class.create({
                        data: {
                            name: className,
                            order: classLevel.order,
                            levelId: levelRecord.id,
                            schoolId,
                            isActive: true,
                        },
                    });
                }
                for (const subjectName of classLevel.subjects) {
                    const customSubjectName = customSubjectNames?.[subjectName] || subjectName;
                    const existingSubject = await this.prisma.subject.findFirst({
                        where: {
                            schoolId,
                            name: customSubjectName,
                        },
                    });
                    if (existingSubject) {
                        await this.prisma.subject.update({
                            where: { id: existingSubject.id },
                            data: {
                                isActive: true,
                                description: `${customSubjectName} for ${className}`,
                            },
                        });
                    }
                    else {
                        await this.prisma.subject.create({
                            data: {
                                name: customSubjectName,
                                code: customSubjectName.toUpperCase().replace(/\s+/g, '_'),
                                description: `${customSubjectName} for ${className}`,
                                schoolId,
                                isActive: true,
                            },
                        });
                    }
                }
            }
        }
        return updatedConfig;
    }
    async getSchoolAcademicStructure(schoolId) {
        const config = await this.prisma.schoolAcademicConfig.findFirst({
            where: { schoolId },
            include: {
                school: true,
            },
        });
        if (!config) {
            throw new Error('School academic config not found');
        }
        const levels = await this.getLevels(schoolId);
        const classes = await this.getClasses(schoolId);
        const subjects = await this.getSubjects(schoolId);
        const academicTerms = await this.getAcademicTerms(schoolId);
        const teacherAssignments = await this.getTeacherAssignments({ schoolId });
        return {
            config,
            levels,
            classes,
            subjects,
            academicTerms,
            teacherAssignments,
            educationSystemId: config.educationSystemId,
            selectedLevels: config.selectedLevels,
            availableLevels: config.availableLevels,
        };
    }
    async getSectionTemplates() {
        return this.sectionManagementService.getSectionTemplates();
    }
    async getCustomSectionPatterns(schoolId) {
        return this.sectionManagementService.getCustomSectionPatterns(schoolId);
    }
    async createCustomSectionPattern(schoolId, name, pattern, templateId) {
        return this.sectionManagementService.createCustomSectionPattern(schoolId, name, pattern, templateId);
    }
    async getSectionsForLevel(levelId) {
        return this.sectionManagementService.getSectionsForLevel(levelId);
    }
    async createSectionsFromTemplate(levelId, schoolId, templateId, baseClassName, capacity) {
        return this.sectionManagementService.createSectionsFromTemplate(levelId, schoolId, templateId, baseClassName, capacity);
    }
    async createSectionsFromPattern(levelId, schoolId, pattern, baseClassName, capacity) {
        return this.sectionManagementService.createSectionsFromPattern(levelId, schoolId, pattern, baseClassName, capacity);
    }
    async addSection(levelId, schoolId, sectionName, baseClassName, capacity) {
        return this.sectionManagementService.addSection(levelId, schoolId, sectionName, baseClassName, capacity);
    }
    async updateSection(sectionId, updates) {
        return this.sectionManagementService.updateSection(sectionId, updates);
    }
    async removeSection(sectionId) {
        return this.sectionManagementService.removeSection(sectionId);
    }
    async reorderSections(levelId, sectionIds) {
        return this.sectionManagementService.reorderSections(levelId, sectionIds);
    }
    async getSectionStatistics(levelId) {
        return this.sectionManagementService.getSectionStatistics(levelId);
    }
    async getLevels(schoolId) {
        return this.prisma.level.findMany({
            where: { schoolId, isActive: true },
            orderBy: { order: 'asc' },
            include: {
                classes: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async getClasses(schoolId) {
        return this.prisma.class.findMany({
            where: { schoolId, isActive: true },
            orderBy: { order: 'asc' },
            include: {
                level: true,
                subjects: {
                    where: { isActive: true },
                },
            },
        });
    }
    async getSubjects(schoolId) {
        return this.prisma.subject.findMany({
            where: { schoolId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getAcademicTerms(schoolId) {
        return this.prisma.academicTerm.findMany({
            where: { schoolId, isActive: true },
            orderBy: { startDate: 'asc' },
        });
    }
    async getTeacherAssignments(filters) {
        const where = {};
        if (filters.schoolId)
            where.schoolId = filters.schoolId;
        if (filters.teacherId)
            where.teacherId = filters.teacherId;
        if (filters.classId)
            where.classId = filters.classId;
        if (filters.subjectId)
            where.subjectId = filters.subjectId;
        return this.prisma.teacherAssignment.findMany({
            where,
            include: {
                teacher: true,
                class: true,
                subject: true,
            },
        });
    }
    async createLevel(levelData) {
        return this.prisma.level.create({
            data: {
                ...levelData,
                isActive: true,
            },
        });
    }
    async createClass(classData) {
        return this.prisma.class.create({
            data: {
                ...classData,
                isActive: true,
            },
        });
    }
    async createSubject(subjectData) {
        return this.prisma.subject.create({
            data: {
                ...subjectData,
                isActive: true,
            },
        });
    }
    async createAcademicTerm(termData) {
        return this.prisma.academicTerm.create({
            data: {
                ...termData,
                isActive: true,
            },
        });
    }
    async createTeacherAssignment(assignmentData) {
        return this.prisma.teacherAssignment.create({
            data: assignmentData,
        });
    }
    async updateLevel(id, levelData) {
        return this.prisma.level.update({
            where: { id },
            data: levelData,
        });
    }
    async updateClass(id, classData) {
        return this.prisma.class.update({
            where: { id },
            data: classData,
        });
    }
    async updateSubject(id, subjectData) {
        return this.prisma.subject.update({
            where: { id },
            data: subjectData,
        });
    }
    async updateAcademicTerm(id, termData) {
        return this.prisma.academicTerm.update({
            where: { id },
            data: termData,
        });
    }
    async updateTeacherAssignment(id, assignmentData) {
        return this.prisma.teacherAssignment.update({
            where: { id },
            data: assignmentData,
        });
    }
    async deleteLevel(id) {
        return this.prisma.level.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async deleteClass(id) {
        return this.prisma.class.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async deleteSubject(id) {
        return this.prisma.subject.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async deleteAcademicTerm(id) {
        return this.prisma.academicTerm.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async deleteTeacherAssignment(id) {
        return this.prisma.teacherAssignment.delete({
            where: { id },
        });
    }
    async bulkCreateSubjects(subjects) {
        return this.prisma.subject.createMany({
            data: subjects.map((subject) => ({
                ...subject,
                isActive: true,
            })),
        });
    }
    async bulkCreateClasses(classes) {
        return this.prisma.class.createMany({
            data: classes.map((classItem) => ({
                ...classItem,
                isActive: true,
            })),
        });
    }
    async bulkCreateTeacherAssignments(assignments) {
        return this.prisma.teacherAssignment.createMany({
            data: assignments,
        });
    }
};
exports.AcademicStructureService = AcademicStructureService;
exports.AcademicStructureService = AcademicStructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        education_systems_service_1.EducationSystemsService,
        section_management_service_1.SectionManagementService])
], AcademicStructureService);
//# sourceMappingURL=academic-structure.service.js.map