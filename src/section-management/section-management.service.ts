import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionManagementService {
  constructor(private prisma: PrismaService) {}

  // Get all section templates
  async getSectionTemplates() {
    return this.prisma.sectionTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // Get custom section patterns for a school
  async getCustomSectionPatterns(schoolId: string) {
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

  // Create custom section pattern
  async createCustomSectionPattern(
    schoolId: string,
    name: string,
    pattern: string[],
    templateId?: string,
  ) {
    return this.prisma.customSectionPattern.create({
      data: {
        schoolId,
        name,
        pattern,
        templateId,
      },
    });
  }

  // Get sections for a specific level
  async getSectionsForLevel(levelId: string) {
    return this.prisma.class.findMany({
      where: {
        levelId,
        isActive: true,
        sectionName: { not: null }, // Only sections, not base classes
      },
      orderBy: { sectionOrder: 'asc' },
    });
  }

  // Create sections for a level using template
  async createSectionsFromTemplate(
    levelId: string,
    schoolId: string,
    templateId: string,
    baseClassName: string,
    capacity?: number,
  ) {
    const template = await this.prisma.sectionTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Section template not found');
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

  // Create sections from custom pattern
  async createSectionsFromCustomPattern(
    levelId: string,
    schoolId: string,
    customPatternId: string,
    baseClassName: string,
    capacity?: number,
  ) {
    const customPattern = await this.prisma.customSectionPattern.findUnique({
      where: { id: customPatternId },
    });

    if (!customPattern) {
      throw new NotFoundException('Custom section pattern not found');
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

  // Create sections from custom pattern array
  async createSectionsFromPattern(
    levelId: string,
    schoolId: string,
    pattern: string[],
    baseClassName: string,
    capacity?: number,
  ) {
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

  // Add single section to a level
  async addSection(
    levelId: string,
    schoolId: string,
    sectionName: string,
    baseClassName: string,
    capacity?: number,
  ) {
    // Get the next section order
    const lastSection = await this.prisma.class.findFirst({
      where: {
        levelId,
        sectionName: { not: null },
      },
      orderBy: { sectionOrder: 'desc' },
    });

    const nextOrder =
      lastSection && lastSection.sectionOrder
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

  // Update section
  async updateSection(
    sectionId: string,
    updates: {
      sectionName?: string;
      capacity?: number;
      baseClassName?: string;
    },
  ) {
    const section = await this.prisma.class.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const updateData: any = {};

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

  // Remove section
  async removeSection(sectionId: string) {
    const section = await this.prisma.class.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check if section has students
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

  // Reorder sections
  async reorderSections(levelId: string, sectionIds: string[]) {
    const updates = sectionIds.map((sectionId, index) => ({
      where: { id: sectionId },
      data: { sectionOrder: index + 1 },
    }));

    const promises = updates.map((update) => this.prisma.class.update(update));

    return Promise.all(promises);
  }

  // Get section statistics
  async getSectionStatistics(levelId: string) {
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
}
