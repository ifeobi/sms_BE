import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  AttendanceStatus,
  AssignmentCategory,
  AssignmentType,
} from '@prisma/client';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateContinuousAssessmentDto } from './dto/create-continuous-assessment.dto';
import { CreateAssignmentGradeDto } from './dto/create-assignment-grade.dto';

interface AttendanceFilters {
  classId?: string;
  termId?: string;
  subjectId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface GradeFilters {
  classId?: string;
  subjectId?: string;
  termId?: string;
  assignmentId?: string;
}

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getTeacherByUserId(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
        school: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacher;
  }

  private mapTeacherProfile(teacher: any) {
    return {
      id: teacher.id,
      employeeNumber: teacher.employeeNumber,
      department: teacher.department,
      schoolId: teacher.schoolId,
      user: {
        id: teacher.user.id,
        email: teacher.user.email,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        fullName: `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
      },
      school: teacher.school
        ? {
            id: teacher.school.id,
            name: teacher.school.name,
            country: teacher.school.country,
            city: teacher.school.city,
          }
        : null,
    };
  }

  private mapAssignmentDetail(assignment: any) {
    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      termId: assignment.termId,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      weight: assignment.weight,
      type: assignment.type,
      category: assignment.category,
      academicYear: assignment.term?.academicYear ?? null,
      allowLateSubmission: assignment.allowLateSubmission,
      latePenalty: assignment.latePenalty,
      allowResubmission: assignment.allowResubmission,
      maxResubmissions: assignment.maxResubmissions,
      isGroupAssignment: assignment.isGroupAssignment,
      groupSize: assignment.groupSize,
      learningObjectives: assignment.learningObjectives,
      tags: assignment.tags,
      class: assignment.class
        ? {
            id: assignment.class.id,
            name: assignment.class.name,
            shortName: assignment.class.shortName,
            level: assignment.class.level
              ? {
                  id: assignment.class.level.id,
                  name: assignment.class.level.name,
                }
              : null,
          }
        : null,
      subject: assignment.subject
        ? {
            id: assignment.subject.id,
            name: assignment.subject.name,
            code: assignment.subject.code,
          }
        : null,
      term: assignment.term
        ? {
            id: assignment.term.id,
            name: assignment.term.name,
            academicYear: assignment.term.academicYear,
          }
        : null,
      assignees: assignment.assignees
        ? assignment.assignees.map((assignee: any) => ({
            id: assignee.id,
            studentId: assignee.studentId,
            assignedAt: assignee.assignedAt,
            student: assignee.student
              ? {
                  id: assignee.student.id,
                  studentNumber: assignee.student.studentNumber,
                  fullName:
                    `${assignee.student.user?.firstName ?? ''} ${assignee.student.user?.lastName ?? ''}`.trim(),
                  firstName: assignee.student.user?.firstName,
                  lastName: assignee.student.user?.lastName,
                  email: assignee.student.user?.email,
                }
              : null,
          }))
        : [],
    };
  }

  private mapAssignmentGrade(grade: any) {
    if (!grade) {
      return null;
    }

    return {
      id: grade.id,
      assignmentId: grade.assignmentId,
      studentId: grade.studentId,
      teacherId: grade.teacherId,
      classId: grade.classId,
      subjectId: grade.subjectId,
      termId: grade.termId,
      score: grade.score ?? null,
      maxScore: grade.maxScore ?? null,
      percentage: grade.percentage,
      // Note: grade, gpa, feedback, and comments are handled by CAComponentGrade
      isLate: grade.isLate,
      latePenaltyApplied: grade.latePenaltyApplied,
      resubmissionCount: grade.resubmissionCount,
      attemptNumber: grade.attemptNumber,
      gradedAt: grade.gradedAt,
      submittedAt: grade.submittedAt,
      recordedAt: grade.recordedAt,
      recordedBy: grade.recordedBy,
      lastModified: grade.lastModified,
      modifiedBy: grade.modifiedBy,
      isActive: grade.isActive,
      isPublished: grade.isPublished,
      publishedAt: grade.publishedAt,
      assignment: grade.assignment
        ? {
            id: grade.assignment.id,
            title: grade.assignment.title,
            dueDate: grade.assignment.dueDate,
            weight: grade.assignment.weight,
            category: grade.assignment.category,
            type: grade.assignment.type,
          }
        : null,
      student: grade.student
        ? {
            id: grade.student.id,
            studentNumber: grade.student.studentNumber,
            fullName: `${grade.student.user?.firstName || ''} ${grade.student.user?.lastName || ''}`.trim(),
            firstName: grade.student.user?.firstName,
            lastName: grade.student.user?.lastName,
            email: grade.student.user?.email,
          }
        : null,
      subject: grade.subject
        ? {
            id: grade.subject.id,
            name: grade.subject.name,
            code: grade.subject.code,
          }
        : null,
      class: grade.class
        ? {
            id: grade.class.id,
            name: grade.class.name,
            shortName: grade.class.shortName,
          }
        : null,
      term: grade.term
        ? {
            id: grade.term.id,
            name: grade.term.name,
            academicYear: grade.term.academicYear,
          }
        : null,
    };
  }

  private mapCAComponentGrade(grade: any) {
    if (!grade) {
      return null;
    }

    return {
      id: grade.id,
      studentId: grade.studentId,
      teacherId: grade.teacherId,
      subjectId: grade.subjectId,
      classId: grade.classId,
      termId: grade.termId,
      componentType: grade.componentType,
      componentName: grade.componentName,
      score: grade.score ?? null,
      maxScore: grade.maxScore ?? null,
      grade: grade.grade,
      percentage: grade.percentage,
      gpa: grade.gpa,
      feedback: grade.feedback,
      notes: grade.notes,
      gradedAt: grade.gradedAt,
      recordedAt: grade.recordedAt,
      recordedBy: grade.recordedBy,
      lastModified: grade.lastModified,
      modifiedBy: grade.modifiedBy,
      isActive: grade.isActive,
      isPublished: grade.isPublished,
      publishedAt: grade.publishedAt,
      student: grade.student
        ? {
            id: grade.student.id,
            studentNumber: grade.student.studentNumber,
            fullName: `${grade.student.user?.firstName || ''} ${grade.student.user?.lastName || ''}`.trim(),
            firstName: grade.student.user?.firstName,
            lastName: grade.student.user?.lastName,
            email: grade.student.user?.email,
          }
        : null,
      subject: grade.subject
        ? {
            id: grade.subject.id,
            name: grade.subject.name,
            code: grade.subject.code,
          }
        : null,
      class: grade.class
        ? {
            id: grade.class.id,
            name: grade.class.name,
            shortName: grade.class.shortName,
          }
        : null,
      term: grade.term
        ? {
            id: grade.term.id,
            name: grade.term.name,
            academicYear: grade.term.academicYear,
          }
        : null,
    };
  }

  /**
   * @deprecated This function is deprecated. Use mapAssignmentGrade() or mapCAComponentGrade() instead.
   * Kept for backward compatibility during migration period.
   */
  private mapAcademicRecord(record: any) {
    if (!record) {
      return null;
    }

    // Legacy function - AcademicRecord fields have been moved to AssignmentGrade and CAComponentGrade
    // This function is kept for backward compatibility only
    return {
      id: record.id,
      assignmentId: record.assignmentId || null,
      classId: record.classId,
      subjectId: record.subjectId,
      termId: record.termId,
      score: null, // Moved to AssignmentGrade.score or CAComponentGrade.score
      maxScore: null, // Moved to AssignmentGrade.maxScore or CAComponentGrade.maxScore
      grade: null, // Moved to AssignmentGrade.grade or CAComponentGrade.grade
      percentage: null, // Moved to AssignmentGrade.percentage or CAComponentGrade.percentage
      gpa: null, // Moved to AssignmentGrade.gpa or CAComponentGrade.gpa
      feedback: null, // No longer used
      gradedAt: null, // Moved to AssignmentGrade.gradedAt or CAComponentGrade.gradedAt
      assignment: record.assignment
        ? {
            id: record.assignment.id,
            title: record.assignment.title,
            dueDate: record.assignment.dueDate,
            weight: record.assignment.weight,
            category: record.assignment.category,
          }
        : null,
      subject: record.subject
        ? {
            id: record.subject.id,
            name: record.subject.name,
          }
        : null,
      class: record.class
        ? {
            id: record.class.id,
            name: record.class.name,
            shortName: record.class.shortName,
          }
        : null,
      term: record.term
        ? {
            id: record.term.id,
            name: record.term.name,
          }
        : null,
      student: record.student
        ? {
            id: record.student.id,
            studentNumber: record.student.studentNumber,
            currentClassId: record.student.currentClassId,
            firstName: record.student.user?.firstName,
            lastName: record.student.user?.lastName,
            fullName:
              `${record.student.user?.firstName || ''} ${
                record.student.user?.lastName || ''
              }`.trim(),
          }
        : null,
    };
  }

  async getProfile(userId: string) {
    const teacher = await this.getTeacherByUserId(userId);
    return this.mapTeacherProfile(teacher);
  }

  async getAssignments(userId: string) {
    const teacher = await this.getTeacherByUserId(userId);

    const assignments = await this.prisma.teacherAssignment.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true,
      },
      include: {
        class: {
          include: {
            level: true,
          },
        },
        subject: true,
      },
      orderBy: [{ academicYear: 'desc' }, { createdAt: 'desc' }],
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      academicYear: assignment.academicYear,
      isFormTeacher: assignment.isFormTeacher,
      class: assignment.class
        ? {
            id: assignment.class.id,
            name: assignment.class.name,
            shortName: assignment.class.shortName,
            level: assignment.class.level
              ? {
                  id: assignment.class.level.id,
                  name: assignment.class.level.name,
                }
              : null,
          }
        : null,
      subject: assignment.subject
        ? {
            id: assignment.subject.id,
            name: assignment.subject.name,
            code: assignment.subject.code,
          }
        : null,
    }));
  }

  async getAssignmentDetails(userId: string) {
    const teacher = await this.getTeacherByUserId(userId);

    const assignments = await this.prisma.assignment.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true, // Only return active (not deleted) assignments
      },
      include: {
        class: {
          include: {
            level: true,
          },
        },
        subject: true,
        term: true,
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    const assignmentIds = assignments.map((assignment) => assignment.id);

    const assigneeRecords = assignmentIds.length
      ? await (this.prisma as any).assignmentAssignee.findMany({
          where: {
            assignmentId: {
              in: assignmentIds,
            },
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        })
      : [];

    const assigneesByAssignment = (assigneeRecords as any[]).reduce(
      (acc: Record<string, any[]>, assignee: any) => {
        if (!acc[assignee.assignmentId]) {
          acc[assignee.assignmentId] = [];
        }
        acc[assignee.assignmentId].push(assignee);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return assignments.map((assignment) =>
      this.mapAssignmentDetail({
        ...assignment,
        assignees: assigneesByAssignment[assignment.id] ?? [],
      }),
    );
  }

  async createAssignment(userId: string, createAssignmentDto: CreateAssignmentDto) {
    const teacher = await this.getTeacherByUserId(userId);
    const {
      classId,
      subjectId,
      termId,
      title,
      description,
      dueDate,
      maxScore,
      studentIds,
      weight,
      type,
      category,
      allowLateSubmission,
      latePenalty,
      allowResubmission,
      maxResubmissions,
      isGroupAssignment,
      groupSize,
      learningObjectives,
      tags,
    } = createAssignmentDto;

    const teacherAssignment = await this.prisma.teacherAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        classId,
        subjectId,
        isActive: true,
      },
    });

    if (!teacherAssignment) {
      throw new ForbiddenException('You are not assigned to this class and subject.');
    }

    let resolvedTermId = termId ?? teacherAssignment.termId ?? null;

    if (!resolvedTermId) {
      const activeTerm = await this.prisma.academicTerm.findFirst({
        where: {
          schoolId: teacher.schoolId,
          isActive: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });

      if (!activeTerm) {
        throw new BadRequestException(
          'No academic term available. Please contact your school administrator to configure academic terms.',
        );
      }

      resolvedTermId = activeTerm.id;
    }

    // If studentIds are provided, validate them; otherwise, fetch all students in the class
    let eligibleStudents: { id: string }[];
    
    if (studentIds && studentIds.length > 0) {
      const uniqueStudentIds = Array.from(new Set(studentIds));
      const studentWhere: Prisma.StudentWhereInput = {
        schoolId: teacher.schoolId,
        currentClassId: classId,
        id: {
          in: uniqueStudentIds,
        },
      };

      eligibleStudents = await this.prisma.student.findMany({
        where: studentWhere,
        select: {
          id: true,
        },
      });

      if (eligibleStudents.length !== uniqueStudentIds.length) {
        throw new BadRequestException(
          'One or more selected students are not part of the chosen class or do not belong to your school.',
        );
      }
    } else {
      // Automatically assign to all students in the class
      eligibleStudents = await this.prisma.student.findMany({
        where: {
          schoolId: teacher.schoolId,
          currentClassId: classId,
        },
        select: {
          id: true,
        },
      });
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(parsedDueDate.getTime())) {
      throw new BadRequestException('Invalid due date provided.');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        title,
        description: description ?? '',
        subjectId,
        classId,
        teacherId: teacher.id,
        termId: resolvedTermId,
        dueDate: parsedDueDate,
        maxScore: maxScore ?? null,
        weight: weight ?? 1,
        type: type ?? AssignmentType.HOMEWORK,
        category: category ?? AssignmentCategory.FORMATIVE,
        allowLateSubmission: allowLateSubmission ?? true,
        latePenalty: latePenalty ?? 0,
        allowResubmission: allowResubmission ?? false,
        maxResubmissions: allowResubmission ? maxResubmissions ?? 0 : 0,
        isGroupAssignment: isGroupAssignment ?? false,
        groupSize: isGroupAssignment ? groupSize ?? null : null,
        learningObjectives: learningObjectives ?? [],
        tags: tags ?? [],
        createdBy: teacher.user?.email || teacher.userId,
      },
    });

    await (this.prisma as any).assignmentAssignee.createMany({
      data: eligibleStudents.map((student) => ({
        assignmentId: assignment.id,
        studentId: student.id,
      })),
      skipDuplicates: true,
    });

    const assignmentRecord = await this.prisma.assignment.findUnique({
      where: { id: assignment.id },
      include: {
        class: {
          include: {
            level: true,
          },
        },
        subject: true,
        term: true,
      },
    });

    if (!assignmentRecord) {
      throw new NotFoundException('Assignment not found after creation.');
    }

    const assignees = await (this.prisma as any).assignmentAssignee.findMany({
      where: { assignmentId: assignment.id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.mapAssignmentDetail({
      ...assignmentRecord,
      assignees,
    });
  }

  async getTerms(userId: string) {
    const teacher = await this.getTeacherByUserId(userId);

    const terms = await this.prisma.academicTerm.findMany({
      where: {
        schoolId: teacher.schoolId,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return terms.map((term) => ({
      id: term.id,
      name: term.name,
      academicYear: term.academicYear,
      startDate: term.startDate,
      endDate: term.endDate,
      isActive: term.isActive,
    }));
  }

  async getClassStudents(userId: string, classId: string, subjectId?: string) {
    const teacher = await this.getTeacherByUserId(userId);

    const baseAssignmentWhere: Prisma.TeacherAssignmentWhereInput = {
      teacherId: teacher.id,
      classId,
      isActive: true,
      ...(subjectId && { subjectId }),
    };

    let assignment = await this.prisma.teacherAssignment.findFirst({
      where: baseAssignmentWhere,
    });

    if (!assignment && subjectId) {
      assignment = await this.prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          classId,
          isActive: true,
          isFormTeacher: true,
        },
      });
    }

    if (!assignment) {
      throw new ForbiddenException(
        subjectId ? 'You are not assigned to this class for the requested subject' : 'You are not assigned to this class',
      );
    }

    const studentWhere: Prisma.StudentWhereInput = {
      currentClassId: classId,
      schoolId: teacher.schoolId,
    };

    if (subjectId) {
      studentWhere.subjectEnrollments = {
        some: {
          subjectId,
          classId,
          isActive: true,
        },
      };
    }

    const students = await this.prisma.student.findMany({
      where: studentWhere,
      include: {
        user: true,
        subjectEnrollments: {
          where: subjectId
            ? {
                subjectId,
                classId,
                isActive: true,
              }
            : {
                classId,
                isActive: true,
              },
          include: {
            subject: true,
          },
        },
        parentRelationships: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    return students.map((student) => ({
      id: student.id,
      studentNumber: student.studentNumber,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      fullName: `${student.user.firstName} ${student.user.lastName}`.trim(),
      email: student.user.email,
      status: student.status,
      dateOfBirth: student.dateOfBirth,
      subjects: student.subjectEnrollments.map((enrollment) => ({
        subjectId: enrollment.subjectId,
        subjectName: enrollment.subject?.name,
        academicYear: enrollment.academicYear,
        isElective: enrollment.isElective,
      })),
      parentContacts: student.parentRelationships.map((relationship) => ({
        relationshipId: relationship.id,
        relationshipType: relationship.relationshipType,
        parentId: relationship.parent?.id,
        parentName: relationship.parent?.user
          ? `${relationship.parent.user.firstName} ${relationship.parent.user.lastName}`.trim()
          : undefined,
        parentEmail: relationship.parent?.user?.email,
      })),
    }));
  }

  async getAttendance(userId: string, filters: AttendanceFilters) {
    const teacher = await this.getTeacherByUserId(userId);

    const where: Prisma.AttendanceRecordWhereInput = {
      teacherId: teacher.id,
    };

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.termId) {
      where.termId = filters.termId;
    }

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        class: true,
        term: true,
        subject: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 500,
    });

    const summary = records.reduce(
      (acc, record) => {
        acc.total += 1;
        acc.byStatus[record.status] = (acc.byStatus[record.status] || 0) + 1;
        return acc;
      },
      { total: 0, byStatus: {} as Record<string, number> },
    );

    return {
      summary,
      records: records.map((record) => ({
        id: record.id,
        date: record.date,
        status: record.status,
        reason: record.reason,
        student: record.student
          ? {
              id: record.student.id,
              studentNumber: record.student.studentNumber,
              firstName: record.student.user.firstName,
              lastName: record.student.user.lastName,
              fullName:
                `${record.student.user.firstName} ${record.student.user.lastName}`.trim(),
            }
          : null,
        class: record.class
          ? {
              id: record.class.id,
              name: record.class.name,
              shortName: record.class.shortName,
            }
          : null,
        term: record.term
          ? {
              id: record.term.id,
              name: record.term.name,
            }
          : null,
      })),
    };
  }

  async recordAttendance(userId: string, dto: CreateAttendanceDto) {
    if (!dto.records?.length) {
      throw new BadRequestException('Please provide at least one attendance record.');
    }

    const teacher = await this.getTeacherByUserId(userId);

    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        classId: dto.classId,
        isActive: true,
        ...(dto.subjectId ? { subjectId: dto.subjectId } : {}),
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this class or subject.');
    }

    const term = await this.prisma.academicTerm.findUnique({
      where: { id: dto.termId },
    });

    if (!term) {
      throw new BadRequestException('Invalid term selected.');
    }

    const attendanceDate = new Date(dto.date);
    if (Number.isNaN(attendanceDate.getTime())) {
      throw new BadRequestException('Invalid attendance date.');
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const studentIds = dto.records.map((record) => record.studentId);
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        currentClassId: dto.classId,
      },
      select: { id: true },
    });

    if (students.length !== studentIds.length) {
      throw new BadRequestException('One or more students are not part of this class.');
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete existing attendance records for this date, class, subject, and students
      await tx.attendanceRecord.deleteMany({
        where: {
          teacherId: teacher.id,
          classId: dto.classId,
          ...(dto.subjectId ? { subjectId: dto.subjectId } : {}),
          studentId: { in: studentIds },
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      // Create new attendance records with subjectId
      for (const record of dto.records) {
        await tx.attendanceRecord.create({
          data: {
            studentId: record.studentId,
            classId: dto.classId,
            teacherId: teacher.id,
            termId: dto.termId,
            subjectId: dto.subjectId || null,
            date: attendanceDate,
            status: record.status,
            reason: record.reason?.trim() || null,
            recordedBy: teacher.userId,
          },
        });
      }
    });

    return this.getAttendance(userId, {
      classId: dto.classId,
      termId: dto.termId,
      subjectId: dto.subjectId,
      startDate: startOfDay,
      endDate: endOfDay,
    });
  }

  async getGrades(userId: string, filters: GradeFilters) {
    const teacher = await this.getTeacherByUserId(userId);

    // Read from AssignmentGrade table (NEW: separate table for assignment grades)
    const assignmentGrades = await this.prisma.assignmentGrade.findMany({
      where: {
        teacherId: teacher.id,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.termId && { termId: filters.termId }),
        ...(filters.assignmentId && { assignmentId: filters.assignmentId }),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        assignment: true,
        subject: true,
        class: true,
        term: true,
        teacher: true,
      },
      orderBy: {
        gradedAt: 'desc',
      },
      take: 500,
    });

    return assignmentGrades.map((grade) => this.mapAssignmentGrade(grade));
  }

  async getDashboard(userId: string) {
    const teacher = await this.getTeacherByUserId(userId);

    const [teacherAssignments, assignmentRecords, attendanceRecords, upcomingAssignments] = await Promise.all([
      this.prisma.teacherAssignment.findMany({
        where: { teacherId: teacher.id, isActive: true },
      }),
      this.prisma.assignment.findMany({
        where: { teacherId: teacher.id },
      }),
      this.prisma.attendanceRecord.findMany({
        where: { teacherId: teacher.id },
        take: 500,
      }),
      this.prisma.assignment.findMany({
        where: {
          teacherId: teacher.id,
          dueDate: {
            gte: new Date(), // Only get assignments with future due dates
          },
          isActive: true, // Only active assignments
        },
        orderBy: {
          dueDate: 'asc',
        },
        include: {
          class: true,
          assignees: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        take: 10,
      }),
    ]);

    const classIds = Array.from(new Set(teacherAssignments.map((a) => a.classId)));

    const totalStudents = classIds.length
      ? await this.prisma.student.count({
          where: {
            currentClassId: {
              in: classIds,
            },
            schoolId: teacher.schoolId,
          },
        })
      : 0;

    const totalAssignments = assignmentRecords.length;

    const attendanceSummary = attendanceRecords.reduce(
      (acc, record) => {
        acc.total += 1;
        acc.present += record.status === AttendanceStatus.PRESENT ? 1 : 0;
        return acc;
      },
      { total: 0, present: 0 },
    );

    const averageAttendance = attendanceSummary.total
      ? (attendanceSummary.present / attendanceSummary.total) * 100
      : 0;

    // Get percentages from both AssignmentGrade and CAComponentGrade (NEW: separate tables)
    const assignmentGrades = await this.prisma.assignmentGrade.findMany({
      where: { teacherId: teacher.id },
      select: {
        percentage: true,
      },
      take: 1000,
    });

    const caGrades = await this.prisma.cAComponentGrade.findMany({
      where: { teacherId: teacher.id },
      select: {
        percentage: true,
      },
      take: 1000,
    });

    // Combine all grades for statistics
    const allGrades = [
      ...assignmentGrades.map((g) => g.percentage),
      ...caGrades.map((g) => g.percentage),
    ].filter((p) => p !== null && p !== undefined) as number[];

    const averagePerformance = allGrades.length
      ? allGrades.reduce((sum, p) => sum + p, 0) / allGrades.length
      : 0;

    const atRiskStudents = await Promise.all([
      this.prisma.assignmentGrade.count({
        where: {
          teacherId: teacher.id,
          percentage: {
            lt: 60,
          },
        },
      }),
      this.prisma.cAComponentGrade.count({
        where: {
          teacherId: teacher.id,
          percentage: {
            lt: 60,
          },
        },
      }),
    ]).then(([assignmentCount, caCount]) => assignmentCount + caCount);

    const excellingStudents = await Promise.all([
      this.prisma.assignmentGrade.count({
        where: {
          teacherId: teacher.id,
          percentage: {
            gte: 90,
          },
        },
      }),
      this.prisma.cAComponentGrade.count({
        where: {
          teacherId: teacher.id,
          percentage: {
            gte: 90,
          },
        },
      }),
    ]).then(([assignmentCount, caCount]) => assignmentCount + caCount);

    // Get recent grades from both tables
    const recentAssignmentGrades = await this.prisma.assignmentGrade.findMany({
      where: { teacherId: teacher.id },
      orderBy: { gradedAt: 'desc' },
      take: 5,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        assignment: true,
      },
    });

    const recentCAGrades = await this.prisma.cAComponentGrade.findMany({
      where: { teacherId: teacher.id },
      orderBy: { gradedAt: 'desc' },
      take: 5,
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    // Combine and sort recent grades
    const recentGrades = [
      ...recentAssignmentGrades.map((g) => ({
        ...g,
        type: 'assignment' as const,
      })),
      ...recentCAGrades.map((g) => ({
        ...g,
        type: 'ca' as const,
      })),
    ]
      .sort((a, b) => {
        const aDate = a.gradedAt || a.recordedAt;
        const bDate = b.gradedAt || b.recordedAt;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 5);

    const recentActivity = recentGrades.map((record) => ({
      type: 'grade_entered',
      description:
        record.type === 'assignment' && record.assignment
          ? `Entered grades for ${record.assignment.title}`
          : record.type === 'ca'
            ? `Recorded CA grade`
            : 'Recorded grades',
      timestamp: record.gradedAt || record.recordedAt,
      student: record.student
        ? {
            id: record.student.id,
            firstName: record.student.user?.firstName,
            lastName: record.student.user?.lastName,
          }
        : null,
    }));

    const upcomingAssignmentIds = upcomingAssignments.map((assignment) => assignment.id);

    // Get all graded students for upcoming assignments
    // A student is considered "graded" if they have an AssignmentGrade record with a non-null score
    // Note: Using Set in the reduce function ensures each student is only counted once per assignment
    const upcomingAssignmentGrades = upcomingAssignmentIds.length
      ? await this.prisma.assignmentGrade.findMany({
          where: {
            assignmentId: {
              in: upcomingAssignmentIds,
            },
            score: {
              not: null, // Student has been scored
            },
            isActive: true, // Only count active grades
          },
          select: {
            assignmentId: true,
            studentId: true,
            score: true,
          },
        })
      : [];

    // Group graded students by assignment ID
    // Use Set to ensure each student is only counted once (even if they have multiple attempts)
    const submittedByAssignment = upcomingAssignmentGrades.reduce(
      (acc, record) => {
        if (
          !record.assignmentId ||
          !record.studentId ||
          record.score === null ||
          record.score === undefined
        ) {
          return acc;
        }
        if (!acc[record.assignmentId]) {
          acc[record.assignmentId] = new Set<string>();
        }
        acc[record.assignmentId].add(record.studentId);
        return acc;
      },
      {} as Record<string, Set<string>>,
    );

    // Filter assignments: only show those with pending (ungraded) students
    const upcomingDeadlines = upcomingAssignments
      .map((assignment) => {
        const gradedStudents = submittedByAssignment[assignment.id] ?? new Set<string>();
        const totalAssignees = assignment.assignees?.length ?? 0;
        const gradedCount = gradedStudents.size;
        
        // If assignment has no students assigned, skip it
        if (totalAssignees === 0) {
          return null;
        }
        
        // Check if ALL students have been graded (score exists)
        // If all students are graded, exclude from deadlines regardless of due date
        const allStudentsGraded = gradedCount >= totalAssignees;
        
        if (allStudentsGraded) {
          return null; // Don't show in deadlines - all students are done
        }
        
        // Find students who haven't been graded yet
        const pendingAssignees = (assignment.assignees ?? []).filter(
          (assignee) => !gradedStudents.has(assignee.studentId),
        );

        const pendingStudents = pendingAssignees.map((assignee) => {
          const fullName =
            `${assignee.student?.user?.firstName || ''} ${assignee.student?.user?.lastName || ''}`.trim();
          return {
            id: assignee.student?.id ?? assignee.studentId,
            studentNumber: assignee.student?.studentNumber,
            fullName: fullName || 'Unknown student',
          };
        });

        return {
          id: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          class: assignment.class
            ? {
                id: assignment.class.id,
                name: assignment.class.name,
                shortName: assignment.class.shortName,
              }
            : null,
          pendingStudents,
          pendingCount: pendingStudents.length,
        };
      })
      .filter((deadline) => deadline !== null); // Remove assignments where all students are graded

    return {
      stats: {
        totalStudents,
        totalAssignments,
        averageAttendance,
        averagePerformance,
        atRiskStudents,
        excellingStudents,
      },
      recentActivity,
      upcomingDeadlines,
    };
  }

  async getContinuousAssessment(
    userId: string,
    classId: string,
    subjectId: string,
    termId: string,
  ) {
    const teacher = await this.getTeacherByUserId(userId);

    // Verify teacher assignment
    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        classId,
        subjectId,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'You are not assigned to this class and subject.',
      );
    }

    // Fetch all CA component grades from CAComponentGrade table (NEW: separate table)
    const caGrades = await this.prisma.cAComponentGrade.findMany({
      where: {
        teacherId: teacher.id,
        classId,
        subjectId,
        termId,
        isActive: true,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        studentId: 'asc',
      },
    });

    // Console log: Backend - Fetching CA grades
    console.log('[BACKEND - Service] getContinuousAssessment - Fetched records:', {
      count: caGrades.length,
      records: caGrades.map(g => ({
        studentId: g.studentId,
        caScores: (g as any).caScores,
        grade: g.grade
      }))
    });
    
    // Process grades - each row now contains all CA scores in JSON
    const studentGrades: Record<string, any> = {};

    caGrades.forEach((grade) => {
      const studentId = grade.studentId;
      
      // Initialize student record
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          studentId,
          studentName:
            `${grade.student.user?.firstName || ''} ${
              grade.student.user?.lastName || ''
            }`.trim() ||
            'Unknown',
        };
      }

      // Extract CA scores from JSON field
      const caScores = (grade as any).caScores as Record<string, number> | null;
      
      // Console log: Backend - Processing fetched grade
      console.log('[BACKEND - Service] Processing fetched grade:', {
        studentId,
        caScores,
        caScoresType: typeof caScores,
        isObject: caScores && typeof caScores === 'object'
      });
      
      if (caScores && typeof caScores === 'object') {
        // Process all CA scores from JSON
        Object.keys(caScores).forEach((key) => {
          const score = caScores[key];
          
          console.log('[BACKEND - Service] Processing key from caScores:', {
            studentId,
            key,
            score,
            isExam: key.toUpperCase() === 'EXAM',
            isCA: key.match(/^CA\d+$/i)
          });
          
          if (key.toUpperCase() === 'EXAM') {
            studentGrades[studentId].exam = score;
          } else if (key.match(/^CA\d+$/i)) {
            // Convert to lowercase for consistency (CA1 -> ca1, CA5 -> ca5)
            const caKey = key.toLowerCase();
            studentGrades[studentId][caKey] = score;
          }
        });
      }

      // Add overall grade if available
      if (grade.grade) {
        studentGrades[studentId].grade = grade.grade;
      }
    });
    
    // Console log: Backend - Final response
    console.log('[BACKEND - Service] Final response being returned:', Object.values(studentGrades));

    return Object.values(studentGrades);
  }

  async saveContinuousAssessment(
    userId: string,
    dto: CreateContinuousAssessmentDto,
  ) {
    // Console log: Backend - Service received DTO
    console.log('[BACKEND - Service] saveContinuousAssessment called with:', {
      userId,
      classId: dto.classId,
      subjectId: dto.subjectId,
      termId: dto.termId,
      recordsCount: dto.records.length,
      records: dto.records.map((r: any) => ({
        studentId: r.studentId,
        allKeys: Object.keys(r),
        caFields: Object.keys(r).filter(k => k.match(/^ca\d+$/i)),
        caValues: Object.keys(r).filter(k => k.match(/^ca\d+$/i)).reduce((acc, k) => ({ ...acc, [k]: r[k] }), {}),
        exam: r.exam,
        grade: r.grade
      }))
    });
    
    const teacher = await this.getTeacherByUserId(userId);

    // Verify teacher assignment
    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        classId: dto.classId,
        subjectId: dto.subjectId,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'You are not assigned to this class and subject.',
      );
    }

    // Verify students belong to the class
    // Filter out undefined/null studentIds to avoid Prisma validation error
    const studentIds = dto.records
      .map((r) => r.studentId)
      .filter((id): id is string => id !== undefined && id !== null);
    
    if (studentIds.length === 0) {
      throw new BadRequestException('No valid student IDs provided in records.');
    }
    
    const students = await this.prisma.student.findMany({
      where: {
        schoolId: teacher.schoolId,
        currentClassId: dto.classId,
        id: {
          in: studentIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (students.length !== dto.records.length) {
      throw new BadRequestException(
        'One or more students are not part of the chosen class.',
      );
    }

    // Get AssessmentStructure to validate component types and get max scores
    const classData = await this.prisma.class.findUnique({
      where: { id: dto.classId },
      include: { level: true },
    });

    let assessmentStructure: any = null;
    if (classData?.levelId) {
      assessmentStructure = await this.prisma.assessmentStructure.findUnique({
        where: {
          levelId_schoolId: {
            levelId: classData.levelId,
            schoolId: teacher.schoolId,
          },
        },
      });
    }

    const results: any[] = [];

    // Process each student's grades
    for (const record of dto.records) {
      // Console log: Backend - Processing each record
      console.log('[BACKEND - Service] Processing record for student:', record.studentId, {
        allKeys: Object.keys(record),
        recordData: record
      });
      
      // Build caScores JSON object containing all CA scores and exam
      const caScores: Record<string, number> = {};

      // Dynamically process all CA fields (ca1, ca2, ca3, ..., ca20, etc.)
      // Extract all keys that start with 'ca' followed by a number
      const caFields = Object.keys(record).filter(
        (key) => key.match(/^ca\d+$/i) && record[key] !== undefined && record[key] !== null
      );
      
      // Console log: Backend - CA fields extracted
      console.log('[BACKEND - Service] CA fields extracted:', {
        studentId: record.studentId,
        caFields,
        caFieldValues: caFields.map(k => ({ key: k, value: record[k], type: typeof record[k] }))
      });

      // Add all CA scores to JSON object
      for (const caKey of caFields) {
        const score = typeof record[caKey] === 'string' 
          ? parseFloat(record[caKey] as string) 
          : record[caKey] as number;
        
        // Console log: Backend - Processing each CA field
        console.log('[BACKEND - Service] Processing CA field:', {
          studentId: record.studentId,
          caKey,
          originalValue: record[caKey],
          parsedScore: score,
          isValid: score !== undefined && score !== null && !isNaN(score)
        });

        if (score !== undefined && score !== null && !isNaN(score)) {
          // Convert to uppercase (ca1 -> CA1)
          const caNumber = caKey.toUpperCase();
          caScores[caNumber] = score;
          console.log('[BACKEND - Service] Added to caScores:', caNumber, '=', score);
        } else {
          console.log('[BACKEND - Service] Skipped CA field (invalid):', caKey, 'value:', record[caKey]);
        }
      }

      // Add exam score if provided
      if (record.exam !== undefined && record.exam !== null) {
        const examScore = typeof record.exam === 'string' 
          ? parseFloat(record.exam) 
          : record.exam as number;
        
        console.log('[BACKEND - Service] Processing exam:', {
          studentId: record.studentId,
          originalValue: record.exam,
          parsedScore: examScore,
          isValid: !isNaN(examScore)
        });
        
        if (!isNaN(examScore)) {
          caScores['EXAM'] = examScore;
          console.log('[BACKEND - Service] Added EXAM to caScores:', examScore);
        }
      }
      
      // Console log: Backend - Final caScores object before saving
      console.log('[BACKEND - Service] Final caScores object for student:', record.studentId, caScores);

      // Calculate overall grade, percentage, and GPA
      let overallPercentage = 0;
      let overallGrade = '';
      let overallGPA = 0;

      if (Object.keys(caScores).length > 0 && assessmentStructure) {
        // Calculate total CA score and max CA score
        let totalCAScore = 0;
        let totalCAMaxScore = 0;
        let examScore = 0;
        let examMaxScore = 0;

        // Get CA components from AssessmentStructure
        if (assessmentStructure.caComponents && Array.isArray(assessmentStructure.caComponents)) {
          assessmentStructure.caComponents.forEach((component: any, index: number) => {
            const caKey = `CA${index + 1}`;
            const maxScore = component.maxScore || 10;
            totalCAMaxScore += maxScore;
            
            if (caScores[caKey] !== undefined) {
              totalCAScore += caScores[caKey];
            }
          });
        }

        // Get exam max score from AssessmentStructure
        if (assessmentStructure.examConfig) {
          examMaxScore = assessmentStructure.examConfig.maxScore || 60;
        } else {
          examMaxScore = 60; // Default
        }

        if (caScores['EXAM'] !== undefined) {
          examScore = caScores['EXAM'];
        }

        // Calculate overall percentage: (Total CA + Exam) / (Max CA + Max Exam) * 100
        const totalScore = totalCAScore + examScore;
        const totalMaxScore = totalCAMaxScore + examMaxScore;
        
        if (totalMaxScore > 0) {
          overallPercentage = (totalScore / totalMaxScore) * 100;
          overallGrade = record.grade || this.calculateGrade(overallPercentage);
          overallGPA = this.calculateGPA(overallGrade);
        }
      } else if (record.grade) {
        // If grade is provided but no assessment structure, use provided grade
        overallGrade = record.grade;
        overallGPA = this.calculateGPA(overallGrade);
      }

      // Upsert CAComponentGrade - one row per student/subject/class/term
      // Find existing record first
      const existing = await this.prisma.cAComponentGrade.findFirst({
        where: {
          studentId: record.studentId,
          subjectId: dto.subjectId,
          classId: dto.classId,
          termId: dto.termId,
        },
      });

      const caScoresData: Prisma.InputJsonValue | undefined = 
        Object.keys(caScores).length > 0 ? caScores : undefined;
      
      // Console log: Backend - Before preparing database data
      console.log('[BACKEND - Service] Preparing database data:', {
        studentId: record.studentId,
        caScoresObject: caScores,
        caScoresKeys: Object.keys(caScores),
        caScoresData,
        caScoresDataType: typeof caScoresData,
        overallGrade,
        overallPercentage,
        overallGPA
      });
      
      const updateData: any = {
        caScores: caScoresData,
        grade: overallGrade || null,
        percentage: overallPercentage > 0 ? overallPercentage : null,
        gpa: overallGPA > 0 ? overallGPA : null,
        modifiedBy: teacher.userId,
        gradedAt: new Date(),
      };
      
      const createData: any = {
        studentId: record.studentId,
        teacherId: teacher.id,
        subjectId: dto.subjectId,
        classId: dto.classId,
        termId: dto.termId,
        caScores: caScoresData,
        grade: overallGrade || null,
        percentage: overallPercentage > 0 ? overallPercentage : null,
        gpa: overallGPA > 0 ? overallGPA : null,
        recordedBy: teacher.userId,
        modifiedBy: teacher.userId,
        gradedAt: new Date(),
      };
      
      // Console log: Backend - Before database save
      console.log('[BACKEND - Service] Before database save:', {
        studentId: record.studentId,
        existing: !!existing,
        existingId: existing?.id,
        updateData: JSON.stringify(updateData),
        createData: JSON.stringify(createData),
        caScoresData: JSON.stringify(caScoresData)
      });
      
      const caGrade = existing
        ? await this.prisma.cAComponentGrade.update({
            where: { id: existing.id },
            data: updateData,
          })
        : await this.prisma.cAComponentGrade.create({
            data: createData,
          });

      // Console log: Backend - After database save
      console.log('[BACKEND - Service] After database save:', {
        studentId: record.studentId,
        savedId: caGrade.id,
        savedCaScores: (caGrade as any).caScores,
        savedCaScoresType: typeof (caGrade as any).caScores,
        savedGrade: caGrade.grade,
        savedPercentage: caGrade.percentage,
        savedGPA: caGrade.gpa
      });

      results.push(caGrade);
    }

    return {
      message: 'Continuous assessment grades saved successfully',
      saved: results.length,
    };
  }

  async deleteContinuousAssessment(
    userId: string,
    studentId: string,
    classId: string,
    subjectId: string,
    termId: string,
  ) {
    const teacher = await this.getTeacherByUserId(userId);

    // Verify teacher assignment
    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        classId,
        subjectId,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'You are not assigned to this class and subject.',
      );
    }

    // Delete all CA component grades for this student (NEW: use CAComponentGrade table)
    const deleted = await this.prisma.cAComponentGrade.deleteMany({
      where: {
        teacherId: teacher.id,
        studentId,
        classId,
        subjectId,
        termId,
      },
    });

    return {
      message: 'Continuous assessment grades deleted successfully',
      deleted: deleted.count,
    };
  }

  async saveAssignmentGrade(userId: string, dto: CreateAssignmentGradeDto) {
    const teacher = await this.getTeacherByUserId(userId);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: dto.assignmentId },
      include: {
        class: true,
        subject: true,
        term: true,
      },
    });

    if (!assignment || assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You are not assigned to this assignment.');
    }

    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        schoolId: teacher.schoolId,
      },
    });

    if (!student) {
      throw new BadRequestException('Student not found for this school.');
    }

    const classId = dto.classId || assignment.classId;
    const subjectId = dto.subjectId || assignment.subjectId;
    const termId = dto.termId || assignment.termId;

    if (!classId || !subjectId || !termId) {
      throw new BadRequestException(
        'Class, subject, and term information are required to record grades.',
      );
    }

    const maxScoreValue = dto.maxScore ?? 100;
    const safeMaxScore = maxScoreValue > 0 ? maxScoreValue : 100;
    const rawScore = dto.score ?? 0;
    const safeScore = Math.min(Math.max(rawScore, 0), safeMaxScore);
    const percentage = safeMaxScore > 0 ? (safeScore / safeMaxScore) * 100 : 0;
    // Note: grade is handled by CAComponentGrade, not stored in AssignmentGrade

    // Ensure AssignmentAssignee exists (for tracking assignment-student relationship)
    await (this.prisma as any).assignmentAssignee.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: dto.assignmentId,
          studentId: dto.studentId,
        },
      },
      update: {},
      create: {
        assignmentId: dto.assignmentId,
        studentId: dto.studentId,
      },
    });

    // Update or create AssignmentGrade (NEW: separate table for assignment grades)
    const existingGrade = await this.prisma.assignmentGrade.findFirst({
      where: {
        assignmentId: dto.assignmentId,
        studentId: dto.studentId,
        attemptNumber: 1, // Default to first attempt
      },
    });

    let savedGrade;
    if (existingGrade) {
      savedGrade = await this.prisma.assignmentGrade.update({
        where: { id: existingGrade.id },
        data: {
          score: safeScore,
          maxScore: safeMaxScore,
          percentage,
          // Note: grade, gpa, feedback, and comments are handled by CAComponentGrade
          modifiedBy: teacher.userId,
          gradedAt: new Date(),
        },
      });
    } else {
      savedGrade = await this.prisma.assignmentGrade.create({
        data: {
          assignmentId: dto.assignmentId,
          studentId: dto.studentId,
          teacherId: teacher.id,
          subjectId,
          classId,
          termId,
          score: safeScore,
          maxScore: safeMaxScore,
          percentage,
          // Note: grade, gpa, feedback, and comments are handled by CAComponentGrade
          recordedBy: teacher.userId,
          modifiedBy: teacher.userId,
          gradedAt: new Date(),
        },
      });
    }

    // Fetch hydrated grade with relations
    const hydratedGrade = await this.prisma.assignmentGrade.findUnique({
      where: { id: savedGrade.id },
      include: {
        student: { include: { user: true } },
        assignment: true,
        subject: true,
        class: true,
        term: true,
        teacher: true,
      },
    });

    return this.mapAssignmentGrade(hydratedGrade);
  }

  async deleteAssignment(userId: string, assignmentId: string) {
    const teacher = await this.getTeacherByUserId(userId);

    // Verify the assignment exists and belongs to this teacher
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    if (assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You are not authorized to delete this assignment.');
    }

    // Soft delete: Set isActive to false instead of hard deleting
    // This preserves all student grades (academic records) and assignment data
    await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        isActive: false,
      },
    });

    return {
      message: 'Assignment deleted successfully',
      assignmentId: assignmentId,
    };
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    if (percentage >= 50) return 'E';
    return 'F';
  }

  private calculateGPA(grade: string): number {
    const gradeMap: Record<string, number> = {
      A: 5.0,
      B: 4.0,
      C: 3.0,
      D: 2.0,
      E: 1.0,
      F: 0.0,
    };
    return gradeMap[grade.toUpperCase()] || 0.0;
  }
}

