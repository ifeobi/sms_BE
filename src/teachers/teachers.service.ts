import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AttendanceStatus } from '@prisma/client';

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
        class: true,
        subject: true,
        term: true,
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      termId: assignment.termId,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      weight: assignment.weight,
      category: assignment.category,
      class: assignment.class
        ? {
            id: assignment.class.id,
            name: assignment.class.name,
            shortName: assignment.class.shortName,
          }
        : null,
      subject: assignment.subject
        ? {
            id: assignment.subject.id,
            name: assignment.subject.name,
          }
        : null,
      term: assignment.term
        ? {
            id: assignment.term.id,
            name: assignment.term.name,
          }
        : null,
    }));
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
}

