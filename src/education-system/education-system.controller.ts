import { Controller, Get, Param, Post, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EducationSystemInitService } from './education-system-init.service';

@Controller('education-systems')
export class EducationSystemController {
  constructor(
    private readonly educationSystemInitService: EducationSystemInitService,
  ) {}

  @Get('countries')
  async getAvailableCountries() {
    return await this.educationSystemInitService.getAvailableCountries();
  }

  @Get()
  async getAllEducationSystems() {
    return await this.educationSystemInitService.getAllEducationSystems();
  }

  @Get(':countryCode')
  async getEducationSystemByCountry(@Param('countryCode') countryCode: string) {
    return await this.educationSystemInitService.getEducationSystemByCountry(countryCode);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  async initializeEducationSystems() {
    await this.educationSystemInitService.initializeEducationSystems();
    return { message: 'Education systems initialized successfully' };
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  async resetEducationSystems() {
    await this.educationSystemInitService.resetEducationSystems();
    return { message: 'Education systems reset and reinitialized successfully' };
  }

  // School Academic Structure Endpoints
  @Get('school/:schoolId/academic-structure')
  @UseGuards(JwtAuthGuard)
  async getSchoolAcademicStructure(@Param('schoolId') schoolId: string) {
    return await this.educationSystemInitService.getSchoolAcademicStructure(schoolId);
  }

  @Post('school/:schoolId/academic-structure')
  @UseGuards(JwtAuthGuard)
  async createSchoolAcademicStructure(
    @Param('schoolId') schoolId: string,
    @Body() body: { templateId: string; selectedLevels: string[] }
  ) {
    return await this.educationSystemInitService.createSchoolAcademicStructure(
      schoolId,
      body.templateId,
      body.selectedLevels
    );
  }

  @Put('school/:schoolId/academic-structure')
  @UseGuards(JwtAuthGuard)
  async updateSchoolAcademicStructure(
    @Param('schoolId') schoolId: string,
    @Body() body: { templateId: string; selectedLevels: string[] }
  ) {
    return await this.educationSystemInitService.updateSchoolAcademicStructure(
      schoolId,
      body.templateId,
      body.selectedLevels
    );
  }

}
