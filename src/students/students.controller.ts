import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentsService } from './students.service';
import {
  ParentChildrenResponseDto,
  StudentAcademicRecordsResponseDto,
  StudentAttendanceResponseDto,
  StudentGradesResponseDto,
} from './dto/students-response.dto';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('parent-children')
  @ApiOperation({ summary: 'Get all children for a parent' })
  @ApiResponse({
    status: 200,
    description: 'Parent children retrieved successfully',
    type: ParentChildrenResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Access denied - not a parent' })
  async getParentChildren(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'parent') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.studentsService.getParentChildren(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get parent children',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('parent-children/grades')
  @ApiOperation({ summary: 'Get grades for all parent children' })
  @ApiResponse({
    status: 200,
    description: 'Children grades retrieved successfully',
    type: StudentGradesResponseDto,
  })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiQuery({ name: 'termId', required: false, description: 'Filter by term ID' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year' })
  async getParentChildrenGrades(
    @Request() req,
    @Query('schoolId') schoolId?: string,
    @Query('termId') termId?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'parent') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.studentsService.getParentChildrenGrades(
        userId,
        schoolId,
        termId,
        academicYear,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get children grades',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('parent-children/attendance')
  @ApiOperation({ summary: 'Get attendance for all parent children' })
  @ApiResponse({
    status: 200,
    description: 'Children attendance retrieved successfully',
    type: StudentAttendanceResponseDto,
  })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getParentChildrenAttendance(
    @Request() req,
    @Query('schoolId') schoolId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'parent') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.studentsService.getParentChildrenAttendance(
        userId,
        schoolId,
        startDate,
        endDate,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get children attendance',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/academic-records')
  @ApiOperation({ summary: 'Get academic records for a specific child' })
  @ApiResponse({
    status: 200,
    description: 'Student academic records retrieved successfully',
    type: StudentAcademicRecordsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Access denied - not authorized to view this student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiQuery({ name: 'termId', required: false, description: 'Filter by term ID' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  async getStudentAcademicRecords(
    @Request() req,
    @Param('id') studentId: string,
    @Query('termId') termId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'parent') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.studentsService.getStudentAcademicRecords(
        userId,
        studentId,
        termId,
        subjectId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get student academic records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Get attendance records for a specific child' })
  @ApiResponse({
    status: 200,
    description: 'Student attendance retrieved successfully',
    type: StudentAttendanceResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Access denied - not authorized to view this student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getStudentAttendance(
    @Request() req,
    @Param('id') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'parent') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.studentsService.getStudentAttendance(
        userId,
        studentId,
        startDate,
        endDate,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get student attendance',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
