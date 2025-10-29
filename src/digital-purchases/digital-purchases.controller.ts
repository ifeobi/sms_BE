import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { DigitalPurchasesService } from './digital-purchases.service';
import { StreamingService } from './streaming.service';
import { CreateDigitalPurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('digital-purchases')
@UseGuards(JwtAuthGuard)
export class DigitalPurchasesController {
  constructor(
    private readonly digitalPurchasesService: DigitalPurchasesService,
    private readonly streamingService: StreamingService,
    private readonly prisma: PrismaService,
  ) {}

  private async getBuyerInfo(userId: string): Promise<{
    buyerId: string;
    buyerType: 'PARENT' | 'STUDENT';
  }> {
    // Check if user is a student
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (student) {
      return {
        buyerId: userId,
        buyerType: 'STUDENT',
      };
    }

    // Check if user is a parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
    });

    if (parent) {
      return {
        buyerId: userId,
        buyerType: 'PARENT',
      };
    }

    throw new ForbiddenException(
      'Only students and parents can purchase digital content',
    );
  }

  private async getStudentId(userId: string): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new ForbiddenException(
        'Only students can access this resource',
      );
    }

    return student.id;
  }

  @Post()
  async createPurchase(
    @Request() req,
    @Body() createPurchaseDto: CreateDigitalPurchaseDto,
  ) {
    const { buyerId, buyerType } = await this.getBuyerInfo(req.user.id);
    return this.digitalPurchasesService.createPurchase(
      buyerId,
      buyerType,
      createPurchaseDto,
    );
  }

  @Get('my-library')
  async getMyLibrary(@Request() req) {
    // Check if user is student
    const student = await this.prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (student) {
      return this.digitalPurchasesService.getStudentLibrary(student.id);
    }

    // Check if user is parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId: req.user.id },
    });

    if (parent) {
      return this.digitalPurchasesService.getParentPurchases(req.user.id);
    }

    throw new ForbiddenException('Only students and parents can access this resource');
  }

  @Get(':id/download')
  async getDownloadLink(@Request() req, @Param('id') purchaseId: string) {
    const studentId = await this.getStudentId(req.user.id);
    return this.digitalPurchasesService.getDownloadLink(purchaseId, studentId);
  }

  @Get(':id/stream')
  async getStreamLink(
    @Request() req, 
    @Param('id') purchaseId: string,
    @Query('quality') quality: 'low' | 'medium' | 'high' = 'medium'
  ) {
    const studentId = await this.getStudentId(req.user.id);
    return this.streamingService.getStreamingUrl(purchaseId, studentId, quality);
  }

  @Get('analytics/:contentId')
  async getStreamingAnalytics(@Param('contentId') contentId: string) {
    return this.streamingService.getStreamingAnalytics(contentId);
  }

  @Get('has-access/:contentId')
  async hasAccess(@Request() req, @Param('contentId') contentId: string) {
    try {
      const studentId = await this.getStudentId(req.user.id);
      const hasAccess = await this.digitalPurchasesService.hasAccess(
        studentId,
        contentId,
      );
      return { hasAccess };
    } catch {
      return { hasAccess: false };
    }
  }
}
