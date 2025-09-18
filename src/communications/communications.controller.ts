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
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunicationsService } from './communications.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { MessageResponseDto, AnnouncementResponseDto } from './dto/communication-response.dto';

@ApiTags('Communications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  // ==================== MESSAGE ENDPOINTS ====================

  @Post('messages')
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: MessageResponseDto,
  })
  async sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    try {
      const userId = req.user.id;
      return await this.communicationsService.createMessage(userId, createMessageDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get user messages (sent and received)' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [MessageResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getUserMessages(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const userId = req.user.id;
      return await this.communicationsService.getUserMessages(userId, page, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get messages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages/inbox')
  @ApiOperation({ summary: 'Get inbox messages (received only)' })
  @ApiResponse({
    status: 200,
    description: 'Inbox messages retrieved successfully',
    type: [MessageResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getInboxMessages(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const userId = req.user.id;
      return await this.communicationsService.getInboxMessages(userId, page, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get inbox messages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages/sent')
  @ApiOperation({ summary: 'Get sent messages' })
  @ApiResponse({
    status: 200,
    description: 'Sent messages retrieved successfully',
    type: [MessageResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getSentMessages(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const userId = req.user.id;
      return await this.communicationsService.getSentMessages(userId, page, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get sent messages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
    type: MessageResponseDto,
  })
  async markMessageAsRead(@Request() req, @Param('id') messageId: string) {
    try {
      const userId = req.user.id;
      return await this.communicationsService.markMessageAsRead(userId, messageId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark message as read',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
  })
  async deleteMessage(@Request() req, @Param('id') messageId: string) {
    try {
      const userId = req.user.id;
      await this.communicationsService.deleteMessage(userId, messageId);
      return { message: 'Message deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete message',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== RECIPIENTS ENDPOINT ====================

  @Get('recipients')
  @ApiOperation({ summary: 'Get available message recipients for user' })
  @ApiResponse({
    status: 200,
    description: 'Recipients retrieved successfully',
  })
  async getRecipients(@Request() req) {
    try {
      const userId = req.user.id;
      const userType = req.user.type;

      if (userType.toLowerCase() === 'parent') {
        // For parents, get teachers and school staff from their children's schools
        return await this.communicationsService.getParentRecipients(userId);
      } else if (userType.toLowerCase() === 'teacher') {
        // For teachers, get parents of their students
        return await this.communicationsService.getTeacherRecipients(userId);
      } else if (userType.toLowerCase() === 'school_admin') {
        // For school admins, get all parents and teachers in their school
        return await this.communicationsService.getSchoolAdminRecipients(userId);
      } else {
        throw new HttpException('Access denied. Invalid user type for messaging.', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get recipients',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== ANNOUNCEMENT ENDPOINTS ====================

  @Post('announcements')
  @ApiOperation({ summary: 'Create a new announcement (School Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
    type: AnnouncementResponseDto,
  })
  async createAnnouncement(@Request() req, @Body() createAnnouncementDto: CreateAnnouncementDto) {
    try {
      const userType = req.user.type;
      
      // Only school admins can create announcements
      if (userType.toLowerCase() !== 'school_admin') {
        throw new HttpException('Access denied. Only school admins can create announcements.', HttpStatus.FORBIDDEN);
      }

      // Get school ID from user's school admin relationship
      const schoolAdmin = await this.communicationsService['prisma'].schoolAdmin.findUnique({
        where: { userId: req.user.id },
      });

      if (!schoolAdmin) {
        throw new HttpException('School admin relationship not found', HttpStatus.NOT_FOUND);
      }

      return await this.communicationsService.createAnnouncement(schoolAdmin.schoolId, createAnnouncementDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create announcement',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Get announcements for user' })
  @ApiResponse({
    status: 200,
    description: 'Announcements retrieved successfully',
    type: [AnnouncementResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getAnnouncements(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      const userType = req.user.type;
      const userId = req.user.id;

      if (userType.toLowerCase() === 'parent') {
        return await this.communicationsService.getParentAnnouncements(userId, page, limit);
      } else if (userType.toLowerCase() === 'school_admin') {
        // Get school ID from user's school admin relationship
        const schoolAdmin = await this.communicationsService['prisma'].schoolAdmin.findUnique({
          where: { userId: req.user.id },
        });

        if (!schoolAdmin) {
          throw new HttpException('School admin relationship not found', HttpStatus.NOT_FOUND);
        }

        return await this.communicationsService.getSchoolAnnouncements(schoolAdmin.schoolId, page, limit);
      } else {
        throw new HttpException('Access denied. Only parents and school admins can view announcements.', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get announcements',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('announcements/school/:schoolId')
  @ApiOperation({ summary: 'Get announcements for a specific school' })
  @ApiResponse({
    status: 200,
    description: 'School announcements retrieved successfully',
    type: [AnnouncementResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getSchoolAnnouncements(
    @Param('schoolId') schoolId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    try {
      return await this.communicationsService.getSchoolAnnouncements(schoolId, page, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get school announcements',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
