import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SettingsService } from './settings.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get users by type' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findByType(@Param('type') type: string) {
    return this.usersService.findByType(type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ==================== USER SETTINGS ENDPOINTS ====================

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserSettings(@Param('id') id: string) {
    return this.settingsService.getUserSettings(id);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserSettings(@Param('id') id: string, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateUserSettings(id, updateSettingsDto);
  }

  @Get(':id/settings/export')
  @ApiOperation({ summary: 'Export user settings' })
  @ApiResponse({ status: 200, description: 'Settings exported successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  exportUserSettings(@Param('id') id: string) {
    return this.settingsService.exportUserSettings(id);
  }

  @Post(':id/settings/import')
  @ApiOperation({ summary: 'Import user settings' })
  @ApiResponse({ status: 200, description: 'Settings imported successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  importUserSettings(@Param('id') id: string, @Body() settingsData: any) {
    return this.settingsService.importUserSettings(id, settingsData);
  }

  @Post(':id/settings/reset')
  @ApiOperation({ summary: 'Reset user settings to defaults' })
  @ApiResponse({ status: 200, description: 'Settings reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  resetUserSettings(@Param('id') id: string) {
    return this.settingsService.resetUserSettings(id);
  }
} 