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

interface AttendanceFilters {
  classId?: string;
  termId?: string;
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
        fullName: teacher.user.fullName || `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
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
      instructions: assignment.instructions,
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
                    assignee.student.user?.fullName ||
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
      studentIds,
      maxScore,
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
        instructions: description ?? 'No instructions provided.',
        subjectId,
        classId,
        teacherId: teacher.id,
        termId: resolvedTermId,
        dueDate: parsedDueDate,
        maxScore: maxScore ?? 100,
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
      fullName: student.user.fullName || `${student.user.firstName} ${student.user.lastName}`.trim(),
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
                record.student.user.fullName ||
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
      await tx.attendanceRecord.deleteMany({
        where: {
          teacherId: teacher.id,
          classId: dto.classId,
          studentId: { in: studentIds },
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      for (const record of dto.records) {
        await tx.attendanceRecord.create({
          data: {
            studentId: record.studentId,
            classId: dto.classId,
            teacherId: teacher.id,
            termId: dto.termId,
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
      startDate: startOfDay,
      endDate: endOfDay,
    });
  }

  async getGrades(userId: string, filters: GradeFilters) {
    const teacher = await this.getTeacherByUserId(userId);

    const where: Prisma.AcademicRecordWhereInput = {
      teacherId: teacher.id,
    };

    if (filters.classId) {
      where.classId = filters.classId;
    }
    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }
    if (filters.termId) {
      where.termId = filters.termId;
    }
    if (filters.assignmentId) {
      where.assignmentId = filters.assignmentId;
    }

    const records = await this.prisma.academicRecord.findMany({
      where,
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
      },
      orderBy: {
        gradedAt: 'desc',
      },
      take: 500,
    });

    return records.map((record) => ({
      id: record.id,
      score: record.score,
      maxScore: record.maxScore,
      grade: record.grade,
      percentage: record.percentage,
      gpa: record.gpa,
      comments: record.comments,
      feedback: record.feedback,
      gradedAt: record.gradedAt,
      assignment: record.assignment
        ? {
            id: record.assignment.id,
            title: record.assignment.title,
            dueDate: record.assignment.dueDate,
            maxScore: record.assignment.maxScore,
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
            firstName: record.student.user.firstName,
            lastName: record.student.user.lastName,
            fullName:
              record.student.user.fullName ||
              `${record.student.user.firstName} ${record.student.user.lastName}`.trim(),
          }
        : null,
    }));
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
            gte: new Date(),
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        include: {
          class: true,
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

    const academicRecords = await this.prisma.academicRecord.findMany({
      where: { teacherId: teacher.id },
      select: {
        percentage: true,
      },
      take: 1000,
    });

    const averagePerformance = academicRecords.length
      ? academicRecords.reduce((sum, record) => sum + record.percentage, 0) / academicRecords.length
      : 0;

    const atRiskStudents = await this.prisma.academicRecord.count({
      where: {
        teacherId: teacher.id,
        percentage: {
          lt: 60,
        },
      },
    });

    const excellingStudents = await this.prisma.academicRecord.count({
      where: {
        teacherId: teacher.id,
        percentage: {
          gte: 90,
        },
      },
    });

    const recentGrades = await this.prisma.academicRecord.findMany({
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

    const recentActivity = recentGrades.map((record) => ({
      type: 'grade_entered',
      description: record.assignment
        ? `Entered grades for ${record.assignment.title}`
        : 'Recorded grades',
      timestamp: record.gradedAt,
      student: record.student
        ? {
            id: record.student.id,
            firstName: record.student.user.firstName,
            lastName: record.student.user.lastName,
          }
        : null,
    }));

    const upcomingDeadlines = upcomingAssignments.map((assignment) => ({
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
    }));

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

    // Fetch all CA-related academic records for this class/subject/term
    // Using a special pattern: assignmentId starting with "CA_" for continuous assessment
    const records = await this.prisma.academicRecord.findMany({
      where: {
        teacherId: teacher.id,
        classId,
        subjectId,
        termId,
        OR: [
          { assignmentId: { startsWith: 'CA_' } },
          { assignmentId: null },
        ],
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

    // Group records by student
    const studentGrades: Record<
      string,
      {
        studentId: string;
        studentName: string;
        ca1?: number;
        ca2?: number;
        ca3?: number;
        ca4?: number;
        exam?: number;
        grade?: string;
      }
    > = {};

    records.forEach((record) => {
      const studentId = record.studentId;
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          studentId,
          studentName:
            record.student.user?.fullName ||
            `${record.student.user?.firstName || ''} ${
              record.student.user?.lastName || ''
            }`.trim() ||
            'Unknown',
        };
      }

      // Extract CA type from assignmentId (e.g., "CA_CA1", "CA_CA2", etc.)
      const caType = record.assignmentId?.replace('CA_', '');
      const score = record.score;
      const grade = record.grade;

      if (caType === 'CA1') {
        studentGrades[studentId].ca1 = score;
      } else if (caType === 'CA2') {
        studentGrades[studentId].ca2 = score;
      } else if (caType === 'CA3') {
        studentGrades[studentId].ca3 = score;
      } else if (caType === 'CA4') {
        studentGrades[studentId].ca4 = score;
      } else if (caType === 'EXAM') {
        studentGrades[studentId].exam = score;
        studentGrades[studentId].grade = grade;
      }
    });

    return Object.values(studentGrades);
  }

  async saveContinuousAssessment(
    userId: string,
    dto: CreateContinuousAssessmentDto,
  ) {
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
    const students = await this.prisma.student.findMany({
      where: {
        schoolId: teacher.schoolId,
        currentClassId: dto.classId,
        id: {
          in: dto.records.map((r) => r.studentId),
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

    const results: any[] = [];

    // Process each student's grades
    for (const record of dto.records) {
      const caTypes = [
        { key: 'ca1', assignmentId: 'CA_CA1' },
        { key: 'ca2', assignmentId: 'CA_CA2' },
        { key: 'ca3', assignmentId: 'CA_CA3' },
        { key: 'ca4', assignmentId: 'CA_CA4' },
        { key: 'exam', assignmentId: 'CA_EXAM' },
      ];

      for (const caType of caTypes) {
        const score = record[caType.key as keyof typeof record] as
          | number
          | undefined;

        if (score !== undefined && score !== null) {
          // Calculate percentage and grade
          const maxScore = 100;
          const percentage = (score / maxScore) * 100;
          const grade = this.calculateGrade(percentage);

          // Delete existing record if any
          await this.prisma.academicRecord.deleteMany({
            where: {
              teacherId: teacher.id,
              studentId: record.studentId,
              classId: dto.classId,
              subjectId: dto.subjectId,
              termId: dto.termId,
              assignmentId: caType.assignmentId,
            },
          });

          // Create new record
          const academicRecord = await this.prisma.academicRecord.create({
            data: {
              studentId: record.studentId,
              teacherId: teacher.id,
              subjectId: dto.subjectId,
              classId: dto.classId,
              termId: dto.termId,
              assignmentId: caType.assignmentId,
              score,
              maxScore,
              grade: caType.key === 'exam' ? record.grade || grade : grade,
              percentage,
              gpa: this.calculateGPA(grade),
              recordedBy: teacher.userId,
              modifiedBy: teacher.userId,
            },
          });

          results.push(academicRecord);
        }
      }

      // If grade is provided separately, update the exam record's grade
      if (record.grade) {
        await this.prisma.academicRecord.updateMany({
          where: {
            teacherId: teacher.id,
            studentId: record.studentId,
            classId: dto.classId,
            subjectId: dto.subjectId,
            termId: dto.termId,
            assignmentId: 'CA_EXAM',
          },
          data: {
            grade: record.grade,
          },
        });
      }
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

    // Delete all CA records for this student
    const deleted = await this.prisma.academicRecord.deleteMany({
      where: {
        teacherId: teacher.id,
        studentId,
        classId,
        subjectId,
        termId,
        assignmentId: {
          startsWith: 'CA_',
        },
      },
    });

    return {
      message: 'Continuous assessment grades deleted successfully',
      deleted: deleted.count,
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

