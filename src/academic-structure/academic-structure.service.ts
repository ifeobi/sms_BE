import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Prisma, GradingScaleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EducationSystemsService } from '../education-systems/education-systems.service';
import { EducationSystem } from '../education-systems/interfaces/education-system.interface';
import { SectionManagementService } from '../section-management/section-management.service';

@Injectable()
export class AcademicStructureService {
  private readonly logger = new Logger(AcademicStructureService.name);

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
    prismaClient?: any,
  ) {
    this.logger.log(
      `[GENERATE] Initialising academic structure | schoolId=${schoolId} educationSystemId=${educationSystemId} selectedLevels=${JSON.stringify(
        selectedLevels,
      )}`,
    );

    const educationSystem =
      this.educationSystemsService.getEducationSystemById(educationSystemId);
    if (!educationSystem) {
      throw new Error(`Education system ${educationSystemId} not found`);
    }

    // Use provided Prisma client or fall back to this.prisma
    const prisma = prismaClient || this.prisma;

    // Create school academic config
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

    // Create ALL levels from the education system with proper active status
    // Use all levels from the education system, not just selected + available
    const allLevels = educationSystem.levels.map(level => level.id);

    for (const levelId of allLevels) {
      const level = educationSystem.levels.find((l) => l.id === levelId);
      if (!level) continue;

      this.logger.debug(
        `[GENERATE] Processing level "${level.name}" (${levelId}) | active=${
          selectedLevels.includes(levelId)
        }`,
      );

      const isActive = selectedLevels.includes(levelId);

      // Create level with proper active status
      const levelRecord = await prisma.level.create({
        data: {
          name: level.name,
          order: level.order,
          schoolId,
          isActive,
        },
      });

      // Only create classes and subjects for ACTIVE levels
      if (isActive) {
        // Create classes for this level first
        for (const classLevel of level.classLevels) {
          await prisma.class.create({
            data: {
              name: classLevel.name,
              order: classLevel.order,
              levelId: levelRecord.id,
              schoolId,
              isActive: true,
            },
          });
        }

        // Create subjects at education level
        for (const subjectName of level.subjects) {
          this.logger.debug(
            `[GENERATE] Ensuring subject "${subjectName}" for level "${level.name}"`,
          );
          await this.ensureSubjectRecord(
            prisma,
            schoolId,
            subjectName,
            this.buildSchoolWideDescription(subjectName),
            subjectName,
          );
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

          await this.ensureSubjectRecord(
            this.prisma,
            schoolId,
            customSubjectName,
            this.buildSchoolWideDescription(customSubjectName),
          );
        }
      }
    }

    return updatedConfig;
  }

  async getSchoolAcademicStructure(schoolId: string) {
    await this.deduplicateSubjectsForSchool(schoolId);

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
      where: { schoolId }, // Remove isActive filter to get ALL levels
      orderBy: { order: 'asc' },
      include: {
        classes: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async toggleLevelStatus(levelId: string, isActive: boolean) {
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      include: { school: true },
    });

    if (!level) {
      throw new Error('Level not found');
    }

    // Update level status
    const updatedLevel = await this.prisma.level.update({
      where: { id: levelId },
      data: { isActive },
    });

    if (isActive) {
      // Level is being activated - create classes and ensure school-level subjects exist
      await this.createClassesAndSubjectsForLevel(levelId, level.schoolId);
    } else {
      // Level is being deactivated - remove classes; subjects remain school-scoped
      await this.removeClassesAndSubjectsForLevel(levelId);
    }

    return updatedLevel;
  }

  async getLevelClassCount(levelId: string, getExpectedCount: boolean = false) {
    if (getExpectedCount) {
      // Get expected count from education system template
      const level = await this.prisma.level.findUnique({
        where: { id: levelId },
        include: { school: true },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      // Get school's education system
      const config = await this.prisma.schoolAcademicConfig.findFirst({
        where: { schoolId: level.schoolId },
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

      // Find matching level in education system
      const systemLevel = educationSystem.levels.find(
        (l) => l.name.toLowerCase() === level.name.toLowerCase(),
      );

      if (!systemLevel) {
        throw new Error('Level not found in education system');
      }

      return { count: systemLevel.classLevels.length };
    } else {
      // Get current count from database
      const count = await this.prisma.class.count({
        where: {
          levelId,
          isActive: true,
        },
      });

      return { count };
    }
  }

  private async deduplicateSubjectsForSchool(schoolId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: { schoolId },
    });

    const grouped = new Map<string, typeof subjects>();
    const hasStudentSubjectTable = await this.tableExists(
      'student_subject_enrollments',
    );

    for (const subject of subjects) {
      const key = subject.name.trim().toLowerCase();
      const existingGroup = grouped.get(key) ?? [];
      existingGroup.push(subject);
      grouped.set(key, existingGroup);
    }

    for (const group of grouped.values()) {
      if (group.length <= 1) {
        continue;
      }

      const sortedGroup = [...group].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        return a.id.localeCompare(b.id);
      });

      const [primary, ...duplicates] = sortedGroup;

      const descriptions = new Set<string>();
      const categories = new Set<string>();

      for (const subject of group) {
        if (subject.description?.trim()) {
          descriptions.add(subject.description.trim());
        }
        if (subject.category?.trim()) {
          categories.add(subject.category.trim());
        }
      }

      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const transaction = tx as any;
        if (!primary.isActive) {
          await tx.subject.update({
            where: { id: primary.id },
            data: { isActive: true },
          });
        }

        for (const duplicate of duplicates) {
          await tx.assignment.updateMany({
            where: { subjectId: duplicate.id },
            data: { subjectId: primary.id },
          });

          await tx.academicRecord.updateMany({
            where: { subjectId: duplicate.id },
            data: { subjectId: primary.id },
          });

          await tx.teacherAssignment.updateMany({
            where: { subjectId: duplicate.id },
            data: { subjectId: primary.id },
          });

          if (hasStudentSubjectTable) {
            await transaction.studentSubjectEnrollment.updateMany({
              where: { subjectId: duplicate.id },
              data: { subjectId: primary.id },
            });
          }

          await tx.subject.delete({
            where: { id: duplicate.id },
          });
        }

        const combinedDescription =
          descriptions.size > 0
            ? Array.from(descriptions).join(' | ')
            : null;
        const primaryCategory =
          categories.size > 0 ? Array.from(categories)[0] : null;
        const normalizedCode = this.generateSubjectCode(primary.name);
        const updateData: Record<string, any> = {};

        if (combinedDescription !== null) {
          updateData.description = combinedDescription;
        }

        if (primaryCategory) {
          updateData.category = primaryCategory;
        }

        if (primary.code !== normalizedCode) {
          updateData.code = normalizedCode;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.subject.update({
            where: { id: primary.id },
            data: updateData,
          });
        }
      });
    }
  }

  private async createClassesAndSubjectsForLevel(levelId: string, schoolId: string) {
    // Get the school's academic config to find education system
    const config = await this.prisma.schoolAcademicConfig.findFirst({
      where: { schoolId },
    });

    if (!config) {
      throw new Error('School academic config not found');
    }

    // Get education system data
    const educationSystem = this.educationSystemsService.getEducationSystemById(
      config.educationSystemId,
    );

    if (!educationSystem) {
      throw new Error('Education system not found');
    }

    // Find the level in education system
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      throw new Error('Level not found');
    }

    // Find matching level in education system
    const systemLevel = educationSystem.levels.find(
      (l) => l.name.toLowerCase() === level.name.toLowerCase(),
    );

    if (!systemLevel) {
      throw new Error('Level not found in education system');
    }

    // Create classes for this level first (check if they already exist)
    for (const classLevel of systemLevel.classLevels) {
      // Check if class already exists
      const existingClass = await this.prisma.class.findFirst({
        where: {
          name: classLevel.name,
          levelId: levelId,
          schoolId,
        },
      });

      let classRecord;
      if (existingClass) {
        // Update existing class to be active
        classRecord = await this.prisma.class.update({
          where: { id: existingClass.id },
          data: { isActive: true, order: classLevel.order },
        });
      } else {
        // Create new class
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
    }

    // Ensure subjects exist at the school level for this education stage
    for (const subjectName of systemLevel.subjects) {
      await this.ensureSubjectRecord(
        this.prisma,
        schoolId,
        subjectName,
        this.buildSchoolWideDescription(subjectName),
        subjectName,
      );
    }
  }

  private async removeClassesAndSubjectsForLevel(levelId: string) {
    // Get the level to find schoolId
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      throw new Error('Level not found');
    }

    // Get all classes for this level
    const classes = await this.prisma.class.findMany({
      where: { levelId },
    });

    // Subjects remain managed at the school level, so we only deactivate the classes here.
    // Remove classes for this level
    await this.prisma.class.deleteMany({
      where: { levelId },
    });

    // Note: Subjects are not automatically removed because they don't have a direct
    // relationship to classes in the current schema. This would need to be handled
    // differently in a production system.
  }

  async getClasses(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        level: true,
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

  async getSubjects(schoolId: string) {
    await this.deduplicateSubjectsForSchool(schoolId);

    const subjects = await this.prisma.subject.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      include: {
        classes: {
          where: { isActive: true },
          include: {
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return subjects.map((subject) => {
      const levelNames = Array.from(
        new Set(
          subject.classes
            .map((cls) => cls.level?.name?.trim())
            .filter((name): name is string => Boolean(name)),
        ),
      );

      const fallbackDescription =
        subject.description?.trim() ||
        (levelNames.length > 0 ? `Offered in: ${levelNames.join(', ')}` : null);

      return {
        ...subject,
        levelNames,
        description: fallbackDescription,
      };
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
    const subject = await this.ensureSubjectRecord(
      this.prisma,
      subjectData.schoolId,
      subjectData.name,
      subjectData.description,
      subjectData.category,
    );

    return subject;
  }

  private parseDateInput(value: any, fieldName: string): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      throw new BadRequestException(
        `${fieldName} must be a valid ISO date string (YYYY-MM-DD), timestamp, or JavaScript Date.`,
      );
    }

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        `${fieldName} must be a valid ISO date string (YYYY-MM-DD) or JavaScript Date.`,
      );
    }
    return date;
  }

  private async ensureSingleActiveTerm(
    schoolId: string,
    currentTermId?: string,
  ): Promise<void> {
    await this.prisma.academicTerm.updateMany({
      where: {
        schoolId,
        isActive: true,
        ...(currentTermId && { id: { not: currentTermId } }),
      },
      data: {
        isActive: false,
      },
    });
  }

  async createAcademicTerm(termData: any) {
    const {
      name,
      academicYear,
      schoolId,
      startDate,
      endDate,
      description,
      isActive = true,
    } = termData;

    if (!name?.trim()) {
      throw new BadRequestException('Term name is required.');
    }

    if (!academicYear?.trim()) {
      throw new BadRequestException('Academic year is required.');
    }

    if (!schoolId) {
      throw new BadRequestException('schoolId is required.');
    }

    const parsedStartDate = this.parseDateInput(startDate, 'startDate');
    const parsedEndDate = this.parseDateInput(endDate, 'endDate');

    if (!parsedStartDate || !parsedEndDate) {
      throw new BadRequestException('startDate and endDate are required.');
    }

    if (parsedStartDate.getTime() > parsedEndDate.getTime()) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    if (isActive) {
      await this.ensureSingleActiveTerm(schoolId);
    }

    return this.prisma.academicTerm.create({
      data: {
        name: name.trim(),
        academicYear: academicYear.trim(),
        description: description?.trim() || null,
        schoolId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        isActive,
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
    const existing = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Subject not found');
    }

    const normalizedName = subjectData.name?.trim();
    if (normalizedName) {
      const duplicate = await this.prisma.subject.findFirst({
        where: {
          schoolId: existing.schoolId,
          name: { equals: normalizedName, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new Error(
          `Subject "${normalizedName}" already exists for this school.`,
        );
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...subjectData,
        name: normalizedName ?? subjectData.name,
        code: normalizedName
          ? normalizedName.toUpperCase().replace(/\s+/g, '_')
          : subjectData.code ?? existing.code,
      },
    });
  }

  async updateAcademicTerm(id: string, termData: any) {
    const existing = await this.prisma.academicTerm.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Academic term not found.');
    }

    const updatePayload: Record<string, any> = {};

    if (termData.name !== undefined) {
      if (!termData.name?.trim()) {
        throw new BadRequestException('Term name cannot be empty.');
      }
      updatePayload.name = termData.name.trim();
    }

    if (termData.academicYear !== undefined) {
      if (!termData.academicYear?.trim()) {
        throw new BadRequestException('Academic year cannot be empty.');
      }
      updatePayload.academicYear = termData.academicYear.trim();
    }

    if (termData.description !== undefined) {
      updatePayload.description = termData.description?.trim() ?? null;
    }

    if (termData.startDate !== undefined) {
      updatePayload.startDate = this.parseDateInput(termData.startDate, 'startDate');
    }

    if (termData.endDate !== undefined) {
      updatePayload.endDate = this.parseDateInput(termData.endDate, 'endDate');
    }

    if (
      updatePayload.startDate &&
      updatePayload.endDate &&
      updatePayload.startDate.getTime() > updatePayload.endDate.getTime()
    ) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    if (termData.isActive !== undefined) {
      updatePayload.isActive = Boolean(termData.isActive);
    }

    if (updatePayload.isActive) {
      await this.ensureSingleActiveTerm(existing.schoolId, id);
    }

    return this.prisma.academicTerm.update({
      where: { id },
      data: updatePayload,
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

  // ==================== SECTION/ARM MANAGEMENT ====================

  async getSectionsByClass(classId: string) {
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

  async createSection(sectionData: any) {
    const section = await this.prisma.section.create({
      data: {
        ...sectionData,
        isActive: true,
      },
    });

    // If teacherId is provided, fetch the teacher data
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

  async updateSectionArm(id: string, sectionData: any) {
    // Convert empty string teacherId to null
    const cleanData = {
      ...sectionData,
      teacherId: sectionData.teacherId === '' ? null : sectionData.teacherId
    };

    const section = await this.prisma.section.update({
      where: { id },
      data: cleanData,
    });

    // If teacherId is provided, fetch the teacher data
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

  async deleteSection(id: string) {
    return this.prisma.section.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getAvailableTeachers(schoolId: string) {
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

  private formatSubjectName(name: string) {
    return name.trim();
  }

  private generateSubjectCode(name: string) {
    return this.formatSubjectName(name).toUpperCase().replace(/\s+/g, '_');
  }

  private buildSchoolWideDescription(name: string) {
    return `${name} (School-wide subject)`;
  }

  private async ensureSubjectRecord(
    prisma: any,
    schoolId: string,
    name: string,
    description?: string,
    category?: string,
  ) {
    const formattedName = this.formatSubjectName(name);

    const existingSubject = await prisma.subject.findFirst({
      where: {
        schoolId,
        name: { equals: formattedName, mode: 'insensitive' },
      },
    });

    if (existingSubject) {
      this.logger.verbose(
        `[SUBJECT] Reusing existing subject "${formattedName}" (${existingSubject.id}) for school ${schoolId}`,
      );
      const needsUpdate =
        !existingSubject.isActive ||
        (description && existingSubject.description !== description) ||
        (category &&
          existingSubject.category?.toLowerCase() !== category.toLowerCase());

      if (needsUpdate) {
        return prisma.subject.update({
          where: { id: existingSubject.id },
          data: {
            isActive: true,
            description: description ?? existingSubject.description,
            category: category ?? existingSubject.category,
          },
        });
      }

      return existingSubject;
    }

    this.logger.log(
      `[SUBJECT] Creating new subject "${formattedName}" for school ${schoolId}`,
    );
    return prisma.subject.create({
      data: {
        schoolId,
        name: formattedName,
        code: this.generateSubjectCode(formattedName),
        description,
        category: category ?? formattedName,
        isActive: true,
      },
    });
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<
      Array<{ exists: boolean }>
    >`SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    ) as "exists"`;

    return result?.[0]?.exists ?? false;
  }

  // ==================== GRADING SCALE METHODS ====================

  async getGradingScales(schoolId: string) {
    return this.prisma.gradingScale.findMany({
      where: { schoolId, isActive: true },
      orderBy: { isDefault: 'desc' },
    });
  }

  async getDefaultGradingScale(schoolId: string) {
    const defaultScale = await this.prisma.gradingScale.findFirst({
      where: { schoolId, isDefault: true, isActive: true },
    });

    if (defaultScale) {
      return defaultScale;
    }

    // Return first active scale if no default exists
    return this.prisma.gradingScale.findFirst({
      where: { schoolId, isActive: true },
    });
  }

  async createGradingScale(schoolId: string, data: {
    name: string;
    type: string;
    scale: any;
    isDefault?: boolean;
    isActive?: boolean;
  }) {
    // Convert string type to enum (handle both uppercase and lowercase)
    const typeUpper = data.type.toUpperCase();
    let gradingScaleType: GradingScaleType;
    
    if (typeUpper === 'PERCENTAGE') {
      gradingScaleType = GradingScaleType.PERCENTAGE;
    } else if (typeUpper === 'LETTER') {
      gradingScaleType = GradingScaleType.LETTER;
    } else if (typeUpper === 'GPA') {
      gradingScaleType = GradingScaleType.GPA;
    } else if (typeUpper === 'CUSTOM') {
      gradingScaleType = GradingScaleType.CUSTOM;
    } else {
      // Default to PERCENTAGE if invalid
      gradingScaleType = GradingScaleType.PERCENTAGE;
    }

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.gradingScale.updateMany({
        where: { schoolId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.gradingScale.create({
      data: {
        schoolId,
        name: data.name,
        type: gradingScaleType,
        scale: data.scale,
        isDefault: data.isDefault || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateGradingScale(id: string, schoolId: string, data: {
    name?: string;
    type?: string;
    scale?: any;
    isDefault?: boolean;
    isActive?: boolean;
  }) {
    // Convert string type to enum if provided
    let gradingScaleType: GradingScaleType | undefined;
    if (data.type) {
      const typeUpper = data.type.toUpperCase();
      if (typeUpper === 'PERCENTAGE') {
        gradingScaleType = GradingScaleType.PERCENTAGE;
      } else if (typeUpper === 'LETTER') {
        gradingScaleType = GradingScaleType.LETTER;
      } else if (typeUpper === 'GPA') {
        gradingScaleType = GradingScaleType.GPA;
      } else if (typeUpper === 'CUSTOM') {
        gradingScaleType = GradingScaleType.CUSTOM;
      } else {
        // Default to PERCENTAGE if invalid
        gradingScaleType = GradingScaleType.PERCENTAGE;
      }
    }

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.gradingScale.updateMany({
        where: { schoolId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.gradingScale.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(gradingScaleType && { type: gradingScaleType }),
        ...(data.scale && { scale: data.scale }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }
}
