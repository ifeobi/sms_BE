import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherAttendanceService } from './teacher-attendance.service';
import {
  CreateAttendanceRecordDto,
  BulkAttendanceRecordDto,
  AttendanceRecordResponseDto,
  AttendancePatternResponseDto,
  AttendanceAnalyticsResponseDto,
  UpdateAttendanceRecordDto,
} from './dto/teacher-attendance.dto';

@ApiTags('Teacher Attendance')
@Controller('teacher-attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherAttendanceController {
  constructor(private readonly teacherAttendanceService: TeacherAttendanceService) {}

  @Get('records')
  @ApiOperation({ summary: 'Get attendance records for teacher' })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
    type: [AttendanceRecordResponseDto],
  })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  async getAttendanceRecords(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.getAttendanceRecords(
        userId,
        classId,
        startDate,
        endDate,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get attendance records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('patterns')
  @ApiOperation({ summary: 'Get attendance patterns and trends for teacher' })
  @ApiResponse({
    status: 200,
    description: 'Attendance patterns retrieved successfully',
    type: [AttendancePatternResponseDto],
  })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  async getAttendancePatterns(
    @Request() req,
    @Query('classId') classId?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.getAttendancePatterns(userId, classId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get attendance patterns',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get attendance analytics for teacher' })
  @ApiResponse({
    status: 200,
    description: 'Attendance analytics retrieved successfully',
    type: [AttendanceAnalyticsResponseDto],
  })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  async getAttendanceAnalytics(
    @Request() req,
    @Query('classId') classId?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.getAttendanceAnalytics(userId, classId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get attendance analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('records')
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: 201,
    description: 'Attendance record created successfully',
    type: AttendanceRecordResponseDto,
  })
  async createAttendanceRecord(
    @Request() req,
    @Body() createAttendanceDto: CreateAttendanceRecordDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.createAttendanceRecord(
        userId,
        createAttendanceDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create attendance record',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('records/bulk')
  @ApiOperation({ summary: 'Create multiple attendance records in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Bulk attendance records created successfully',
    type: [AttendanceRecordResponseDto],
  })
  async bulkCreateAttendanceRecords(
    @Request() req,
    @Body() bulkAttendanceDto: BulkAttendanceRecordDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.bulkCreateAttendanceRecords(
        userId,
        bulkAttendanceDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create bulk attendance records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('records/:id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record updated successfully',
    type: AttendanceRecordResponseDto,
  })
  async updateAttendanceRecord(
    @Request() req,
    @Param('id') recordId: string,
    @Body() updateAttendanceDto: UpdateAttendanceRecordDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.updateAttendanceRecord(
        userId,
        recordId,
        updateAttendanceDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update attendance record',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('records/:id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record deleted successfully',
  })
  async deleteAttendanceRecord(
    @Request() req,
    @Param('id') recordId: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherAttendanceService.deleteAttendanceRecord(userId, recordId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete attendance record',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
