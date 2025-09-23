import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAttendanceRecordDto,
  BulkAttendanceRecordDto,
  AttendanceRecordResponseDto,
  AttendancePatternResponseDto,
  AttendanceAnalyticsResponseDto,
  UpdateAttendanceRecordDto,
  AttendanceStatus,
} from './dto/teacher-attendance.dto';

@Injectable()
export class TeacherAttendanceService {
  private readonly logger = new Logger(TeacherAttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAttendanceRecords(
    teacherUserId: string,
    classId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecordResponseDto[]> {
    try {
      this.logger.log(`Getting attendance records for teacher: ${teacherUserId}`);

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
        isActive: true,
      };

      if (classId) {
        whereClause.classId = classId;
      }

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.date.lte = new Date(endDate);
        }
      }

      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
        orderBy: { date: 'desc' },
      });

      this.logger.log(`Found ${attendanceRecords.length} attendance records`);

      return attendanceRecords.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        studentName: `${record.student.user.firstName} ${record.student.user.lastName}`,
        classId: record.classId,
        className: record.class.name,
        termId: record.termId,
        date: record.date,
        status: record.status,
        reason: record.reason || undefined,
        recordedAt: record.recordedAt,
        recordedBy: record.recordedBy,
      }));
    } catch (error) {
      this.logger.error('Error getting attendance records:', error);
      throw new HttpException(
        error.message || 'Failed to get attendance records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAttendancePatterns(
    teacherUserId: string,
    classId?: string,
  ): Promise<AttendancePatternResponseDto[]> {
    try {
      this.logger.log(`Getting attendance patterns for teacher: ${teacherUserId}`);

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
        isActive: true,
      };

      if (classId) {
        whereClause.classId = classId;
      }

      // Get attendance records with student data
      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      // Group by student and calculate patterns
      const studentPatterns = new Map<string, {
        studentId: string;
        studentName: string;
        totalDays: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
        excusedDays: number;
        sickDays: number;
      }>();

      attendanceRecords.forEach((record) => {
        const studentId = record.studentId;
        const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`;

        if (!studentPatterns.has(studentId)) {
          studentPatterns.set(studentId, {
            studentId,
            studentName,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            excusedDays: 0,
            sickDays: 0,
          });
        }

        const pattern = studentPatterns.get(studentId)!;
        pattern.totalDays += 1;

        switch (record.status) {
          case 'PRESENT':
            pattern.presentDays += 1;
            break;
          case 'ABSENT':
            pattern.absentDays += 1;
            break;
          case 'LATE':
            pattern.lateDays += 1;
            break;
          case 'EXCUSED':
            pattern.excusedDays += 1;
            break;
          case 'SICK':
            pattern.sickDays += 1;
            break;
        }
      });

      // Convert to response format
      const patterns: AttendancePatternResponseDto[] = Array.from(studentPatterns.values()).map((pattern) => {
        const attendancePercentage = pattern.totalDays > 0 
          ? ((pattern.presentDays + pattern.lateDays) / pattern.totalDays) * 100 
          : 0;

        let status = 'no-data';
        if (pattern.totalDays > 0) {
          if (attendancePercentage >= 90) {
            status = 'excellent';
          } else if (attendancePercentage >= 80) {
            status = 'good';
          } else if (attendancePercentage >= 70) {
            status = 'fair';
          } else {
            status = 'poor';
          }
        }

        return {
          studentId: pattern.studentId,
          studentName: pattern.studentName,
          totalDays: pattern.totalDays,
          presentDays: pattern.presentDays,
          absentDays: pattern.absentDays,
          lateDays: pattern.lateDays,
          excusedDays: pattern.excusedDays,
          sickDays: pattern.sickDays,
          attendancePercentage,
          status,
        };
      });

      this.logger.log(`Returning ${patterns.length} attendance patterns`);
      return patterns;
    } catch (error) {
      this.logger.error('Error getting attendance patterns:', error);
      throw new HttpException(
        error.message || 'Failed to get attendance patterns',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAttendanceAnalytics(
    teacherUserId: string,
    classId?: string,
  ): Promise<AttendanceAnalyticsResponseDto[]> {
    try {
      this.logger.log(`Getting attendance analytics for teacher: ${teacherUserId}`);

      // Get attendance patterns first
      const patterns = await this.getAttendancePatterns(teacherUserId, classId);

      // Group by class
      const classAnalytics = new Map<string, {
        classId: string;
        className: string;
        totalStudents: number;
        excellentAttendance: number;
        goodAttendance: number;
        fairAttendance: number;
        poorAttendance: number;
        totalAttendancePercentage: number;
        patterns: AttendancePatternResponseDto[];
      }>();

      patterns.forEach((pattern) => {
        // For now, we'll use a default class name since we don't have class info in patterns
        // In a real implementation, you'd want to include class information in the patterns
        const classKey = classId || 'default';
        
        if (!classAnalytics.has(classKey)) {
          classAnalytics.set(classKey, {
            classId: classKey,
            className: classId ? `Class ${classId}` : 'All Classes',
            totalStudents: 0,
            excellentAttendance: 0,
            goodAttendance: 0,
            fairAttendance: 0,
            poorAttendance: 0,
            totalAttendancePercentage: 0,
            patterns: [],
          });
        }

        const analytics = classAnalytics.get(classKey)!;
        analytics.totalStudents += 1;
        analytics.totalAttendancePercentage += pattern.attendancePercentage;
        analytics.patterns.push(pattern);

        switch (pattern.status) {
          case 'excellent':
            analytics.excellentAttendance += 1;
            break;
          case 'good':
            analytics.goodAttendance += 1;
            break;
          case 'fair':
            analytics.fairAttendance += 1;
            break;
          case 'poor':
            analytics.poorAttendance += 1;
            break;
        }
      });

      // Convert to response format
      const analytics: AttendanceAnalyticsResponseDto[] = Array.from(classAnalytics.values()).map((analytics) => ({
        classId: analytics.classId,
        className: analytics.className,
        totalStudents: analytics.totalStudents,
        averageAttendance: analytics.totalStudents > 0 
          ? analytics.totalAttendancePercentage / analytics.totalStudents 
          : 0,
        excellentAttendance: analytics.excellentAttendance,
        goodAttendance: analytics.goodAttendance,
        fairAttendance: analytics.fairAttendance,
        poorAttendance: analytics.poorAttendance,
        patterns: analytics.patterns,
      }));

      this.logger.log(`Returning analytics for ${analytics.length} classes`);
      return analytics;
    } catch (error) {
      this.logger.error('Error getting attendance analytics:', error);
      throw new HttpException(
        error.message || 'Failed to get attendance analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAttendanceRecord(
    teacherUserId: string,
    createAttendanceDto: CreateAttendanceRecordDto,
  ): Promise<AttendanceRecordResponseDto> {
    try {
      this.logger.log(`Creating attendance record for teacher: ${teacherUserId}`);

      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Check if record already exists for this student and date
      const existingRecord = await this.prisma.attendanceRecord.findFirst({
        where: {
          studentId: createAttendanceDto.studentId,
          date: new Date(createAttendanceDto.date),
          isActive: true,
        },
      });

      if (existingRecord) {
        throw new HttpException(
          'Attendance record already exists for this student and date',
          HttpStatus.CONFLICT,
        );
      }

      // Create attendance record
      const attendanceRecord = await this.prisma.attendanceRecord.create({
        data: {
          studentId: createAttendanceDto.studentId,
          classId: createAttendanceDto.classId,
          teacherId: teacher.id,
          termId: createAttendanceDto.termId,
          date: new Date(createAttendanceDto.date),
          status: createAttendanceDto.status,
          reason: createAttendanceDto.reason,
          recordedBy: teacherUserId,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      this.logger.log(`Created attendance record: ${attendanceRecord.id}`);

      return {
        id: attendanceRecord.id,
        studentId: attendanceRecord.studentId,
        studentName: `${attendanceRecord.student.user.firstName} ${attendanceRecord.student.user.lastName}`,
        classId: attendanceRecord.classId,
        className: attendanceRecord.class.name,
        termId: attendanceRecord.termId,
        date: attendanceRecord.date,
        status: attendanceRecord.status,
        reason: attendanceRecord.reason || undefined,
        recordedAt: attendanceRecord.recordedAt,
        recordedBy: attendanceRecord.recordedBy,
      };
    } catch (error) {
      this.logger.error('Error creating attendance record:', error);
      throw new HttpException(
        error.message || 'Failed to create attendance record',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkCreateAttendanceRecords(
    teacherUserId: string,
    bulkAttendanceDto: BulkAttendanceRecordDto,
  ): Promise<AttendanceRecordResponseDto[]> {
    try {
      this.logger.log(`Creating bulk attendance records for teacher: ${teacherUserId}`);

      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      const attendanceDate = new Date(bulkAttendanceDto.date);
      const createdRecords: AttendanceRecordResponseDto[] = [];

      // Process each record
      for (const record of bulkAttendanceDto.records) {
        // Check if record already exists
        const existingRecord = await this.prisma.attendanceRecord.findFirst({
          where: {
            studentId: record.studentId,
            date: attendanceDate,
            isActive: true,
          },
        });

        if (existingRecord) {
          this.logger.warn(`Attendance record already exists for student ${record.studentId} on ${bulkAttendanceDto.date}`);
          continue;
        }

        // Create attendance record
        const attendanceRecord = await this.prisma.attendanceRecord.create({
          data: {
            studentId: record.studentId,
            classId: bulkAttendanceDto.classId,
            teacherId: teacher.id,
            termId: bulkAttendanceDto.termId,
            date: attendanceDate,
            status: record.status,
            reason: record.reason || undefined,
            recordedBy: teacherUserId,
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
            class: true,
          },
        });

        createdRecords.push({
          id: attendanceRecord.id,
          studentId: attendanceRecord.studentId,
          studentName: `${attendanceRecord.student.user.firstName} ${attendanceRecord.student.user.lastName}`,
          classId: attendanceRecord.classId,
          className: attendanceRecord.class.name,
          termId: attendanceRecord.termId,
          date: attendanceRecord.date,
          status: attendanceRecord.status,
          reason: attendanceRecord.reason || undefined,
          recordedAt: attendanceRecord.recordedAt,
          recordedBy: attendanceRecord.recordedBy,
        });
      }

      this.logger.log(`Created ${createdRecords.length} attendance records`);
      return createdRecords;
    } catch (error) {
      this.logger.error('Error creating bulk attendance records:', error);
      throw new HttpException(
        error.message || 'Failed to create bulk attendance records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAttendanceRecord(
    teacherUserId: string,
    recordId: string,
    updateAttendanceDto: UpdateAttendanceRecordDto,
  ): Promise<AttendanceRecordResponseDto> {
    try {
      this.logger.log(`Updating attendance record: ${recordId}`);

      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Check if record exists and belongs to this teacher
      const existingRecord = await this.prisma.attendanceRecord.findFirst({
        where: {
          id: recordId,
          teacherId: teacher.id,
          isActive: true,
        },
      });

      if (!existingRecord) {
        throw new HttpException('Attendance record not found', HttpStatus.NOT_FOUND);
      }

      // Update attendance record
      const updatedRecord = await this.prisma.attendanceRecord.update({
        where: { id: recordId },
        data: {
          status: updateAttendanceDto.status,
          reason: updateAttendanceDto.reason,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      this.logger.log(`Updated attendance record: ${recordId}`);

      return {
        id: updatedRecord.id,
        studentId: updatedRecord.studentId,
        studentName: `${updatedRecord.student.user.firstName} ${updatedRecord.student.user.lastName}`,
        classId: updatedRecord.classId,
        className: updatedRecord.class.name,
        termId: updatedRecord.termId,
        date: updatedRecord.date,
        status: updatedRecord.status,
        reason: updatedRecord.reason || undefined,
        recordedAt: updatedRecord.recordedAt,
        recordedBy: updatedRecord.recordedBy,
      };
    } catch (error) {
      this.logger.error('Error updating attendance record:', error);
      throw new HttpException(
        error.message || 'Failed to update attendance record',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAttendanceRecord(
    teacherUserId: string,
    recordId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Deleting attendance record: ${recordId}`);

      // Get teacher record
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: teacherUserId },
      });

      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
      }

      // Check if record exists and belongs to this teacher
      const existingRecord = await this.prisma.attendanceRecord.findFirst({
        where: {
          id: recordId,
          teacherId: teacher.id,
          isActive: true,
        },
      });

      if (!existingRecord) {
        throw new HttpException('Attendance record not found', HttpStatus.NOT_FOUND);
      }

      // Soft delete attendance record
      await this.prisma.attendanceRecord.update({
        where: { id: recordId },
        data: { isActive: false },
      });

      this.logger.log(`Deleted attendance record: ${recordId}`);
    } catch (error) {
      this.logger.error('Error deleting attendance record:', error);
      throw new HttpException(
        error.message || 'Failed to delete attendance record',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
