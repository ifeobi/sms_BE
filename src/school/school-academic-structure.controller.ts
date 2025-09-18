import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolAcademicStructureService } from './school-academic-structure.service';
import { UpdateAcademicStructureDto } from './dto/update-academic-structure.dto';

@ApiTags('School Academic Structure')
@Controller('school')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchoolAcademicStructureController {
  constructor(
    private readonly academicStructureService: SchoolAcademicStructureService,
  ) {}

  @Get('academic-structure')
  @ApiOperation({ summary: 'Get school academic structure' })
  @ApiResponse({ status: 200, description: 'Academic structure retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Academic structure not found' })
  async getAcademicStructure(@Request() req) {
    console.log('📥📥📥 GET REQUEST RECEIVED IN CONTROLLER 📥📥📥');
    console.log('User ID:', req.user?.id);
    
    const userId = req.user.id;
    const result = await this.academicStructureService.getAcademicStructureByUserId(userId);
    
    console.log('📥 GET Controller returning result with selectedLevels:', result?.selectedLevels);
    return result;
  }

  @Put('academic-structure')
  @ApiOperation({ summary: 'Update school academic structure' })
  @ApiResponse({ status: 200, description: 'Academic structure updated successfully' })
  @ApiResponse({ status: 404, description: 'Academic structure not found' })
  async updateAcademicStructure(
    @Request() req,
    @Body() updateDto: UpdateAcademicStructureDto,
  ) {
    console.log('🎯🎯🎯 PUT REQUEST RECEIVED IN CONTROLLER 🎯🎯🎯');
    console.log('Raw request body:', req.body);
    console.log('Parsed DTO:', updateDto);
    console.log('DTO selectedLevels:', updateDto?.selectedLevels);
    console.log('DTO selectedLevels type:', typeof updateDto?.selectedLevels);
    console.log('User ID:', req.user?.id);
    
    const userId = req.user.id;
    const result = await this.academicStructureService.updateAcademicStructure(userId, updateDto);
    
    console.log('🎯 Controller returning result:', result);
    return result;
  }
}
