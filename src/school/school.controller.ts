import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolService } from './school.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('School')
@Controller('school')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get school profile' })
  @ApiResponse({
    status: 200,
    description: 'School profile retrieved successfully',
  })
  async getSchoolProfile(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'school_admin') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.schoolService.getSchoolProfile(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get school profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('admin-role')
  @ApiOperation({ summary: 'Get school admin role and details' })
  @ApiResponse({
    status: 200,
    description: 'School admin role retrieved successfully',
  })
  async getSchoolAdminRole(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'school_admin') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.schoolService.getSchoolAdminRole(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get school admin role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
  })
  async getDashboardStats(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'school_admin') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.schoolService.getDashboardStats(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get dashboard stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard/activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'school_admin') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.schoolService.getRecentActivity(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get recent activity',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard/events')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully',
  })
  async getUpcomingEvents(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() !== 'school_admin') {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return await this.schoolService.getUpcomingEvents(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get upcoming events',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('parents')
  @ApiOperation({ summary: 'Get parents linked to this school' })
  @ApiResponse({
    status: 200,
    description: 'Parents retrieved successfully',
  })
  async getSchoolParents(@Request() req) {
    if (req.user?.type?.toLowerCase() !== 'school_admin') {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    try {
      return await this.schoolService.getParentsForSchool(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get parents',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
