import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
}

