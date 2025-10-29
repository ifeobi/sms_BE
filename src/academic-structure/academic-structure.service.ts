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
    prismaClient?: any,
  ) {
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
        const createdClasses: any[] = [];
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

        // Create subjects at education level and link to all classes in this level
        for (const subjectName of level.subjects) {
          const subject = await prisma.subject.create({
            data: {
              name: subjectName,
              code: subjectName.toUpperCase().replace(/\s+/g, '_'),
              description: `${subjectName} for ${level.name}`,
              category: subjectName, // For analytics grouping
              schoolId,
              isActive: true,
            },
          });

          // Link the subject to ALL classes in this education level
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
      // Level is being activated - create classes and subjects
      await this.createClassesAndSubjectsForLevel(levelId, level.schoolId);
    } else {
      // Level is being deactivated - remove classes and subjects
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
    const createdClasses: any[] = [];
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
      createdClasses.push(classRecord);
    }

    // Create subjects at education level and link to all classes in this level
    for (const subjectName of systemLevel.subjects) {
      // Check if subject already exists
      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          name: subjectName,
          schoolId,
        },
      });

      let subject;
      if (existingSubject) {
        // Update existing subject to be active
        subject = await this.prisma.subject.update({
          where: { id: existingSubject.id },
          data: { 
            isActive: true,
            description: `${subjectName} for ${systemLevel.name}`,
          },
        });
      } else {
        // Create new subject
        subject = await this.prisma.subject.create({
          data: {
            name: subjectName,
            code: subjectName.toUpperCase().replace(/\s+/g, '_'),
            description: `${subjectName} for ${systemLevel.name}`,
            category: subjectName, // For analytics grouping
            schoolId,
            isActive: true,
          },
        });
      }

      // Link the subject to ALL classes in this education level
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

    // For now, we'll only remove classes since subjects don't have direct class relationship
    // In a real implementation, you'd need to track which subjects belong to which classes
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

  async getSubjects(schoolId: string) {
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
}
