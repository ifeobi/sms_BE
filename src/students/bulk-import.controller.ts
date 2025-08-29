import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BulkImportService } from './bulk-import.service';
import {
  BulkStudentImportDto,
  VerificationCodeDto,
  BulkImportResponseDto,
  BulkImportProgressDto,
  ParentLinkResponseDto,
} from './dto/bulk-student-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Bulk Student Import')
@Controller('bulk-import')
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post('students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start bulk student import' })
  @ApiResponse({
    status: 201,
    description: 'Bulk import started successfully',
    type: BulkImportResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startBulkImport(
    @Body() importData: BulkStudentImportDto,
    @Request() req: any,
  ): Promise<BulkImportResponseDto> {
    try {
      // Get school ID from user context (assuming school admin)
      const schoolId = req.user.schoolId;
      if (!schoolId) {
        throw new HttpException(
          'School ID not found in user context',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.bulkImportService.startBulkImport(
        schoolId,
        req.user.id,
        importData,
      );

      return {
        id: result.id,
        totalRecords: result.totalRecords,
        successfulRecords: 0,
        failedRecords: 0,
        status: result.status,
        createdAt: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to start bulk import',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('progress/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bulk import progress' })
  @ApiResponse({
    status: 200,
    description: 'Bulk import progress retrieved successfully',
    type: BulkImportProgressDto,
  })
  @ApiResponse({ status: 404, description: 'Bulk import not found' })
  async getBulkImportProgress(
    @Param('id') id: string,
  ): Promise<BulkImportProgressDto> {
    try {
      const progress = await this.bulkImportService.getBulkImportProgress(id);

      return {
        id: progress.id,
        status: progress.status,
        totalRecords: progress.totalRecords,
        successfulRecords: progress.successfulRecords,
        failedRecords: progress.failedRecords,
        progress: progress.progress,
        estimatedTimeRemaining: this.calculateEstimatedTime(progress),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get bulk import progress',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-parent')
  @ApiOperation({ summary: 'Verify parent-child relationship code' })
  @ApiResponse({
    status: 200,
    description: 'Parent verification successful',
    type: ParentLinkResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  async verifyParentCode(
    @Body() verificationData: VerificationCodeDto,
  ): Promise<ParentLinkResponseDto> {
    try {
      const result = await this.bulkImportService.verifyParentCode(
        verificationData.email,
        verificationData.code,
      );

      return {
        success: result.success,
        message: result.message,
        parentId: result.parentId,
        studentId: result.studentId,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Verification failed',
      };
    }
  }

  private calculateEstimatedTime(progress: any): number | undefined {
    if (progress.status !== 'PROCESSING' || progress.progress === 0) {
      return undefined;
    }

    const elapsedTime = Date.now() - new Date(progress.createdAt).getTime();
    const recordsProcessed =
      progress.successfulRecords + progress.failedRecords;

    if (recordsProcessed === 0) {
      return undefined;
    }

    const timePerRecord = elapsedTime / recordsProcessed;
    const remainingRecords = progress.totalRecords - recordsProcessed;
    const estimatedTimeRemaining = timePerRecord * remainingRecords;

    return Math.round(estimatedTimeRemaining / 1000); // Return in seconds
  }
}
