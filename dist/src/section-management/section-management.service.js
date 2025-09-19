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
exports.SectionManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SectionManagementService = class SectionManagementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSectionTemplates() {
        return this.prisma.sectionTemplate.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getCustomSectionPatterns(schoolId) {
        return this.prisma.customSectionPattern.findMany({
            where: {
                schoolId,
                isActive: true,
            },
            include: {
                template: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async createCustomSectionPattern(schoolId, name, pattern, templateId) {
        return this.prisma.customSectionPattern.create({
            data: {
                schoolId,
                name,
                pattern,
                templateId,
            },
        });
    }
    async getSectionsForLevel(levelId) {
        return this.prisma.class.findMany({
            where: {
                levelId,
                isActive: true,
                sectionName: { not: null },
            },
            orderBy: { sectionOrder: 'asc' },
        });
    }
    async createSectionsFromTemplate(levelId, schoolId, templateId, baseClassName, capacity) {
        const template = await this.prisma.sectionTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Section template not found');
        }
        const sections = template.pattern.map((sectionName, index) => ({
            levelId,
            schoolId,
            name: `${baseClassName} ${sectionName}`,
            sectionName,
            sectionOrder: index + 1,
            capacity: capacity || 30,
            templateUsed: template.name,
            order: index + 1,
            isActive: true,
        }));
        return this.prisma.class.createMany({
            data: sections,
        });
    }
    async createSectionsFromCustomPattern(levelId, schoolId, customPatternId, baseClassName, capacity) {
        const customPattern = await this.prisma.customSectionPattern.findUnique({
            where: { id: customPatternId },
        });
        if (!customPattern) {
            throw new common_1.NotFoundException('Custom section pattern not found');
        }
        const sections = customPattern.pattern.map((sectionName, index) => ({
            levelId,
            schoolId,
            name: `${baseClassName} ${sectionName}`,
            sectionName,
            sectionOrder: index + 1,
            capacity: capacity || 30,
            templateUsed: 'custom',
            order: index + 1,
            isActive: true,
        }));
        return this.prisma.class.createMany({
            data: sections,
        });
    }
    async createSectionsFromPattern(levelId, schoolId, pattern, baseClassName, capacity) {
        const sections = pattern.map((sectionName, index) => ({
            levelId,
            schoolId,
            name: `${baseClassName} ${sectionName}`,
            sectionName,
            sectionOrder: index + 1,
            capacity: capacity || 30,
            templateUsed: 'custom',
            order: index + 1,
            isActive: true,
        }));
        return this.prisma.class.createMany({
            data: sections,
        });
    }
    async addSection(levelId, schoolId, sectionName, baseClassName, capacity) {
        const lastSection = await this.prisma.class.findFirst({
            where: {
                levelId,
                sectionName: { not: null },
            },
            orderBy: { sectionOrder: 'desc' },
        });
        const nextOrder = lastSection && lastSection.sectionOrder
            ? lastSection.sectionOrder + 1
            : 1;
        return this.prisma.class.create({
            data: {
                levelId,
                schoolId,
                name: `${baseClassName} ${sectionName}`,
                sectionName,
                sectionOrder: nextOrder,
                capacity: capacity || 30,
                templateUsed: 'manual',
                order: nextOrder,
                isActive: true,
            },
        });
    }
    async updateSection(sectionId, updates) {
        const section = await this.prisma.class.findUnique({
            where: { id: sectionId },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        const updateData = {};
        if (updates.sectionName) {
            updateData.sectionName = updates.sectionName;
            updateData.name = `${updates.baseClassName || section.name.split(' ')[0]} ${updates.sectionName}`;
        }
        if (updates.capacity !== undefined) {
            updateData.capacity = updates.capacity;
        }
        return this.prisma.class.update({
            where: { id: sectionId },
            data: updateData,
        });
    }
    async removeSection(sectionId) {
        const section = await this.prisma.class.findUnique({
            where: { id: sectionId },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        const studentCount = await this.prisma.student.count({
            where: { currentClassId: sectionId },
        });
        if (studentCount > 0) {
            throw new Error('Cannot remove section with enrolled students');
        }
        return this.prisma.class.update({
            where: { id: sectionId },
            data: { isActive: false },
        });
    }
    async reorderSections(levelId, sectionIds) {
        const updates = sectionIds.map((sectionId, index) => ({
            where: { id: sectionId },
            data: { sectionOrder: index + 1 },
        }));
        const promises = updates.map((update) => this.prisma.class.update(update));
        return Promise.all(promises);
    }
    async getSectionStatistics(levelId) {
        const sections = await this.prisma.class.findMany({
            where: {
                levelId,
                isActive: true,
                sectionName: { not: null },
            },
            include: {
                _count: {
                    select: { students: true },
                },
            },
            orderBy: { sectionOrder: 'asc' },
        });
        return sections.map((section) => ({
            id: section.id,
            name: section.name,
            sectionName: section.sectionName,
            capacity: section.capacity,
            enrolledStudents: section._count.students,
            availableSpots: section.capacity
                ? section.capacity - section._count.students
                : null,
            utilizationRate: section.capacity
                ? (section._count.students / section.capacity) * 100
                : null,
        }));
    }
};
exports.SectionManagementService = SectionManagementService;
exports.SectionManagementService = SectionManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SectionManagementService);
//# sourceMappingURL=section-management.service.js.map