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
import { TeacherGradesService } from './teacher-grades.service';
import {
  CreateGradeDto,
  UpdateGradeDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeResponseDto,
  AssignmentResponseDto,
  TeacherGradesOverviewDto,
} from './dto/teacher-grades.dto';

@ApiTags('Teacher Grades')
@Controller('teacher-grades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherGradesController {
  constructor(private readonly teacherGradesService: TeacherGradesService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get teacher grades overview' })
  @ApiResponse({
    status: 200,
    description: 'Teacher grades overview retrieved successfully',
    type: TeacherGradesOverviewDto,
  })
  async getGradesOverview(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.getGradesOverview(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get grades overview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get teacher assignments' })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
    type: [AssignmentResponseDto],
  })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'termId', required: false, description: 'Filter by term ID' })
  async getAssignments(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('termId') termId?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const filters = { classId, subjectId, termId };
      return await this.teacherGradesService.getAssignments(userId, filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get assignments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('grades')
  @ApiOperation({ summary: 'Get grades for students' })
  @ApiResponse({
    status: 200,
    description: 'Grades retrieved successfully',
    type: [GradeResponseDto],
  })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'termId', required: false, description: 'Filter by term ID' })
  @ApiQuery({ name: 'assignmentId', required: false, description: 'Filter by assignment ID' })
  async getGrades(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('termId') termId?: string,
    @Query('assignmentId') assignmentId?: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const filters = { classId, subjectId, termId, assignmentId };
      return await this.teacherGradesService.getGrades(userId, filters);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get grades',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('students/:classId')
  @ApiOperation({ summary: 'Get students in a class for grading' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  async getStudentsForGrading(
    @Request() req,
    @Param('classId') classId: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.getStudentsForGrading(userId, classId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get students',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({
    status: 201,
    description: 'Assignment created successfully',
    type: AssignmentResponseDto,
  })
  async createAssignment(
    @Request() req,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.createAssignment(userId, createAssignmentDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('assignments/:id')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
    type: AssignmentResponseDto,
  })
  async updateAssignment(
    @Request() req,
    @Param('id') assignmentId: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.updateAssignment(userId, assignmentId, updateAssignmentDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('grades')
  @ApiOperation({ summary: 'Create or update grades for students' })
  @ApiResponse({
    status: 201,
    description: 'Grades created/updated successfully',
    type: [GradeResponseDto],
  })
  async createOrUpdateGrades(
    @Request() req,
    @Body() createGradeDto: CreateGradeDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.createOrUpdateGrades(userId, createGradeDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create/update grades',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('grades/:id')
  @ApiOperation({ summary: 'Update a specific grade' })
  @ApiResponse({
    status: 200,
    description: 'Grade updated successfully',
    type: GradeResponseDto,
  })
  async updateGrade(
    @Request() req,
    @Param('id') gradeId: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.updateGrade(userId, gradeId, updateGradeDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update grade',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Assignment deleted successfully',
  })
  async deleteAssignment(
    @Request() req,
    @Param('id') assignmentId: string,
  ) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'teacher') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.teacherGradesService.deleteAssignment(userId, assignmentId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
