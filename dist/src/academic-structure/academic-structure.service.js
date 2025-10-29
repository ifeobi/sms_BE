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
    async generateAcademicStructureForSchool(schoolId, educationSystemId, selectedLevels, availableLevels, prismaClient) {
        const educationSystem = this.educationSystemsService.getEducationSystemById(educationSystemId);
        if (!educationSystem) {
            throw new Error(`Education system ${educationSystemId} not found`);
        }
        const prisma = prismaClient || this.prisma;
        const schoolConfig = await prisma.schoolAcademicConfig.create({
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
        const allLevels = educationSystem.levels.map(level => level.id);
        for (const levelId of allLevels) {
            const level = educationSystem.levels.find((l) => l.id === levelId);
            if (!level)
                continue;
            const isActive = selectedLevels.includes(levelId);
            const levelRecord = await prisma.level.create({
                data: {
                    name: level.name,
                    order: level.order,
                    schoolId,
                    isActive,
                },
            });
            if (isActive) {
                const createdClasses = [];
                for (const classLevel of level.classLevels) {
                    const classRecord = await prisma.class.create({
                        data: {
                            name: classLevel.name,
                            order: classLevel.order,
                            levelId: levelRecord.id,
                            schoolId,
                            isActive: true,
                        },
                    });
                    createdClasses.push(classRecord);
                }
                for (const subjectName of level.subjects) {
                    const subject = await prisma.subject.create({
                        data: {
                            name: subjectName,
                            code: subjectName.toUpperCase().replace(/\s+/g, '_'),
                            description: `${subjectName} for ${level.name}`,
                            category: subjectName,
                            schoolId,
                            isActive: true,
                        },
                    });
                    for (const classRecord of createdClasses) {
                        await prisma.class.update({
                            where: { id: classRecord.id },
                            data: {
                                subjects: {
                                    connect: { id: subject.id }
                                }
                            }
                        });
                    }
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
            where: { schoolId },
            orderBy: { order: 'asc' },
            include: {
                classes: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async toggleLevelStatus(levelId, isActive) {
        const level = await this.prisma.level.findUnique({
            where: { id: levelId },
            include: { school: true },
        });
        if (!level) {
            throw new Error('Level not found');
        }
        const updatedLevel = await this.prisma.level.update({
            where: { id: levelId },
            data: { isActive },
        });
        if (isActive) {
            await this.createClassesAndSubjectsForLevel(levelId, level.schoolId);
        }
        else {
            await this.removeClassesAndSubjectsForLevel(levelId);
        }
        return updatedLevel;
    }
    async getLevelClassCount(levelId, getExpectedCount = false) {
        if (getExpectedCount) {
            const level = await this.prisma.level.findUnique({
                where: { id: levelId },
                include: { school: true },
            });
            if (!level) {
                throw new Error('Level not found');
            }
            const config = await this.prisma.schoolAcademicConfig.findFirst({
                where: { schoolId: level.schoolId },
            });
            if (!config) {
                throw new Error('School academic config not found');
            }
            const educationSystem = this.educationSystemsService.getEducationSystemById(config.educationSystemId);
            if (!educationSystem) {
                throw new Error('Education system not found');
            }
            const systemLevel = educationSystem.levels.find((l) => l.name.toLowerCase() === level.name.toLowerCase());
            if (!systemLevel) {
                throw new Error('Level not found in education system');
            }
            return { count: systemLevel.classLevels.length };
        }
        else {
            const count = await this.prisma.class.count({
                where: {
                    levelId,
                    isActive: true,
                },
            });
            return { count };
        }
    }
    async createClassesAndSubjectsForLevel(levelId, schoolId) {
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
        const level = await this.prisma.level.findUnique({
            where: { id: levelId },
        });
        if (!level) {
            throw new Error('Level not found');
        }
        const systemLevel = educationSystem.levels.find((l) => l.name.toLowerCase() === level.name.toLowerCase());
        if (!systemLevel) {
            throw new Error('Level not found in education system');
        }
        const createdClasses = [];
        for (const classLevel of systemLevel.classLevels) {
            const existingClass = await this.prisma.class.findFirst({
                where: {
                    name: classLevel.name,
                    levelId: levelId,
                    schoolId,
                },
            });
            let classRecord;
            if (existingClass) {
                classRecord = await this.prisma.class.update({
                    where: { id: existingClass.id },
                    data: { isActive: true, order: classLevel.order },
                });
            }
            else {
                classRecord = await this.prisma.class.create({
                    data: {
                        name: classLevel.name,
                        order: classLevel.order,
                        levelId: levelId,
                        schoolId,
                        isActive: true,
                    },
                });
            }
            createdClasses.push(classRecord);
        }
        for (const subjectName of systemLevel.subjects) {
            const existingSubject = await this.prisma.subject.findFirst({
                where: {
                    name: subjectName,
                    schoolId,
                },
            });
            let subject;
            if (existingSubject) {
                subject = await this.prisma.subject.update({
                    where: { id: existingSubject.id },
                    data: {
                        isActive: true,
                        description: `${subjectName} for ${systemLevel.name}`,
                    },
                });
            }
            else {
                subject = await this.prisma.subject.create({
                    data: {
                        name: subjectName,
                        code: subjectName.toUpperCase().replace(/\s+/g, '_'),
                        description: `${subjectName} for ${systemLevel.name}`,
                        category: subjectName,
                        schoolId,
                        isActive: true,
                    },
                });
            }
            for (const classRecord of createdClasses) {
                await this.prisma.class.update({
                    where: { id: classRecord.id },
                    data: {
                        subjects: {
                            connect: { id: subject.id }
                        }
                    }
                });
            }
        }
    }
    async removeClassesAndSubjectsForLevel(levelId) {
        const level = await this.prisma.level.findUnique({
            where: { id: levelId },
        });
        if (!level) {
            throw new Error('Level not found');
        }
        const classes = await this.prisma.class.findMany({
            where: { levelId },
        });
        await this.prisma.class.deleteMany({
            where: { levelId },
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
                sections: {
                    where: { isActive: true },
                    include: {
                        teacher: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getSubjects(schoolId) {
        return this.prisma.subject.findMany({
            where: {
                schoolId,
                isActive: true,
                classes: {
                    some: {
                        level: {
                            isActive: true
                        }
                    }
                }
            },
            include: {
                classes: {
                    include: {
                        level: true
                    }
                }
            },
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
    async getSectionsByClass(classId) {
        return this.prisma.section.findMany({
            where: {
                classId,
                isActive: true,
            },
            include: {
                teacher: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createSection(sectionData) {
        const section = await this.prisma.section.create({
            data: {
                ...sectionData,
                isActive: true,
            },
        });
        if (section.teacherId) {
            return this.prisma.section.findUnique({
                where: { id: section.id },
                include: {
                    teacher: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
        }
        return section;
    }
    async updateSectionArm(id, sectionData) {
        const cleanData = {
            ...sectionData,
            teacherId: sectionData.teacherId === '' ? null : sectionData.teacherId
        };
        const section = await this.prisma.section.update({
            where: { id },
            data: cleanData,
        });
        if (section.teacherId) {
            return this.prisma.section.findUnique({
                where: { id: section.id },
                include: {
                    teacher: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
        }
        return section;
    }
    async deleteSection(id) {
        return this.prisma.section.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async getAvailableTeachers(schoolId) {
        return this.prisma.teacher.findMany({
            where: {
                schoolId,
                isActive: true,
            },
            include: {
                user: true,
            },
            orderBy: {
                user: {
                    firstName: 'asc',
                },
            },
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