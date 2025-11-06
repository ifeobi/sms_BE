import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../imagekit/imagekit.service';

@Injectable()
export class StreamingService {
  constructor(
    private prisma: PrismaService,
    private imageKitService: ImageKitService,
  ) {}

  /**
   * Get streaming URL for digital content based on file type
   */
  async getStreamingUrl(
    purchaseId: string,
    studentId: string,
    quality: 'low' | 'medium' | 'high' = 'medium',
  ) {
    const purchase = await this.prisma.digitalPurchase.findFirst({
      where: {
        id: purchaseId,
        studentId,
        status: 'COMPLETED',
      },
      include: {
        content: {
          include: {
            files: {
              where: {
                fileType: {
                  in: [
                    'DIGITAL_FILE',
                    'VIDEO_FILE',
                    'AUDIO_FILE',
                    'WORKSHEET_FILE',
                    'ASSIGNMENT_FILE',
                    'PAST_QUESTIONS_FILE',
                    'NOTES_FILE',
                    'INTERACTIVE_FILE',
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found or not completed');
    }

    const digitalFile = purchase.content.files[0];
    if (!digitalFile) {
      throw new NotFoundException('No digital file found for this content');
    }

    // Generate streaming URL based on file type
    const streamingUrl = await this.generateStreamingUrl(
      digitalFile,
      quality,
    );

    // Update stream count
    await this.prisma.digitalPurchase.update({
      where: { id: purchaseId },
      data: {
        streamCount: { increment: 1 },
        lastStreamedAt: new Date(),
      },
    });

    // Update content stream count
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        streamCount: { increment: 1 },
      },
    });

    return {
      url: streamingUrl,
      fileType: digitalFile.mimeType,
      originalName: digitalFile.originalName,
      size: Number(digitalFile.sizeBytes),
      quality,
      streamCount: purchase.streamCount + 1,
    };
  }

  /**
   * Convert absolute file path to relative URL for static file serving
   * Handles both ImageKit URLs (returns as-is) and local file paths (converts to relative)
   */
  private convertFilePathToUrl(filePath: string): string | null {
    if (!filePath) {
      return null;
    }

    // If it's already an ImageKit URL or HTTP/HTTPS URL, return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // If it's an absolute Windows path, convert to relative path
    if (filePath.includes('uploads')) {
      // Extract the relative path from the absolute path
      const uploadsIndex = filePath.indexOf('uploads');
      if (uploadsIndex !== -1) {
        const relativePath = filePath.substring(uploadsIndex + 'uploads'.length);
        // Remove leading slashes and normalize
        const normalizedPath = relativePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
        // Return as /images/... for static file serving
        return `/images/${normalizedPath}`;
      }
    }

    // If it's already a relative path starting with /images/, return as-is
    if (filePath.startsWith('/images/')) {
      return filePath;
    }

    // For other relative paths, assume they're in uploads
    return `/images/${filePath.replace(/^[\\/]+/, '').replace(/\\/g, '/')}`;
  }

  private async generateStreamingUrl(
    file: any,
    quality: 'low' | 'medium' | 'high',
  ): Promise<string> {
    const mimeType = file.mimeType || '';
    
    // Priority: ImageKit URL (for new uploads) > Local file path conversion (for legacy content)
    let fileUrl: string | null = null;
    if (file.imageKitUrl) {
      fileUrl = file.imageKitUrl; // Use ImageKit URL directly for new uploads
    } else if (file.storagePath) {
      // Convert local file path to accessible URL
      const convertedPath = this.convertFilePathToUrl(file.storagePath);
      if (convertedPath) {
        // Prepend base URL if it's a relative path
        if (!convertedPath.startsWith('http')) {
          const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
          fileUrl = `${baseUrl}${convertedPath}`;
        } else {
          fileUrl = convertedPath;
        }
      } else {
        // Fallback to original storage path if conversion fails
        fileUrl = file.storagePath;
      }
    }

    if (!fileUrl) {
      throw new BadRequestException('No file URL available for streaming');
    }

    // For video files, use ImageKit's adaptive streaming (only if ImageKit file ID exists)
    if (mimeType.startsWith('video/') && file.imageKitFileId) {
      return this.imageKitService.getAdaptiveVideoUrl(
        file.imageKitFileId,
        quality,
      );
    }

    // For PDF files, use ImageKit's document viewer (only if ImageKit URL exists)
    if (mimeType === 'application/pdf' && file.imageKitUrl) {
      return this.generatePdfViewerUrl(fileUrl, quality);
    }

    // For EPUB files, use ImageKit's document viewer (only if ImageKit URL exists)
    if (mimeType === 'application/epub+zip' && file.imageKitUrl) {
      return this.generateEpubViewerUrl(fileUrl, quality);
    }

    // For other file types (including local files), return direct URL
    return fileUrl;
  }

  /**
   * Generate PDF viewer URL with quality settings
   */
  private generatePdfViewerUrl(baseUrl: string, quality: string): string {
    const qualitySettings = {
      low: '?q=60&w=800',
      medium: '?q=80&w=1200',
      high: '?q=90&w=1600',
    };

    return `${baseUrl}${qualitySettings[quality]}`;
  }

  /**
   * Generate EPUB viewer URL with quality settings
   */
  private generateEpubViewerUrl(baseUrl: string, quality: string): string {
    const qualitySettings = {
      low: '?q=60&w=800',
      medium: '?q=80&w=1200',
      high: '?q=90&w=1600',
    };

    return `${baseUrl}${qualitySettings[quality]}`;
  }

  /**
   * Get streaming analytics for content
   */
  async getStreamingAnalytics(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        digitalPurchases: {
          select: {
            streamCount: true,
            lastStreamedAt: true,
            student: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const totalStreams = content.digitalPurchases.reduce(
      (sum, purchase) => sum + purchase.streamCount,
      0,
    );

    const uniqueStreamers = content.digitalPurchases.filter(
      (purchase) => purchase.streamCount > 0,
    ).length;

    return {
      contentId,
      title: content.title,
      totalStreams,
      uniqueStreamers,
      contentStreamCount: content.streamCount,
      recentStreams: content.digitalPurchases
        .filter((p) => p.lastStreamedAt)
        .sort((a, b) => 
          new Date(b.lastStreamedAt!).getTime() - 
          new Date(a.lastStreamedAt!).getTime()
        )
        .slice(0, 10),
    };
  }
}
