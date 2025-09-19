import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EducationSystemsService } from '../education-systems/education-systems.service';
import { EducationSystem } from '../education-systems/interfaces/education-system.interface';
import { SectionManagementService } from '../section-management/section-management.service';

@Injectable()
export class AcademicStructureService {
  constructor(
    private prisma: PrismaService,
    private educationSystemsService: EducationSystemsService,
    private sectionManagementService: SectionManagementService,
  ) {}

  getEducationSystemById(id: string) {
    return this.educationSystemsService.getEducationSystemById(id);
  }

  async generateAcademicStructureForSchool(
    schoolId: string,
    educationSystemId: string,
    selectedLevels: string[],
    availableLevels: string[],
  ) {
    const educationSystem =
      this.educationSystemsService.getEducationSystemById(educationSystemId);
    if (!educationSystem) {
      throw new Error(`Education system ${educationSystemId} not found`);
    }

    // Create school academic config
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

    // Generate levels, classes, and subjects for selected levels
    for (const levelId of selectedLevels) {
      const level = educationSystem.levels.find((l) => l.id === levelId);
      if (!level) continue;

      // Create level
      const levelRecord = await this.prisma.level.create({
        data: {
          name: level.name,
          order: level.order,
          schoolId,
          isActive: true,
        },
      });

      // Create classes for this level
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

        // Create subjects for this class
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

  async updateSchoolAcademicStructure(
    schoolId: string,
    selectedLevels: string[],
    customClassNames?: Record<string, string>,
    customSubjectNames?: Record<string, string>,
  ) {
    // Update school config
    const updatedConfig = await this.prisma.schoolAcademicConfig.updateMany({
      where: { schoolId },
      data: {
        selectedLevels,
        customClassNames: customClassNames || {},
        customSubjectNames: customSubjectNames || {},
      },
    });

    // Deactivate old levels
    await this.prisma.level.updateMany({
      where: { schoolId },
      data: { isActive: false },
    });

    // Get education system
    const config = await this.prisma.schoolAcademicConfig.findFirst({
      where: { schoolId },
    });

    if (!config) {
      throw new Error('School academic config not found');
    }

    const educationSystem = this.educationSystemsService.getEducationSystemById(
      config.educationSystemId,
    );
    if (!educationSystem) {
      throw new Error('Education system not found');
    }

    // Generate new academic structure
    for (const levelId of selectedLevels) {
      const level = educationSystem.levels.find((l) => l.id === levelId);
      if (!level) continue;

      // Create or update level
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
      } else {
        levelRecord = await this.prisma.level.create({
          data: {
            name: level.name,
            order: level.order,
            schoolId,
            isActive: true,
          },
        });
      }

      // Create or update classes
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
        } else {
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

        // Create or update subjects
        for (const subjectName of classLevel.subjects) {
          const customSubjectName =
            customSubjectNames?.[subjectName] || subjectName;

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
          } else {
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

  async getSchoolAcademicStructure(schoolId: string) {
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

  // Section Management Methods
  async getSectionTemplates() {
    return this.sectionManagementService.getSectionTemplates();
  }

  async getCustomSectionPatterns(schoolId: string) {
    return this.sectionManagementService.getCustomSectionPatterns(schoolId);
  }

  async createCustomSectionPattern(
    schoolId: string,
    name: string,
    pattern: string[],
    templateId?: string,
  ) {
    return this.sectionManagementService.createCustomSectionPattern(
      schoolId,
      name,
      pattern,
      templateId,
    );
  }

  async getSectionsForLevel(levelId: string) {
    return this.sectionManagementService.getSectionsForLevel(levelId);
  }

  async createSectionsFromTemplate(
    levelId: string,
    schoolId: string,
    templateId: string,
    baseClassName: string,
    capacity?: number,
  ) {
    return this.sectionManagementService.createSectionsFromTemplate(
      levelId,
      schoolId,
      templateId,
      baseClassName,
      capacity,
    );
  }

  async createSectionsFromPattern(
    levelId: string,
    schoolId: string,
    pattern: string[],
    baseClassName: string,
    capacity?: number,
  ) {
    return this.sectionManagementService.createSectionsFromPattern(
      levelId,
      schoolId,
      pattern,
      baseClassName,
      capacity,
    );
  }

  async addSection(
    levelId: string,
    schoolId: string,
    sectionName: string,
    baseClassName: string,
    capacity?: number,
  ) {
    return this.sectionManagementService.addSection(
      levelId,
      schoolId,
      sectionName,
      baseClassName,
      capacity,
    );
  }

  async updateSection(
    sectionId: string,
    updates: {
      sectionName?: string;
      capacity?: number;
      baseClassName?: string;
    },
  ) {
    return this.sectionManagementService.updateSection(sectionId, updates);
  }

  async removeSection(sectionId: string) {
    return this.sectionManagementService.removeSection(sectionId);
  }

  async reorderSections(levelId: string, sectionIds: string[]) {
    return this.sectionManagementService.reorderSections(levelId, sectionIds);
  }

  async getSectionStatistics(levelId: string) {
    return this.sectionManagementService.getSectionStatistics(levelId);
  }

  // ==================== CRUD METHODS FOR FRONTEND ====================

  async getLevels(schoolId: string) {
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

  async getClasses(schoolId: string) {
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

  async getSubjects(schoolId: string) {
    return this.prisma.subject.findMany({
      where: { schoolId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAcademicTerms(schoolId: string) {
    return this.prisma.academicTerm.findMany({
      where: { schoolId, isActive: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async getTeacherAssignments(filters: any) {
    const where: any = {};

    if (filters.schoolId) where.schoolId = filters.schoolId;
    if (filters.teacherId) where.teacherId = filters.teacherId;
    if (filters.classId) where.classId = filters.classId;
    if (filters.subjectId) where.subjectId = filters.subjectId;

    return this.prisma.teacherAssignment.findMany({
      where,
      include: {
        teacher: true,
        class: true,
        subject: true,
      },
    });
  }

  // ==================== CREATE METHODS ====================

  async createLevel(levelData: any) {
    return this.prisma.level.create({
      data: {
        ...levelData,
        isActive: true,
      },
    });
  }

  async createClass(classData: any) {
    return this.prisma.class.create({
      data: {
        ...classData,
        isActive: true,
      },
    });
  }

  async createSubject(subjectData: any) {
    return this.prisma.subject.create({
      data: {
        ...subjectData,
        isActive: true,
      },
    });
  }

  async createAcademicTerm(termData: any) {
    return this.prisma.academicTerm.create({
      data: {
        ...termData,
        isActive: true,
      },
    });
  }

  async createTeacherAssignment(assignmentData: any) {
    return this.prisma.teacherAssignment.create({
      data: assignmentData,
    });
  }

  // ==================== UPDATE METHODS ====================

  async updateLevel(id: string, levelData: any) {
    return this.prisma.level.update({
      where: { id },
      data: levelData,
    });
  }

  async updateClass(id: string, classData: any) {
    return this.prisma.class.update({
      where: { id },
      data: classData,
    });
  }

  async updateSubject(id: string, subjectData: any) {
    return this.prisma.subject.update({
      where: { id },
      data: subjectData,
    });
  }

  async updateAcademicTerm(id: string, termData: any) {
    return this.prisma.academicTerm.update({
      where: { id },
      data: termData,
    });
  }

  async updateTeacherAssignment(id: string, assignmentData: any) {
    return this.prisma.teacherAssignment.update({
      where: { id },
      data: assignmentData,
    });
  }

  // ==================== DELETE METHODS ====================

  async deleteLevel(id: string) {
    return this.prisma.level.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deleteClass(id: string) {
    return this.prisma.class.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deleteSubject(id: string) {
    return this.prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deleteAcademicTerm(id: string) {
    return this.prisma.academicTerm.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deleteTeacherAssignment(id: string) {
    return this.prisma.teacherAssignment.delete({
      where: { id },
    });
  }

  // ==================== BULK OPERATIONS ====================

  async bulkCreateSubjects(subjects: any[]) {
    return this.prisma.subject.createMany({
      data: subjects.map((subject) => ({
        ...subject,
        isActive: true,
      })),
    });
  }

  async bulkCreateClasses(classes: any[]) {
    return this.prisma.class.createMany({
      data: classes.map((classItem) => ({
        ...classItem,
        isActive: true,
      })),
    });
  }

  async bulkCreateTeacherAssignments(assignments: any[]) {
    return this.prisma.teacherAssignment.createMany({
      data: assignments,
    });
  }
}
