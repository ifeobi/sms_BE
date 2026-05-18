import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SchoolScopeGuard } from '../auth/guards/school-scope.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '@prisma/client';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard, SchoolScopeGuard)
@Roles(UserType.SCHOOL_ADMIN)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    const result = await this.staffService.create(createStaffDto);
    console.log('🎯 [CONTROLLER] Returning result with temporaryPassword:', (result as any)?.temporaryPassword);
    return result;
  }

  @Get()
  findAll(@Query('schoolId') schoolId: string) {
    if (!schoolId) {
      throw new Error('School ID is required');
    }
    return this.staffService.findAll(schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  @Get('school/:schoolId')
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.staffService.findBySchool(schoolId);
  }
}
