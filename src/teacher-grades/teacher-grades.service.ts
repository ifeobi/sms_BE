import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateGradeDto,
  UpdateGradeDto,
  AssignmentResponseDto,
  GradeResponseDto,
  TeacherGradesOverviewDto,
} from './dto/teacher-grades.dto';

@Injectable()
export class TeacherGradesService {
  private readonly logger = new Logger(TeacherGradesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getGradesOverview(teacherUserId: string): Promise<TeacherGradesOverviewDto> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
        include: {
          user: true,
        },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Get teacher assignments
      const teacherAssignments = await this.prisma.teacherAssignment.findMany({
        where: {
          teacherId: teacher.id,
          isActive: true,
        },
        include: {
          class: true,
          subject: true,
        },
      });

      // Get assignments created by this teacher
      const assignments = await this.prisma.assignment.findMany({
        where: {
          teacherId: teacher.id,
        },
        include: {
          class: true,
          subject: true,
          term: true,
          academicRecords: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Get all academic records for this teacher
      const academicRecords = await this.prisma.academicRecord.findMany({
        where: {
          teacherId: teacher.id,
        },
        include: {
          assignment: true,
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      // Calculate overview statistics
      const totalAssignments = assignments.length;
      const totalGrades = academicRecords.length;
      
      // Calculate pending grades (students without grades for assignments)
      const pendingGrades = assignments.reduce((pending, assignment) => {
        const gradedStudents = new Set(
          assignment.academicRecords.map(record => record.studentId)
        );
        
        // Get all students in the class
        const classStudents = teacherAssignments
          .filter(ta => ta.classId === assignment.classId)
          .length;
        
        return pending + Math.max(0, classStudents - gradedStudents.size);
      }, 0);

      // Calculate average performance
      const averagePerformance = academicRecords.length > 0
        ? academicRecords.reduce((sum, record) => sum + record.percentage, 0) / academicRecords.length
        : 0;

      // Get classes with assignment data
      const classStats = teacherAssignments.map(ta => {
        const classAssignments = assignments.filter(a => a.classId === ta.classId);
        const classGrades = academicRecords.filter(ar => ar.classId === ta.classId);
        const averageScore = classGrades.length > 0
          ? classGrades.reduce((sum, grade) => sum + grade.percentage, 0) / classGrades.length
          : 0;

        return {
          id: ta.classId,
          name: ta.class.name,
          subjectCount: teacherAssignments.filter(t => t.classId === ta.classId).length,
          assignmentCount: classAssignments.length,
          averageScore: Math.round(averageScore * 100) / 100,
        };
      });

      // Remove duplicates and get unique classes
      const uniqueClasses = classStats.filter((classStat, index, self) => 
        index === self.findIndex(c => c.id === classStat.id)
      );

      // Get recent assignments
      const recentAssignments = assignments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(assignment => {
          const gradedCount = assignment.academicRecords.length;
          const totalStudents = teacherAssignments
            .filter(ta => ta.classId === assignment.classId)
            .length;

          return {
            id: assignment.id,
            title: assignment.title,
            class: assignment.class.name,
            subject: assignment.subject.name,
            dueDate: assignment.dueDate,
            gradedCount,
            totalStudents,
          };
        });

      return {
        totalAssignments,
        totalGrades,
        pendingGrades,
        averagePerformance: Math.round(averagePerformance * 100) / 100,
        classes: uniqueClasses,
        recentAssignments,
      };
    } catch (error) {
      this.logger.error('Error getting grades overview:', error);
      throw new HttpException(
        error.message || 'Failed to get grades overview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAssignments(teacherUserId: string, filters: any): Promise<AssignmentResponseDto[]> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Build where clause
      const whereClause: any = {
        teacherId: teacher.id,
      };

      if (filters.classId) {
        whereClause.classId = filters.classId;
      }
      if (filters.subjectId) {
        whereClause.subjectId = filters.subjectId;
      }
      if (filters.termId) {
        whereClause.termId = filters.termId;
      }

      const assignments = await this.prisma.assignment.findMany({
        where: whereClause,
        include: {
          subject: true,
          class: true,
          term: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: {
          id: assignment.subject.id,
          name: assignment.subject.name,
        },
        class: {
          id: assignment.class.id,
          name: assignment.class.name,
        },
        term: {
          id: assignment.term.id,
          name: assignment.term.name,
          academicYear: assignment.term.academicYear,
        },
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        weight: assignment.weight,
        type: assignment.type,
        category: assignment.category,
        allowLateSubmission: assignment.allowLateSubmission,
        latePenalty: assignment.latePenalty,
        allowResubmission: assignment.allowResubmission,
        maxResubmissions: assignment.maxResubmissions,
        isGroupAssignment: assignment.isGroupAssignment,
        groupSize: assignment.groupSize || 2,
        instructions: assignment.instructions,
        learningObjectives: assignment.learningObjectives,
        tags: assignment.tags,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      }));
    } catch (error) {
      this.logger.error('Error getting assignments:', error);
      throw new HttpException(
        error.message || 'Failed to get assignments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGrades(teacherUserId: string, filters: any): Promise<GradeResponseDto[]> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Build where clause
      const whereClause: any = {
        teacherId: teacher.id,
      };

      if (filters.classId) {
        whereClause.classId = filters.classId;
      }
      if (filters.subjectId) {
        whereClause.subjectId = filters.subjectId;
      }
      if (filters.termId) {
        whereClause.termId = filters.termId;
      }
      if (filters.assignmentId) {
        whereClause.assignmentId = filters.assignmentId;
      }

      const academicRecords = await this.prisma.academicRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: true,
            },
          },
          subject: true,
          class: true,
          assignment: true,
          term: true,
        },
        orderBy: { gradedAt: 'desc' },
      });

      return academicRecords.map(record => ({
        id: record.id,
        student: {
          id: record.student.id,
          studentNumber: record.student.studentNumber,
          name: `${record.student.user.firstName} ${record.student.user.lastName}`,
          email: record.student.user.email,
        },
        subject: {
          id: record.subject.id,
          name: record.subject.name,
        },
        class: {
          id: record.class.id,
          name: record.class.name,
        },
        assignment: record.assignment ? {
          id: record.assignment.id,
          title: record.assignment.title,
        } : undefined,
        term: {
          id: record.term.id,
          name: record.term.name,
          academicYear: record.term.academicYear,
        },
        score: record.score,
        maxScore: record.maxScore,
        grade: record.grade,
        percentage: record.percentage,
        gpa: record.gpa,
        comments: record.comments,
        feedback: record.feedback,
        isLate: record.isLate,
        latePenaltyApplied: record.latePenaltyApplied,
        resubmissionCount: record.resubmissionCount,
        gradedAt: record.gradedAt,
        recordedAt: record.recordedAt,
        isPublished: record.isPublished,
        publishedAt: record.publishedAt,
      }));
    } catch (error) {
      this.logger.error('Error getting grades:', error);
      throw new HttpException(
        error.message || 'Failed to get grades',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStudentsForGrading(teacherUserId: string, classId: string) {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Verify teacher is assigned to this class
      const teacherAssignment = await this.prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          classId: classId,
          isActive: true,
        },
      });

      if (!teacherAssignment) {
        throw new HttpException('Teacher not assigned to this class', HttpStatus.FORBIDDEN);
      }

      // Get students in the class
      const students = await this.prisma.student.findMany({
        where: {
          currentClassId: classId,
        },
        include: {
          user: true,
          currentClass: true,
        },
        orderBy: {
          user: {
            firstName: 'asc',
          },
        },
      });

      return students.map(student => ({
        id: student.id,
        studentNumber: student.studentNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        phone: student.user.phone,
        profilePicture: student.user.profilePicture,
        currentClass: {
          id: student.currentClass.id,
          name: student.currentClass.name,
        },
      }));
    } catch (error) {
      this.logger.error('Error getting students for grading:', error);
      throw new HttpException(
        error.message || 'Failed to get students',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAssignment(teacherUserId: string, createAssignmentDto: CreateAssignmentDto): Promise<AssignmentResponseDto> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Verify teacher is assigned to this class and subject
      const teacherAssignment = await this.prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          classId: createAssignmentDto.classId,
          subjectId: createAssignmentDto.subjectId,
          isActive: true,
        },
      });

      if (!teacherAssignment) {
        throw new HttpException('Teacher not assigned to this class/subject combination', HttpStatus.FORBIDDEN);
      }

      // Create assignment
      const assignment = await this.prisma.assignment.create({
        data: {
          title: createAssignmentDto.title,
          description: createAssignmentDto.description,
          subjectId: createAssignmentDto.subjectId,
          classId: createAssignmentDto.classId,
          termId: createAssignmentDto.termId,
          teacherId: teacher.id,
          dueDate: new Date(createAssignmentDto.dueDate),
          maxScore: createAssignmentDto.maxScore,
          weight: createAssignmentDto.weight,
          type: createAssignmentDto.type as any,
          category: createAssignmentDto.category as any,
          allowLateSubmission: createAssignmentDto.allowLateSubmission ?? true,
          latePenalty: createAssignmentDto.latePenalty ?? 0,
          allowResubmission: createAssignmentDto.allowResubmission ?? false,
          maxResubmissions: createAssignmentDto.maxResubmissions ?? 0,
          isGroupAssignment: createAssignmentDto.isGroupAssignment ?? false,
          groupSize: createAssignmentDto.groupSize ?? 2,
          instructions: createAssignmentDto.instructions || "",
          learningObjectives: createAssignmentDto.learningObjectives,
          tags: createAssignmentDto.tags,
          createdBy: teacher.id,
        },
        include: {
          subject: true,
          class: true,
          term: true,
        },
      });

      // Fetch the assignment with includes to get related data
      const assignmentWithRelations = await this.prisma.assignment.findUnique({
        where: { id: assignment.id },
        include: {
          subject: true,
          class: true,
          term: true,
        },
      });

      if (!assignmentWithRelations) {
        throw new HttpException('Assignment not found after creation', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        id: assignmentWithRelations.id,
        title: assignmentWithRelations.title,
        description: assignmentWithRelations.description,
        subject: {
          id: assignmentWithRelations.subject.id,
          name: assignmentWithRelations.subject.name,
        },
        class: {
          id: assignmentWithRelations.class.id,
          name: assignmentWithRelations.class.name,
        },
        term: {
          id: assignmentWithRelations.term.id,
          name: assignmentWithRelations.term.name,
          academicYear: assignmentWithRelations.term.academicYear,
        },
        dueDate: assignmentWithRelations.dueDate,
        maxScore: assignmentWithRelations.maxScore,
        weight: assignmentWithRelations.weight,
        type: assignmentWithRelations.type,
        category: assignmentWithRelations.category,
        allowLateSubmission: assignmentWithRelations.allowLateSubmission,
        latePenalty: assignmentWithRelations.latePenalty,
        allowResubmission: assignmentWithRelations.allowResubmission,
        maxResubmissions: assignmentWithRelations.maxResubmissions,
        isGroupAssignment: assignmentWithRelations.isGroupAssignment,
        groupSize: assignmentWithRelations.groupSize || 2,
        instructions: assignmentWithRelations.instructions,
        learningObjectives: assignmentWithRelations.learningObjectives,
        tags: assignmentWithRelations.tags,
        createdAt: assignmentWithRelations.createdAt,
        updatedAt: assignmentWithRelations.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error creating assignment:', error);
      throw new HttpException(
        error.message || 'Failed to create assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAssignment(teacherUserId: string, assignmentId: string, updateAssignmentDto: UpdateAssignmentDto): Promise<AssignmentResponseDto> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Verify assignment belongs to teacher
      const existingAssignment = await this.prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          teacherId: teacher.id,
        },
      });

      if (!existingAssignment) {
        throw new HttpException('Assignment not found or access denied', HttpStatus.NOT_FOUND);
      }

      // Prepare update data
      const updateData: any = { ...updateAssignmentDto };
      if (updateAssignmentDto.dueDate) {
        updateData.dueDate = new Date(updateAssignmentDto.dueDate);
      }

      // Update assignment
      const assignment = await this.prisma.assignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: {
          subject: true,
          class: true,
          term: true,
        },
      });

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: {
          id: assignment.subject.id,
          name: assignment.subject.name,
        },
        class: {
          id: assignment.class.id,
          name: assignment.class.name,
        },
        term: {
          id: assignment.term.id,
          name: assignment.term.name,
          academicYear: assignment.term.academicYear,
        },
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        weight: assignment.weight,
        type: assignment.type,
        category: assignment.category,
        allowLateSubmission: assignment.allowLateSubmission,
        latePenalty: assignment.latePenalty,
        allowResubmission: assignment.allowResubmission,
        maxResubmissions: assignment.maxResubmissions,
        isGroupAssignment: assignment.isGroupAssignment,
        groupSize: assignment.groupSize || 2,
        instructions: assignment.instructions,
        learningObjectives: assignment.learningObjectives,
        tags: assignment.tags,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error updating assignment:', error);
      throw new HttpException(
        error.message || 'Failed to update assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrUpdateGrades(teacherUserId: string, createGradeDto: CreateGradeDto): Promise<GradeResponseDto[]> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Verify assignment belongs to teacher
      const assignment = await this.prisma.assignment.findFirst({
        where: {
          id: createGradeDto.assignmentId,
          teacherId: teacher.id,
        },
      });

      if (!assignment) {
        throw new HttpException('Assignment not found or access denied', HttpStatus.NOT_FOUND);
      }

      const results: GradeResponseDto[] = [];

      // Process each grade entry
      for (const gradeEntry of createGradeDto.grades) {
        // Calculate grade details
        const percentage = (gradeEntry.score / assignment.maxScore) * 100;
        const grade = this.calculateGrade(percentage);
        const gpa = this.calculateGPA(percentage);
        
        // Check if grade already exists
        const existingRecord = await this.prisma.academicRecord.findFirst({
          where: {
            studentId: gradeEntry.studentId,
            assignmentId: createGradeDto.assignmentId,
            subjectId: createGradeDto.subjectId,
            classId: createGradeDto.classId,
            termId: createGradeDto.termId,
          },
        });

        let academicRecord;
        if (existingRecord) {
          // Update existing record
          academicRecord = await this.prisma.academicRecord.update({
            where: { id: existingRecord.id },
            data: {
              score: gradeEntry.score,
              maxScore: assignment.maxScore,
              grade,
              percentage,
              gpa,
              comments: gradeEntry.comments,
              feedback: gradeEntry.feedback,
              isLate: gradeEntry.isLate || false,
              latePenaltyApplied: gradeEntry.isLate ? assignment.latePenalty : 0,
              resubmissionCount: existingRecord.resubmissionCount + 1,
              gradedAt: new Date(),
              modifiedBy: teacher.id,
              isPublished: false, // Reset published status when grade is updated
              publishedAt: null,
            },
            include: {
              student: {
                include: {
                  user: true,
                },
              },
              subject: true,
              class: true,
              assignment: true,
              term: true,
            },
          });
        } else {
          // Create new record
          academicRecord = await this.prisma.academicRecord.create({
            data: {
              studentId: gradeEntry.studentId,
              teacherId: teacher.id,
              subjectId: createGradeDto.subjectId,
              classId: createGradeDto.classId,
              termId: createGradeDto.termId,
              assignmentId: createGradeDto.assignmentId,
              score: gradeEntry.score,
              maxScore: assignment.maxScore,
              grade,
              percentage,
              gpa,
              comments: gradeEntry.comments,
              feedback: gradeEntry.feedback,
              isLate: gradeEntry.isLate || false,
              latePenaltyApplied: gradeEntry.isLate ? assignment.latePenalty : 0,
              resubmissionCount: 0,
              gradedAt: new Date(),
              recordedBy: teacher.id,
              modifiedBy: teacher.id,
              isActive: true,
              isPublished: false,
            },
            include: {
              student: {
                include: {
                  user: true,
                },
              },
              subject: true,
              class: true,
              assignment: true,
              term: true,
            },
          });
        }

        results.push({
          id: academicRecord.id,
          student: {
            id: academicRecord.student.id,
            studentNumber: academicRecord.student.studentNumber,
            name: `${academicRecord.student.user.firstName} ${academicRecord.student.user.lastName}`,
            email: academicRecord.student.user.email,
          },
          subject: {
            id: academicRecord.subject.id,
            name: academicRecord.subject.name,
          },
          class: {
            id: academicRecord.class.id,
            name: academicRecord.class.name,
          },
          assignment: academicRecord.assignment ? {
            id: academicRecord.assignment.id,
            title: academicRecord.assignment.title,
          } : undefined,
          term: {
            id: academicRecord.term.id,
            name: academicRecord.term.name,
            academicYear: academicRecord.term.academicYear,
          },
          score: academicRecord.score,
          maxScore: academicRecord.maxScore,
          grade: academicRecord.grade,
          percentage: academicRecord.percentage,
          gpa: academicRecord.gpa,
          comments: academicRecord.comments,
          feedback: academicRecord.feedback,
          isLate: academicRecord.isLate,
          latePenaltyApplied: academicRecord.latePenaltyApplied,
          resubmissionCount: academicRecord.resubmissionCount,
          gradedAt: academicRecord.gradedAt,
          recordedAt: academicRecord.recordedAt,
          isPublished: academicRecord.isPublished,
          publishedAt: academicRecord.publishedAt || undefined,
        });
      }

      return results;
    } catch (error) {
      this.logger.error('Error creating/updating grades:', error);
      throw new HttpException(
        error.message || 'Failed to create/update grades',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateGrade(teacherUserId: string, gradeId: string, updateGradeDto: UpdateGradeDto): Promise<GradeResponseDto> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Verify grade belongs to teacher
      const existingRecord = await this.prisma.academicRecord.findFirst({
        where: {
          id: gradeId,
          teacherId: teacher.id,
        },
        include: {
          assignment: true,
        },
      });

      if (!existingRecord) {
        throw new HttpException('Grade not found or access denied', HttpStatus.NOT_FOUND);
      }

      // Calculate updated grade details
      const score = updateGradeDto.score !== undefined ? updateGradeDto.score : existingRecord.score;
      const percentage = (score / existingRecord.maxScore) * 100;
      const grade = this.calculateGrade(percentage);
      const gpa = this.calculateGPA(percentage);

      // Update grade
      const academicRecord = await this.prisma.academicRecord.update({
        where: { id: gradeId },
        data: {
          score,
          grade,
          percentage,
          gpa,
          comments: updateGradeDto.comments !== undefined ? updateGradeDto.comments : existingRecord.comments,
          feedback: updateGradeDto.feedback !== undefined ? updateGradeDto.feedback : existingRecord.feedback,
          isLate: updateGradeDto.isLate !== undefined ? updateGradeDto.isLate : existingRecord.isLate,
          gradedAt: new Date(),
          modifiedBy: teacher.id,
          isPublished: false, // Reset published status when grade is updated
          publishedAt: null,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          subject: true,
          class: true,
          assignment: true,
          term: true,
        },
      });

      return {
        id: academicRecord.id,
        student: {
          id: academicRecord.student.id,
          studentNumber: academicRecord.student.studentNumber,
          name: `${academicRecord.student.user.firstName} ${academicRecord.student.user.lastName}`,
          email: academicRecord.student.user.email,
        },
        subject: {
          id: academicRecord.subject.id,
          name: academicRecord.subject.name,
        },
        class: {
          id: academicRecord.class.id,
          name: academicRecord.class.name,
        },
        assignment: academicRecord.assignment ? {
          id: academicRecord.assignment.id,
          title: academicRecord.assignment.title,
        } : undefined,
        term: {
          id: academicRecord.term.id,
          name: academicRecord.term.name,
          academicYear: academicRecord.term.academicYear,
        },
        score: academicRecord.score,
        maxScore: academicRecord.maxScore,
        grade: academicRecord.grade,
        percentage: academicRecord.percentage,
        gpa: academicRecord.gpa,
        comments: academicRecord.comments || undefined,
        feedback: academicRecord.feedback || undefined,
        isLate: academicRecord.isLate,
        latePenaltyApplied: academicRecord.latePenaltyApplied,
        resubmissionCount: academicRecord.resubmissionCount,
        gradedAt: academicRecord.gradedAt,
        recordedAt: academicRecord.recordedAt,
        isPublished: academicRecord.isPublished,
        publishedAt: academicRecord.publishedAt || undefined,
      };
    } catch (error) {
      this.logger.error('Error updating grade:', error);
      throw new HttpException(
        error.message || 'Failed to update grade',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAssignment(teacherUserId: string, assignmentId: string): Promise<{ message: string }> {
    try {
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Verify assignment belongs to teacher
      const assignment = await this.prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          teacherId: teacher.id,
        },
      });

      if (!assignment) {
        throw new HttpException('Assignment not found or access denied', HttpStatus.NOT_FOUND);
      }

      // Check if there are any grades for this assignment
      const existingGrades = await this.prisma.academicRecord.count({
        where: {
          assignmentId: assignmentId,
        },
      });

      if (existingGrades > 0) {
        throw new HttpException(
          'Cannot delete assignment with existing grades. Please delete grades first.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Delete assignment
      await this.prisma.assignment.delete({
        where: { id: assignmentId },
      });

      return { message: 'Assignment deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting assignment:', error);
      throw new HttpException(
        error.message || 'Failed to delete assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecentActivity(teacherUserId: string): Promise<any[]> {
    try {
      this.logger.log(`Getting recent activity for teacher user: ${teacherUserId}`);
      
      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        this.logger.warn(`Teacher not found for user: ${teacherUserId}`);
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Found teacher: ${teacher.id}`);

      const activities: any[] = [];

      // 1. Grade entry activities from academic records
      const academicRecords = await this.prisma.academicRecord.findMany({
        where: {
          teacherId: teacher.id,
        },
        include: {
          assignment: true,
        },
        orderBy: { gradedAt: 'desc' },
        take: 10,
      });

      academicRecords.forEach(record => {
        if (record.assignment) {
          activities.push({
            type: 'grade_entered',
            description: `Entered grades for ${record.assignment.title}`,
            timestamp: record.gradedAt,
            studentId: record.studentId,
            assignmentId: record.assignmentId,
          });
        }
      });

      // 2. Assignment creation activities
      const assignments = await this.prisma.assignment.findMany({
        where: {
          teacherId: teacher.id,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      assignments.forEach(assignment => {
        activities.push({
          type: 'assignment_created',
          description: `Created new assignment: ${assignment.title}`,
          timestamp: assignment.createdAt,
          assignmentId: assignment.id,
        });
      });

      // 3. Attendance marking activities (group by date to avoid duplicates)
      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: {
          teacherId: teacher.id,
        },
        orderBy: { recordedAt: 'desc' },
        take: 20,
      });

      const attendanceByDate = new Map();
      attendanceRecords.forEach(record => {
        const dateKey = record.date.toDateString();
        if (!attendanceByDate.has(dateKey)) {
          attendanceByDate.set(dateKey, {
            type: 'attendance_marked',
            description: `Marked attendance for ${record.classId}`,
            timestamp: record.recordedAt,
            classId: record.classId,
          });
        }
      });
      activities.push(...Array.from(attendanceByDate.values()));

      // Sort by timestamp (most recent first) and limit to 10 activities
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
      
      this.logger.log(`Returning ${sortedActivities.length} activities`);
      return sortedActivities;
    } catch (error) {
      this.logger.error('Failed to get recent activity', error);
      throw new HttpException(
        'Failed to get recent activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  async getUpcomingDeadlines(teacherUserId: string) {
    try {
      this.logger.log(`Getting upcoming deadlines for teacher: ${teacherUserId}`);

      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Get upcoming assignments (due date in the future)
      const now = new Date();
      const assignments = await this.prisma.assignment.findMany({
        where: {
          teacherId: teacher.id,
          dueDate: {
            gte: now, // Greater than or equal to now (future dates)
          },
          isActive: true,
        },
        include: {
          subject: true,
          class: true,
          academicRecords: {
            where: {
              isActive: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc', // Sort by due date, earliest first
        },
        take: 15, // Limit to 15 upcoming deadlines
      });

      this.logger.log(`Found ${assignments.length} upcoming assignments`);

      // Transform assignments to include completion progress
      const upcomingDeadlines = assignments.map((assignment) => {
        const totalStudents = assignment.academicRecords.length;
        const completedStudents = assignment.academicRecords.filter(
          (record) => record.grade !== null && record.grade !== undefined
        ).length;

        return {
          assignmentId: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          studentsCompleted: completedStudents,
          totalStudents: totalStudents,
          subject: assignment.subject.name,
          class: assignment.class.name,
          type: assignment.type,
          maxScore: assignment.maxScore,
        };
      });

      this.logger.log(`Returning ${upcomingDeadlines.length} upcoming deadlines`);
      return upcomingDeadlines;
    } catch (error) {
      this.logger.error('Error getting upcoming deadlines:', error);
      throw new HttpException(
        error.message || 'Failed to get upcoming deadlines',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPerformanceInsights(teacherUserId: string) {
    try {
      this.logger.log(`Getting performance insights for teacher: ${teacherUserId}`);

      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Get all academic records for this teacher with student and assignment data
      const academicRecords = await this.prisma.academicRecord.findMany({
        where: {
          teacherId: teacher.id,
          isActive: true,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          assignment: {
            include: {
              class: true,
              subject: true,
            },
          },
        },
      });

      // Get attendance records for students
      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: {
          teacherId: teacher.id,
          isActive: true,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      this.logger.log(`Found ${academicRecords.length} academic records and ${attendanceRecords.length} attendance records`);

      // Calculate student performance metrics
      const studentPerformance = new Map<string, {
        studentId: string;
        studentName: string;
        totalScore: number;
        totalAssignments: number;
        averageScore: number;
        attendanceRate: number;
        missingAssignments: number;
        reasons: string[];
      }>();

      // Process academic records
      academicRecords.forEach((record) => {
        const studentId = record.studentId;
        const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`;
        
        if (!studentPerformance.has(studentId)) {
          studentPerformance.set(studentId, {
            studentId,
            studentName,
            totalScore: 0,
            totalAssignments: 0,
            averageScore: 0,
            attendanceRate: 0,
            missingAssignments: 0,
            reasons: [],
          });
        }

        const student = studentPerformance.get(studentId)!;
        
        if (record.grade !== null && record.grade !== undefined && record.grade !== '') {
          // Convert grade to percentage for calculation (A=90-100, B=80-89, etc.)
          const gradeToPercentage = (grade: string) => {
            switch (grade.toUpperCase()) {
              case 'A': return 95;
              case 'B': return 85;
              case 'C': return 75;
              case 'D': return 65;
              case 'E': return 55;
              case 'F': return 45;
              default: return 0;
            }
          };
          student.totalScore += gradeToPercentage(record.grade);
          student.totalAssignments += 1;
        } else {
          student.missingAssignments += 1;
        }
      });

      // Calculate average scores
      studentPerformance.forEach((student) => {
        if (student.totalAssignments > 0) {
          student.averageScore = student.totalScore / student.totalAssignments;
        }
      });

      // Process attendance records
      const attendanceByStudent = new Map<string, { present: number; total: number }>();
      attendanceRecords.forEach((record) => {
        const studentId = record.studentId;
        if (!attendanceByStudent.has(studentId)) {
          attendanceByStudent.set(studentId, { present: 0, total: 0 });
        }
        
        const attendance = attendanceByStudent.get(studentId)!;
        attendance.total += 1;
        if (record.status === 'PRESENT') {
          attendance.present += 1;
        }
      });

      // Update attendance rates and identify issues
      studentPerformance.forEach((student) => {
        const attendance = attendanceByStudent.get(student.studentId);
        if (attendance && attendance.total > 0) {
          student.attendanceRate = (attendance.present / attendance.total) * 100;
        }

        // Identify reasons for poor performance
        if (student.averageScore < 60) {
          student.reasons.push('Poor academic performance');
        }
        if (student.attendanceRate < 80) {
          student.reasons.push('Low attendance');
        }
        if (student.missingAssignments > 2) {
          student.reasons.push('Missing assignments');
        }
      });

      // Get top performing students (top 5)
      const topPerformingStudents = Array.from(studentPerformance.values())
        .filter(student => student.totalAssignments > 0)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5)
        .map(student => ({
          studentId: student.studentId,
          studentName: student.studentName,
          averageScore: student.averageScore,
        }));

      // Get students needing attention (bottom performers with issues)
      const studentsNeedingAttention = Array.from(studentPerformance.values())
        .filter(student => 
          student.totalAssignments > 0 && 
          (student.averageScore < 60 || student.attendanceRate < 80 || student.missingAssignments > 2)
        )
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 5)
        .map(student => ({
          studentId: student.studentId,
          studentName: student.studentName,
          averageScore: student.averageScore,
          reasons: student.reasons.length > 0 ? student.reasons : ['Needs attention'],
        }));

      // Calculate class improvements (mock data for now - would need historical data)
      const classImprovements = [
        { classId: 'p3', improvement: 12.5, period: 'This month' },
        { classId: 'p5', improvement: 8.3, period: 'This month' },
      ];

      const insights = {
        topPerformingStudents,
        studentsNeedingAttention,
        classImprovements,
        totalStudents: studentPerformance.size,
        averageClassPerformance: studentPerformance.size > 0 
          ? Array.from(studentPerformance.values())
              .filter(s => s.totalAssignments > 0)
              .reduce((sum, s) => sum + s.averageScore, 0) / 
              Array.from(studentPerformance.values()).filter(s => s.totalAssignments > 0).length
          : 0,
      };

      this.logger.log(`Returning performance insights for ${insights.totalStudents} students`);
      return insights;
    } catch (error) {
      this.logger.error('Error getting performance insights:', error);
      throw new HttpException(
        error.message || 'Failed to get performance insights',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private calculateGPA(percentage: number): number {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
  }
}
