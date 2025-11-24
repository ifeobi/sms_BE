import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateContinuousAssessmentDto } from './dto/create-continuous-assessment.dto';
import { CreateAssignmentGradeDto } from './dto/create-assignment-grade.dto';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  private ensureTeacherAccess(req: any) {
    const userType = req.user?.type?.toString().toLowerCase();
    if (userType !== 'teacher' && userType !== 'master') {
      throw new ForbiddenException('Only teachers can access this resource');
    }
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getProfile(req.user.id);
  }

  @Get('me/assignments')
  async getAssignments(@Request() req: any) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getAssignments(req.user.id);
  }

  @Post('me/assignments')
  async createAssignment(
    @Request() req: any,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.createAssignment(req.user.id, createAssignmentDto);
  }

  @Get('me/assignments/detail')
  async getAssignmentDetails(@Request() req: any) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getAssignmentDetails(req.user.id);
  }

  @Get('me/classes/:classId/students')
  async getClassStudents(
    @Request() req: any,
    @Param('classId') classId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getClassStudents(req.user.id, classId, subjectId);
  }

  @Get('me/attendance')
  async getAttendance(
    @Request() req: any,
    @Query('classId') classId?: string,
    @Query('termId') termId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.ensureTeacherAccess(req);

    const filters = {
      classId: classId || undefined,
      termId: termId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.teachersService.getAttendance(req.user.id, filters);
  }

  @Post('me/attendance')
  async recordAttendance(
    @Request() req: any,
    @Body() dto: CreateAttendanceDto,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.recordAttendance(req.user.id, dto);
  }

  @Get('me/grades')
  async getGrades(
    @Request() req: any,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('termId') termId?: string,
    @Query('assignmentId') assignmentId?: string,
  ) {
    this.ensureTeacherAccess(req);

    const filters = {
      classId: classId || undefined,
      subjectId: subjectId || undefined,
      termId: termId || undefined,
      assignmentId: assignmentId || undefined,
    };

    return this.teachersService.getGrades(req.user.id, filters);
  }

  @Get('me/terms')
  async getTerms(@Request() req: any) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getTerms(req.user.id);
  }

  @Get('me/dashboard')
  async getDashboard(@Request() req: any) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getDashboard(req.user.id);
  }

  @Get('me/continuous-assessment')
  async getContinuousAssessment(
    @Request() req: any,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
    @Query('termId') termId: string,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.getContinuousAssessment(
      req.user.id,
      classId,
      subjectId,
      termId,
    );
  }

  @Post('me/continuous-assessment')
  async saveContinuousAssessment(
    @Request() req: any,
    @Body() dto: CreateContinuousAssessmentDto,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.saveContinuousAssessment(req.user.id, dto);
  }

  @Post('me/assignment-grades')
  async saveAssignmentGrade(
    @Request() req: any,
    @Body() dto: CreateAssignmentGradeDto,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.saveAssignmentGrade(req.user.id, dto);
  }

  @Delete('me/continuous-assessment/:studentId')
  async deleteContinuousAssessment(
    @Request() req: any,
    @Param('studentId') studentId: string,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
    @Query('termId') termId: string,
  ) {
    this.ensureTeacherAccess(req);
    return this.teachersService.deleteContinuousAssessment(
      req.user.id,
      studentId,
      classId,
      subjectId,
      termId,
    );
  }
}

