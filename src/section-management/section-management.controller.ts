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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SectionManagementService } from './section-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Section Management')
@Controller('section-management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SectionManagementController {
  constructor(
    private readonly sectionManagementService: SectionManagementService,
  ) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get all section templates' })
  @ApiResponse({
    status: 200,
    description: 'Section templates retrieved successfully',
  })
  getSectionTemplates() {
    return this.sectionManagementService.getSectionTemplates();
  }

  @Get('custom-patterns/:schoolId')
  @ApiOperation({ summary: 'Get custom section patterns for a school' })
  @ApiResponse({
    status: 200,
    description: 'Custom section patterns retrieved successfully',
  })
  getCustomSectionPatterns(@Param('schoolId') schoolId: string) {
    return this.sectionManagementService.getCustomSectionPatterns(schoolId);
  }

  @Post('custom-patterns')
  @ApiOperation({ summary: 'Create custom section pattern' })
  @ApiResponse({
    status: 201,
    description: 'Custom section pattern created successfully',
  })
  createCustomSectionPattern(
    @Body()
    body: {
      schoolId: string;
      name: string;
      pattern: string[];
      templateId?: string;
    },
  ) {
    return this.sectionManagementService.createCustomSectionPattern(
      body.schoolId,
      body.name,
      body.pattern,
      body.templateId,
    );
  }

  @Get('sections/:levelId')
  @ApiOperation({ summary: 'Get sections for a specific level' })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  getSectionsForLevel(@Param('levelId') levelId: string) {
    return this.sectionManagementService.getSectionsForLevel(levelId);
  }

  @Post('sections/template')
  @ApiOperation({ summary: 'Create sections from template' })
  @ApiResponse({ status: 201, description: 'Sections created successfully' })
  createSectionsFromTemplate(
    @Body()
    body: {
      levelId: string;
      schoolId: string;
      templateId: string;
      baseClassName: string;
      capacity?: number;
    },
  ) {
    return this.sectionManagementService.createSectionsFromTemplate(
      body.levelId,
      body.schoolId,
      body.templateId,
      body.baseClassName,
      body.capacity,
    );
  }

  @Post('sections/custom-pattern')
  @ApiOperation({ summary: 'Create sections from custom pattern' })
  @ApiResponse({ status: 201, description: 'Sections created successfully' })
  createSectionsFromCustomPattern(
    @Body()
    body: {
      levelId: string;
      schoolId: string;
      customPatternId: string;
      baseClassName: string;
      capacity?: number;
    },
  ) {
    return this.sectionManagementService.createSectionsFromCustomPattern(
      body.levelId,
      body.schoolId,
      body.customPatternId,
      body.baseClassName,
      body.capacity,
    );
  }

  @Post('sections/pattern')
  @ApiOperation({ summary: 'Create sections from pattern array' })
  @ApiResponse({ status: 201, description: 'Sections created successfully' })
  createSectionsFromPattern(
    @Body()
    body: {
      levelId: string;
      schoolId: string;
      pattern: string[];
      baseClassName: string;
      capacity?: number;
    },
  ) {
    return this.sectionManagementService.createSectionsFromPattern(
      body.levelId,
      body.schoolId,
      body.pattern,
      body.baseClassName,
      body.capacity,
    );
  }

  @Post('sections/add')
  @ApiOperation({ summary: 'Add single section to a level' })
  @ApiResponse({ status: 201, description: 'Section added successfully' })
  addSection(
    @Body()
    body: {
      levelId: string;
      schoolId: string;
      sectionName: string;
      baseClassName: string;
      capacity?: number;
    },
  ) {
    return this.sectionManagementService.addSection(
      body.levelId,
      body.schoolId,
      body.sectionName,
      body.baseClassName,
      body.capacity,
    );
  }

  @Put('sections/:sectionId')
  @ApiOperation({ summary: 'Update section' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body()
    body: {
      sectionName?: string;
      capacity?: number;
      baseClassName?: string;
    },
  ) {
    return this.sectionManagementService.updateSection(sectionId, body);
  }

  @Delete('sections/:sectionId')
  @ApiOperation({ summary: 'Remove section' })
  @ApiResponse({ status: 200, description: 'Section removed successfully' })
  removeSection(@Param('sectionId') sectionId: string) {
    return this.sectionManagementService.removeSection(sectionId);
  }

  @Put('sections/reorder/:levelId')
  @ApiOperation({ summary: 'Reorder sections' })
  @ApiResponse({ status: 200, description: 'Sections reordered successfully' })
  reorderSections(
    @Param('levelId') levelId: string,
    @Body() body: { sectionIds: string[] },
  ) {
    return this.sectionManagementService.reorderSections(
      levelId,
      body.sectionIds,
    );
  }

  @Get('sections/:levelId/statistics')
  @ApiOperation({ summary: 'Get section statistics' })
  @ApiResponse({
    status: 200,
    description: 'Section statistics retrieved successfully',
  })
  getSectionStatistics(@Param('levelId') levelId: string) {
    return this.sectionManagementService.getSectionStatistics(levelId);
  }
}
