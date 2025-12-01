import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AcademicStructureService } from './academic-structure.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Academic Structure')
@Controller('academic-structure')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AcademicStructureController {
  constructor(
    private readonly academicStructureService: AcademicStructureService,
  ) {}

  @Get('school/:schoolId')
  @ApiOperation({ summary: 'Get complete academic structure for a school' })
  @ApiResponse({
    status: 200,
    description: 'Academic structure retrieved successfully',
  })
  async getSchoolAcademicStructure(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getSchoolAcademicStructure(schoolId);
  }

  @Get('levels/:schoolId')
  @ApiOperation({ summary: 'Get all levels for a school' })
  @ApiResponse({
    status: 200,
    description: 'Levels retrieved successfully',
  })
  async getLevels(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getLevels(schoolId);
  }

  @Get('classes/:schoolId')
  @ApiOperation({ summary: 'Get all classes for a school' })
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
  })
  async getClasses(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getClasses(schoolId);
  }

  @Get('subjects/:schoolId')
  @ApiOperation({ summary: 'Get all subjects for a school' })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
  })
  async getSubjects(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getSubjects(schoolId);
  }

  @Get('terms/:schoolId')
  @ApiOperation({ summary: 'Get all academic terms for a school' })
  @ApiResponse({
    status: 200,
    description: 'Academic terms retrieved successfully',
  })
  async getAcademicTerms(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getAcademicTerms(schoolId);
  }

  @Get('teacher-assignments')
  @ApiOperation({ summary: 'Get teacher assignments with filters' })
  @ApiResponse({
    status: 200,
    description: 'Teacher assignments retrieved successfully',
  })
  async getTeacherAssignments(@Body() filters: any) {
    return this.academicStructureService.getTeacherAssignments(filters);
  }

  @Post('levels')
  @ApiOperation({ summary: 'Create a new level' })
  @ApiResponse({
    status: 201,
    description: 'Level created successfully',
  })
  async createLevel(@Body() levelData: any) {
    return this.academicStructureService.createLevel(levelData);
  }

  @Post('classes')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
  })
  async createClass(@Body() classData: any) {
    return this.academicStructureService.createClass(classData);
  }

  @Post('subjects')
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({
    status: 201,
    description: 'Subject created successfully',
  })
  async createSubject(@Body() subjectData: any) {
    return this.academicStructureService.createSubject(subjectData);
  }

  @Post('terms')
  @ApiOperation({ summary: 'Create a new academic term' })
  @ApiResponse({
    status: 201,
    description: 'Academic term created successfully',
  })
  async createAcademicTerm(@Body() termData: any) {
    return this.academicStructureService.createAcademicTerm(termData);
  }

  @Post('teacher-assignments')
  @ApiOperation({ summary: 'Create a new teacher assignment' })
  @ApiResponse({
    status: 201,
    description: 'Teacher assignment created successfully',
  })
  async createTeacherAssignment(@Body() assignmentData: any) {
    return this.academicStructureService.createTeacherAssignment(
      assignmentData,
    );
  }

  @Put('levels/:id')
  @ApiOperation({ summary: 'Update a level' })
  @ApiResponse({
    status: 200,
    description: 'Level updated successfully',
  })
  async updateLevel(@Param('id') id: string, @Body() levelData: any) {
    return this.academicStructureService.updateLevel(id, levelData);
  }

  @Put('levels/:id/toggle')
  @ApiOperation({ summary: 'Toggle level active status' })
  @ApiResponse({
    status: 200,
    description: 'Level status toggled successfully',
  })
  async toggleLevelStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.academicStructureService.toggleLevelStatus(id, body.isActive);
  }

  @Get('levels/:id/classes/count')
  @ApiOperation({ summary: 'Get class count for a specific level' })
  @ApiResponse({
    status: 200,
    description: 'Class count retrieved successfully',
  })
  async getLevelClassCount(
    @Param('id') id: string,
    @Query('getExpectedCount') getExpectedCount?: boolean
  ) {
    return this.academicStructureService.getLevelClassCount(id, getExpectedCount);
  }

  @Put('classes/:id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
  })
  async updateClass(@Param('id') id: string, @Body() classData: any) {
    return this.academicStructureService.updateClass(id, classData);
  }

  @Put('subjects/:id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiResponse({
    status: 200,
    description: 'Subject updated successfully',
  })
  async updateSubject(@Param('id') id: string, @Body() subjectData: any) {
    return this.academicStructureService.updateSubject(id, subjectData);
  }

  @Put('terms/:id')
  @ApiOperation({ summary: 'Update an academic term' })
  @ApiResponse({
    status: 200,
    description: 'Academic term updated successfully',
  })
  async updateAcademicTerm(@Param('id') id: string, @Body() termData: any) {
    return this.academicStructureService.updateAcademicTerm(id, termData);
  }

  @Put('teacher-assignments/:id')
  @ApiOperation({ summary: 'Update a teacher assignment' })
  @ApiResponse({
    status: 200,
    description: 'Teacher assignment updated successfully',
  })
  async updateTeacherAssignment(
    @Param('id') id: string,
    @Body() assignmentData: any,
  ) {
    return this.academicStructureService.updateTeacherAssignment(
      id,
      assignmentData,
    );
  }

  @Delete('levels/:id')
  @ApiOperation({ summary: 'Delete a level' })
  @ApiResponse({
    status: 200,
    description: 'Level deleted successfully',
  })
  async deleteLevel(@Param('id') id: string) {
    return this.academicStructureService.deleteLevel(id);
  }

  @Delete('classes/:id')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
  })
  async deleteClass(@Param('id') id: string) {
    return this.academicStructureService.deleteClass(id);
  }

  @Delete('subjects/:id')
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiResponse({
    status: 200,
    description: 'Subject deleted successfully',
  })
  async deleteSubject(@Param('id') id: string) {
    return this.academicStructureService.deleteSubject(id);
  }

  @Delete('terms/:id')
  @ApiOperation({ summary: 'Delete an academic term' })
  @ApiResponse({
    status: 200,
    description: 'Academic term deleted successfully',
  })
  async deleteAcademicTerm(@Param('id') id: string) {
    return this.academicStructureService.deleteAcademicTerm(id);
  }

  @Delete('teacher-assignments/:id')
  @ApiOperation({ summary: 'Delete a teacher assignment' })
  @ApiResponse({
    status: 200,
    description: 'Teacher assignment deleted successfully',
  })
  async deleteTeacherAssignment(@Param('id') id: string) {
    return this.academicStructureService.deleteTeacherAssignment(id);
  }

  @Post('bulk/subjects')
  @ApiOperation({ summary: 'Create multiple subjects' })
  @ApiResponse({
    status: 201,
    description: 'Subjects created successfully',
  })
  async bulkCreateSubjects(@Body() subjects: any[]) {
    return this.academicStructureService.bulkCreateSubjects(subjects);
  }

  @Post('bulk/classes')
  @ApiOperation({ summary: 'Create multiple classes' })
  @ApiResponse({
    status: 201,
    description: 'Classes created successfully',
  })
  async bulkCreateClasses(@Body() classes: any[]) {
    return this.academicStructureService.bulkCreateClasses(classes);
  }

  @Post('bulk/teacher-assignments')
  @ApiOperation({ summary: 'Create multiple teacher assignments' })
  @ApiResponse({
    status: 201,
    description: 'Teacher assignments created successfully',
  })
  async bulkCreateTeacherAssignments(@Body() assignments: any[]) {
    return this.academicStructureService.bulkCreateTeacherAssignments(
      assignments,
    );
  }

  // ==================== SECTION/ARM ENDPOINTS ====================

  @Get('sections/class/:classId')
  @ApiOperation({ summary: 'Get all sections for a class' })
  @ApiResponse({
    status: 200,
    description: 'Sections retrieved successfully',
  })
  async getSectionsByClass(@Param('classId') classId: string) {
    return this.academicStructureService.getSectionsByClass(classId);
  }

  @Get('teachers/:schoolId')
  @ApiOperation({ summary: 'Get available teachers for a school' })
  @ApiResponse({
    status: 200,
    description: 'Teachers retrieved successfully',
  })
  async getAvailableTeachers(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getAvailableTeachers(schoolId);
  }

  @Post('sections')
  @ApiOperation({ summary: 'Create a new section/arm' })
  @ApiResponse({
    status: 201,
    description: 'Section created successfully',
  })
  async createSection(@Body() sectionData: any) {
    return this.academicStructureService.createSection(sectionData);
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update a section/arm' })
  @ApiResponse({
    status: 200,
    description: 'Section updated successfully',
  })
  async updateSection(@Param('id') id: string, @Body() sectionData: any) {
    return this.academicStructureService.updateSectionArm(id, sectionData);
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete a section/arm' })
  @ApiResponse({
    status: 200,
    description: 'Section deleted successfully',
  })
  async deleteSection(@Param('id') id: string) {
    return this.academicStructureService.deleteSection(id);
  }

  // ==================== GRADING SCALE ENDPOINTS ====================

  @Get('schools/:schoolId/grading-scales')
  @ApiOperation({ summary: 'Get all grading scales for a school' })
  @ApiResponse({
    status: 200,
    description: 'Grading scales retrieved successfully',
  })
  async getGradingScales(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getGradingScales(schoolId);
  }

  @Get('schools/:schoolId/grading-scales/default')
  @ApiOperation({ summary: 'Get default grading scale for a school' })
  @ApiResponse({
    status: 200,
    description: 'Default grading scale retrieved successfully',
  })
  async getDefaultGradingScale(@Param('schoolId') schoolId: string) {
    const scale =
      await this.academicStructureService.getDefaultGradingScale(schoolId);
    if (!scale) {
      throw new NotFoundException(
        'Default grading scale not found for this school',
      );
    }
    return scale;
  }

  @Post('schools/:schoolId/grading-scales')
  @ApiOperation({ summary: 'Create a new grading scale' })
  @ApiResponse({
    status: 201,
    description: 'Grading scale created successfully',
  })
  async createGradingScale(
    @Param('schoolId') schoolId: string,
    @Body() data: any,
  ) {
    return this.academicStructureService.createGradingScale(schoolId, data);
  }

  @Put('schools/:schoolId/grading-scales/:id')
  @ApiOperation({ summary: 'Update a grading scale' })
  @ApiResponse({
    status: 200,
    description: 'Grading scale updated successfully',
  })
  async updateGradingScale(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.academicStructureService.updateGradingScale(id, schoolId, data);
  }

  // ==================== ASSESSMENT STRUCTURE ENDPOINTS ====================

  @Get('schools/:schoolId/assessment-structures')
  @ApiOperation({ summary: 'Get all assessment structures for a school' })
  @ApiResponse({
    status: 200,
    description: 'Assessment structures retrieved successfully',
  })
  async getAssessmentStructures(@Param('schoolId') schoolId: string) {
    return this.academicStructureService.getAssessmentStructures(schoolId);
  }

  @Get('schools/:schoolId/assessment-structures/level/:levelId')
  @ApiOperation({ summary: 'Get assessment structure for a specific level' })
  @ApiResponse({
    status: 200,
    description: 'Assessment structure retrieved successfully',
  })
  async getAssessmentStructureByLevel(
    @Param('schoolId') schoolId: string,
    @Param('levelId') levelId: string,
  ) {
    return this.academicStructureService.getAssessmentStructureByLevel(levelId, schoolId);
  }

  @Post('schools/:schoolId/assessment-structures')
  @ApiOperation({ summary: 'Create a new assessment structure' })
  @ApiResponse({
    status: 201,
    description: 'Assessment structure created successfully',
  })
  async createAssessmentStructure(
    @Param('schoolId') schoolId: string,
    @Body() data: any,
  ) {
    return this.academicStructureService.createAssessmentStructure(schoolId, data);
  }

  @Put('schools/:schoolId/assessment-structures/:id')
  @ApiOperation({ summary: 'Update an assessment structure' })
  @ApiResponse({
    status: 200,
    description: 'Assessment structure updated successfully',
  })
  async updateAssessmentStructure(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.academicStructureService.updateAssessmentStructure(id, schoolId, data);
  }

  @Delete('schools/:schoolId/assessment-structures/:id')
  @ApiOperation({ summary: 'Delete an assessment structure' })
  @ApiResponse({
    status: 200,
    description: 'Assessment structure deleted successfully',
  })
  async deleteAssessmentStructure(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ) {
    return this.academicStructureService.deleteAssessmentStructure(id, schoolId);
  }
}
