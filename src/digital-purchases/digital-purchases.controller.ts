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
  Put,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { DigitalPurchasesService } from './digital-purchases.service';
import { StreamingService } from './streaming.service';
import { CreateDigitalPurchaseDto } from './dto/create-purchase.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('digital-purchases')
@UseGuards(JwtAuthGuard)
export class DigitalPurchasesController {
  constructor(
    private readonly digitalPurchasesService: DigitalPurchasesService,
    private readonly streamingService: StreamingService,
    private readonly prisma: PrismaService,
  ) {
    console.log(
      '✅ DigitalPurchasesController initialized - routes should be registered',
    );
    console.log(
      'Routes: POST /digital-purchases, GET /digital-purchases/my-library, GET /digital-purchases/:id/view-pdf, etc.',
    );
  }

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
      throw new ForbiddenException('Only students can access this resource');
    }

    return student.id;
  }

  @Post()
  async createPurchase(
    @Request() req,
    @Body() createPurchaseDto: CreateDigitalPurchaseDto,
  ) {
    console.log('✅ POST /digital-purchases endpoint called');
    console.log('Request body:', JSON.stringify(createPurchaseDto, null, 2));
    const { buyerId, buyerType } = await this.getBuyerInfo(req.user.id);
    console.log('Buyer info:', { buyerId, buyerType });
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

    // Check if user is parent - first check Parent table, then fallback to User type
    const parent = await this.prisma.parent.findUnique({
      where: { userId: req.user.id },
    });

    if (parent) {
      return this.digitalPurchasesService.getParentPurchases(req.user.id);
    }

    // Fallback: Check User's type field (case-insensitive)
    // This handles cases where Parent record doesn't exist yet but User type is "parent"
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { type: true },
    });

    if (user && user.type?.toLowerCase() === 'parent') {
      return this.digitalPurchasesService.getParentPurchases(req.user.id);
    }

    throw new ForbiddenException(
      'Only students and parents can access this resource',
    );
  }

  // Route order matters: more specific routes first
  @Get(':id/download-file')
  @Header(
    'Access-Control-Allow-Origin',
    process.env.CORS_ORIGIN || 'http://localhost:3000',
  )
  @Header('Access-Control-Allow-Credentials', 'true')
  async downloadFile(
    @Request() req,
    @Param('id') purchaseId: string,
    @Res() res: Response,
  ) {
    const studentId = await this.getStudentId(req.user.id);
    const purchase: any = await this.digitalPurchasesService.getDownloadLink(
      purchaseId,
      studentId,
    );

    const digitalFile: any = purchase?.content?.files?.[0];
    if (!digitalFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get the file URL - downloadUrl is added by the service
    const fileUrl =
      digitalFile.downloadUrl ||
      digitalFile.imageKitUrl ||
      digitalFile.storagePath;

    // If we still don't have a URL, build it using the service's conversion logic
    let finalFileUrl = fileUrl;
    if (!finalFileUrl && digitalFile.storagePath) {
      // Use the service's conversion method to get the URL
      const service = this.digitalPurchasesService as any;
      if (service.convertFilePathToUrl) {
        finalFileUrl = service.convertFilePathToUrl(digitalFile.storagePath);
      } else {
        // Fallback: build URL manually
        if (digitalFile.storagePath.includes('uploads')) {
          const uploadsIndex = digitalFile.storagePath.indexOf('uploads');
          const relativePath = digitalFile.storagePath.substring(
            uploadsIndex + 'uploads'.length,
          );
          const normalizedPath = relativePath
            .replace(/^[\\/]+/, '')
            .replace(/\\/g, '/');
          finalFileUrl = `/images/${normalizedPath}`;
        }
      }
    }

    if (!finalFileUrl) {
      return res.status(404).json({ message: 'File URL not available' });
    }

    // If it's an ImageKit URL or external URL, proxy it through backend to avoid CORS issues
    if (
      finalFileUrl.startsWith('http://') ||
      finalFileUrl.startsWith('https://')
    ) {
      // For external URLs (ImageKit), fetch and proxy the file to avoid CORS issues
      try {
        const fileResponse = await fetch(finalFileUrl, {
          method: 'GET',
          // Don't include credentials when fetching from external source
        });

        if (!fileResponse.ok) {
          return res.status(fileResponse.status).json({
            message: `Failed to fetch file from external source: ${fileResponse.statusText}`,
          });
        }

        // Get content type from response or file metadata
        const contentType =
          fileResponse.headers.get('content-type') ||
          digitalFile.mimeType ||
          'application/octet-stream';

        // Get content length if available
        const contentLength = fileResponse.headers.get('content-length');

        // Set headers for file download with CORS
        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${digitalFile.originalName || 'download'}"`,
        );
        res.setHeader(
          'Access-Control-Allow-Origin',
          process.env.CORS_ORIGIN || 'http://localhost:3000',
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
          'Access-Control-Expose-Headers',
          'Content-Disposition, Content-Type',
        );
        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }

        // Stream the file from external source to client
        // Convert ReadableStream to Node.js stream if needed
        if (fileResponse.body) {
          // Node.js 18+ fetch returns a web stream, convert to Node stream
          const nodeStream = Readable.fromWeb(fileResponse.body as any);
          nodeStream.pipe(res);
          return;
        } else {
          // Fallback: buffer the entire response (not ideal for large files)
          const buffer = await fileResponse.arrayBuffer();
          res.send(Buffer.from(buffer));
          return;
        }
      } catch (fetchError: any) {
        console.error('Error proxying external file:', fetchError);
        return res.status(500).json({
          message: `Failed to proxy file: ${fetchError.message}`,
        });
      }
    }

    // For local files, serve them with proper headers
    // Convert relative path to absolute file path
    let filePath: string;
    if (finalFileUrl.startsWith('/images/')) {
      // Remove /images/ prefix and join with uploads directory
      const relativePath = finalFileUrl.replace('/images/', '');
      filePath = join(process.cwd(), 'uploads', relativePath);
    } else {
      // Already a local path, use as is if it exists
      if (finalFileUrl.includes('uploads')) {
        const uploadsIndex = finalFileUrl.indexOf('uploads');
        const relativePath = finalFileUrl.substring(uploadsIndex);
        filePath = join(process.cwd(), relativePath);
      } else {
        filePath = finalFileUrl;
      }
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers for file download with CORS
    res.setHeader(
      'Content-Type',
      digitalFile.mimeType || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${digitalFile.originalName || 'download'}"`,
    );
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.CORS_ORIGIN || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Disposition, Content-Type',
    );

    // Stream the file
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  /**
   * Secure PDF viewing endpoint with authorization
   * Checks if user is either:
   * 1. The parent who bought it (buyerId matches)
   * 2. The student who is the beneficiary (studentId matches)
   *
   * IMPORTANT: This route must come before :id/download to ensure proper matching
   */
  @Get(':id/view-pdf')
  @Header(
    'Access-Control-Allow-Origin',
    process.env.CORS_ORIGIN || 'http://localhost:3000',
  )
  @Header('Access-Control-Allow-Credentials', 'true')
  async viewPdf(
    @Request() req,
    @Param('id') purchaseId: string,
    @Res() res: Response,
  ) {
    console.log(
      `[VIEW-PDF] Request from user ${req.user.id} for purchase ${purchaseId}`,
    );

    // Find the purchase
    const purchase = await this.prisma.digitalPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        content: {
          include: {
            files: true, // Include all files first, then filter for PDF
          },
        },
      },
    });

    if (!purchase) {
      console.error(`[VIEW-PDF] Purchase ${purchaseId} not found`);
      return res.status(404).json({ message: 'Purchase not found' });
    }

    console.log(`[VIEW-PDF] Purchase found:`, {
      id: purchase.id,
      status: purchase.status,
      buyerId: purchase.buyerId,
      studentId: purchase.studentId,
      contentId: purchase.contentId,
      filesCount: purchase.content?.files?.length || 0,
    });

    // Check if test mode is enabled (allow PENDING purchases in test mode)
    const isTestMode =
      process.env.PAYMENT_TEST_MODE === 'true' ||
      (process.env.NODE_ENV !== 'production' &&
        process.env.PAYMENT_TEST_MODE !== 'false');

    // Allow access if purchase is COMPLETED, or if in test mode allow PENDING purchases
    if (
      purchase.status !== 'COMPLETED' &&
      !(isTestMode && purchase.status === 'PENDING')
    ) {
      console.error(
        `[VIEW-PDF] Purchase ${purchaseId} not completed (status: ${purchase.status}, testMode: ${isTestMode})`,
      );
      return res.status(403).json({
        message: `Purchase not completed (status: ${purchase.status}). Please complete your payment first.`,
      });
    }

    // Check authorization: user must be either the buyer (parent) OR the beneficiary student
    const isBuyer = purchase.buyerId === req.user.id;

    // Check if user is the beneficiary student
    let isBeneficiary = false;
    const student = await this.prisma.student.findUnique({
      where: { userId: req.user.id },
    });
    if (student && purchase.studentId === student.id) {
      isBeneficiary = true;
    }

    if (!isBuyer && !isBeneficiary) {
      console.error(
        `[VIEW-PDF] Unauthorized access: user ${req.user.id} is not buyer (${purchase.buyerId}) or beneficiary (${purchase.studentId})`,
      );
      return res.status(403).json({
        message:
          'You do not have permission to view this content. Only the buyer or the beneficiary student can access it.',
      });
    }

    console.log(
      `[VIEW-PDF] Authorization granted: isBuyer=${isBuyer}, isBeneficiary=${isBeneficiary}`,
    );

    // Get PDF file - check all files and filter for PDF
    const allFiles = purchase.content?.files || [];
    console.log(
      `[VIEW-PDF] All files in purchase:`,
      allFiles.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        fileType: f.fileType,
        hasImageKitUrl: !!f.imageKitUrl,
        hasStoragePath: !!f.storagePath,
      })),
    );

    const pdfFile = allFiles.find(
      (f) =>
        f.mimeType === 'application/pdf' ||
        f.originalName?.toLowerCase().endsWith('.pdf'),
    );

    if (!pdfFile) {
      console.error(`[VIEW-PDF] No PDF file found for purchase ${purchaseId}`);
      console.error(
        `[VIEW-PDF] Available files:`,
        allFiles.map((f) => ({
          name: f.originalName,
          mimeType: f.mimeType,
          fileType: f.fileType,
        })),
      );
      return res.status(404).json({
        message:
          'PDF file not found for this purchase. Please ensure the content has a PDF file uploaded.',
      });
    }

    console.log(`[VIEW-PDF] PDF file found:`, {
      id: pdfFile.id,
      originalName: pdfFile.originalName,
      mimeType: pdfFile.mimeType,
      hasImageKitUrl: !!pdfFile.imageKitUrl,
      hasStoragePath: !!pdfFile.storagePath,
    });

    // Get file URL (ImageKit URL or local path)
    let fileUrl: string | null = null;
    if (pdfFile.imageKitUrl) {
      fileUrl = pdfFile.imageKitUrl;
    } else if (pdfFile.storagePath) {
      // Convert local path to URL
      if (pdfFile.storagePath.startsWith('http')) {
        fileUrl = pdfFile.storagePath;
      } else {
        // Convert to relative URL for static serving
        const uploadsIndex = pdfFile.storagePath.indexOf('uploads');
        if (uploadsIndex !== -1) {
          const relativePath = pdfFile.storagePath.substring(
            uploadsIndex + 'uploads'.length,
          );
          const normalizedPath = relativePath
            .replace(/^[\\/]+/, '')
            .replace(/\\/g, '/');
          fileUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/images/${normalizedPath}`;
        } else {
          fileUrl = pdfFile.storagePath;
        }
      }
    }

    if (!fileUrl) {
      console.error(
        `[VIEW-PDF] No file URL available for purchase ${purchaseId}`,
      );
      return res.status(404).json({ message: 'File URL not available' });
    }

    console.log(
      `[VIEW-PDF] Streaming PDF from: ${fileUrl.substring(0, 100)}...`,
    );

    // If it's an ImageKit URL or external URL, proxy it through backend
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      try {
        const fileResponse = await fetch(fileUrl, {
          method: 'GET',
        });

        if (!fileResponse.ok) {
          console.error(
            `[VIEW-PDF] Failed to fetch PDF from external source: ${fileResponse.status} ${fileResponse.statusText}`,
          );
          return res.status(fileResponse.status).json({
            message: `Failed to fetch PDF: ${fileResponse.statusText}`,
          });
        }

        // Set headers for PDF viewing (not download)
        const contentType =
          fileResponse.headers.get('content-type') || 'application/pdf';
        const contentLength = fileResponse.headers.get('content-length');

        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${pdfFile.originalName || 'document.pdf'}"`,
        );
        res.setHeader(
          'Access-Control-Allow-Origin',
          process.env.CORS_ORIGIN || 'http://localhost:3000',
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }

        // Stream the PDF from external source to client
        if (fileResponse.body) {
          const nodeStream = Readable.fromWeb(fileResponse.body as any);
          nodeStream.pipe(res);

          // Update stream count
          await this.prisma.digitalPurchase.update({
            where: { id: purchaseId },
            data: {
              streamCount: { increment: 1 },
              lastStreamedAt: new Date(),
            },
          });

          return;
        } else {
          const buffer = await fileResponse.arrayBuffer();
          res.send(Buffer.from(buffer));

          // Update stream count
          await this.prisma.digitalPurchase.update({
            where: { id: purchaseId },
            data: {
              streamCount: { increment: 1 },
              lastStreamedAt: new Date(),
            },
          });

          return;
        }
      } catch (fetchError: any) {
        console.error('[VIEW-PDF] Error proxying external PDF:', fetchError);
        return res.status(500).json({
          message: `Failed to proxy PDF: ${fetchError.message}`,
        });
      }
    }

    // For local files, serve them directly
    let filePath: string;
    if (fileUrl.startsWith('/images/')) {
      const relativePath = fileUrl.replace('/images/', '');
      filePath = join(process.cwd(), 'uploads', relativePath);
    } else {
      filePath = fileUrl;
    }

    if (!existsSync(filePath)) {
      console.error(`[VIEW-PDF] Local file not found: ${filePath}`);
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    // Set headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${pdfFile.originalName || 'document.pdf'}"`,
    );
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.CORS_ORIGIN || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream the file
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);

    // Update stream count
    await this.prisma.digitalPurchase.update({
      where: { id: purchaseId },
      data: {
        streamCount: { increment: 1 },
        lastStreamedAt: new Date(),
      },
    });
  }

  @Get(':id/stream')
  async getStreamLink(
    @Request() req,
    @Param('id') purchaseId: string,
    @Query('quality') quality: 'low' | 'medium' | 'high' = 'medium',
  ) {
    const studentId = await this.getStudentId(req.user.id);
    return this.streamingService.getStreamingUrl(
      purchaseId,
      studentId,
      quality,
    );
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

  @Put(':id/verify-payment')
  async verifyPayment(
    @Request() req,
    @Param('id') purchaseId: string,
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ) {
    const { buyerId } = await this.getBuyerInfo(req.user.id);
    return this.digitalPurchasesService.verifyPayment(
      buyerId,
      purchaseId,
      verifyPaymentDto.paymentReference,
      verifyPaymentDto.paymentMethod,
    );
  }

  @Get('child/:studentId/library')
  async getChildLibrary(@Request() req, @Param('studentId') studentId: string) {
    // Check if user is parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId: req.user.id },
    });

    if (!parent) {
      throw new ForbiddenException('Only parents can access this resource');
    }

    return this.digitalPurchasesService.getChildLibrary(req.user.id, studentId);
  }
}
