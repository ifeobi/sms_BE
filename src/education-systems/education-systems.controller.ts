import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EducationSystemsService } from './education-systems.service';
import { EducationSystem } from './interfaces/education-system.interface';

@ApiTags('Education Systems')
@Controller('education-systems')
export class EducationSystemsController {
  constructor(
    private readonly educationSystemsService: EducationSystemsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all education systems' })
  @ApiResponse({
    status: 200,
    description: 'Education systems retrieved successfully',
  })
  getAllEducationSystems(): EducationSystem[] {
    return this.educationSystemsService.getAllEducationSystems();
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get available countries' })
  @ApiResponse({ status: 200, description: 'Countries retrieved successfully' })
  getAvailableCountries() {
    return this.educationSystemsService.getAvailableCountries();
  }

  @Get('countries/:countryCode/levels')
  @ApiOperation({ summary: 'Get school levels for a country' })
  @ApiResponse({
    status: 200,
    description: 'School levels retrieved successfully',
  })
  getSchoolLevelDisplayNames(@Param('countryCode') countryCode: string) {
    return this.educationSystemsService.getSchoolLevelDisplayNames(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get education system by ID' })
  @ApiResponse({
    status: 200,
    description: 'Education system retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Education system not found' })
  getEducationSystemById(@Param('id') id: string): EducationSystem | null {
    return this.educationSystemsService.getEducationSystemById(id);
  }
}
