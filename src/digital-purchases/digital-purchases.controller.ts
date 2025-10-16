import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { DigitalPurchasesService } from './digital-purchases.service';
import { CreateDigitalPurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('digital-purchases')
@UseGuards(JwtAuthGuard)
export class DigitalPurchasesController {
  constructor(
    private readonly digitalPurchasesService: DigitalPurchasesService,
    private readonly prisma: PrismaService,
  ) {}

  private async getStudentId(userId: string): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new ForbiddenException(
        'Only students can purchase digital content',
      );
    }

    return student.id;
  }

  @Post()
  async createPurchase(
    @Request() req,
    @Body() createPurchaseDto: CreateDigitalPurchaseDto,
  ) {
    const studentId = await this.getStudentId(req.user.id);
    return this.digitalPurchasesService.createPurchase(
      studentId,
      createPurchaseDto,
    );
  }

  @Get('my-library')
  async getMyLibrary(@Request() req) {
    const studentId = await this.getStudentId(req.user.id);
    return this.digitalPurchasesService.getStudentLibrary(studentId);
  }

  @Get(':id/download')
  async getDownloadLink(@Request() req, @Param('id') purchaseId: string) {
    const studentId = await this.getStudentId(req.user.id);
    return this.digitalPurchasesService.getDownloadLink(purchaseId, studentId);
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
