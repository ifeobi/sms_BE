import { Controller, Post, Body, UseGuards, Request, ForbiddenException, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new student (with parent creation/link)' })
  @ApiResponse({ status: 201, description: 'Student created' })
  @ApiResponse({ status: 403, description: 'Only school admins can add students' })
  async createStudent(@Body() createStudentDto: CreateStudentDto, @Request() req: any) {
    console.log('🟢 [DEBUG] Controller: createStudent endpoint called');
    console.log('🟢 [DEBUG] Request user:', {
      id: req.user?.id,
      type: req.user?.type,
      schoolId: req.user?.schoolId,
      email: req.user?.email,
    });
    console.log('🟢 [DEBUG] Request body:', {
      studentEmail: createStudentDto.email,
      studentName: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
      parentEmail: createStudentDto.parentInfo?.email,
      parentName: createStudentDto.parentInfo ? `${createStudentDto.parentInfo.firstName} ${createStudentDto.parentInfo.lastName}` : null,
      relationship: createStudentDto.relationship,
      classLevel: createStudentDto.classLevel,
      hasExistingParentId: !!createStudentDto.existingParentId,
    });

    // Check if user is school admin
    if (req.user?.type !== 'SCHOOL_ADMIN') {
      console.log('❌ [DEBUG] Controller: User is not SCHOOL_ADMIN. Type:', req.user?.type);
      throw new ForbiddenException('Only school administrators can add students');
    }
    
    console.log('🟢 [DEBUG] Controller: Passing to service with schoolId:', req.user.schoolId);
    try {
      const result = await this.studentsService.createStudent(createStudentDto, req.user.schoolId);
      console.log('✅ [DEBUG] Controller: Student creation successful, returning result');
      return result;
    } catch (error) {
      console.error('❌ [DEBUG] Controller: Error caught:', error.message);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get students for the logged-in school admin' })
  @ApiResponse({ status: 200, description: 'Students returned successfully' })
  async getStudents(@Request() req: any, @Query('schoolId') schoolId?: string) {
    const userType = req.user?.type?.toLowerCase();
    if (userType !== 'school_admin' && userType !== 'teacher' && userType !== 'master') {
      throw new ForbiddenException('Only school administrators can view students');
    }

    const targetSchoolId = schoolId || req.user.schoolId;
    if (!targetSchoolId) {
      throw new ForbiddenException('School ID is required to fetch students');
    }

    return this.studentsService.getStudentsForSchool(targetSchoolId);
  }

  @Get('my-children')
  @ApiOperation({ summary: 'Get logged-in parent\'s children' })
  @ApiResponse({ status: 200, description: 'List of children returned' })
  async getMyChildren(@Request() req: any) {
    if (req.user?.type?.toLowerCase() !== 'parent') {
      throw new ForbiddenException('Only parents can access their children');
    }
    return this.studentsService.getChildrenForParent(req.user.id);
  }
}
