import { PrismaService } from '../prisma/prisma.service';
import { ImageKitService } from '../imagekit/imagekit.service';
export declare class StreamingService {
    private prisma;
    private imageKitService;
    constructor(prisma: PrismaService, imageKitService: ImageKitService);
    getStreamingUrl(purchaseId: string, studentId: string, quality?: 'low' | 'medium' | 'high'): Promise<{
        url: string;
        fileType: string | null;
        originalName: string;
        size: number;
        quality: "low" | "medium" | "high";
        streamCount: number;
    }>;
    private generateStreamingUrl;
    private generatePdfViewerUrl;
    private generateEpubViewerUrl;
    getStreamingAnalytics(contentId: string): Promise<{
        contentId: string;
        title: string;
        totalStreams: number;
        uniqueStreamers: number;
        contentStreamCount: number;
        recentStreams: {
            student: {
                user: {
                    firstName: string;
                    lastName: string;
                };
            };
            streamCount: number;
            lastStreamedAt: Date | null;
        }[];
    }>;
}
