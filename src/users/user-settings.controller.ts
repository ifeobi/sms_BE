import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto, UserSettingsResponseDto } from './dto/user-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('User Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully',
    type: UserSettingsResponseDto,
  })
  async getUserSettings(@Request() req): Promise<UserSettingsResponseDto> {
    return this.userSettingsService.getUserSettings(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings updated successfully',
    type: UserSettingsResponseDto,
  })
  async updateUserSettings(
    @Request() req,
    @Body() updateDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    return this.userSettingsService.updateUserSettings(req.user.id, updateDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user settings (reset to defaults)' })
  @ApiResponse({
    status: 200,
    description: 'User settings deleted successfully',
  })
  async deleteUserSettings(@Request() req): Promise<{ message: string }> {
    await this.userSettingsService.deleteUserSettings(req.user.id);
    return { message: 'User settings deleted successfully' };
  }
}
