import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { MessageResponseDto, AnnouncementResponseDto } from './dto/communication-response.dto';
export declare class CommunicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<MessageResponseDto>;
    getUserMessages(userId: string, page?: number, limit?: number): Promise<MessageResponseDto[]>;
    getInboxMessages(userId: string, page?: number, limit?: number): Promise<MessageResponseDto[]>;
    getSentMessages(userId: string, page?: number, limit?: number): Promise<MessageResponseDto[]>;
    markMessageAsRead(userId: string, messageId: string): Promise<MessageResponseDto>;
    deleteMessage(userId: string, messageId: string): Promise<void>;
    createAnnouncement(schoolId: string, createAnnouncementDto: CreateAnnouncementDto): Promise<AnnouncementResponseDto>;
    getSchoolAnnouncements(schoolId: string, page?: number, limit?: number): Promise<AnnouncementResponseDto[]>;
    getParentAnnouncements(parentId: string, page?: number, limit?: number): Promise<AnnouncementResponseDto[]>;
    getParentRecipients(parentId: string): Promise<any[]>;
    getTeacherRecipients(teacherId: string): Promise<any[]>;
    getSchoolAdminRecipients(adminId: string): Promise<any[]>;
    private mapMessageToResponse;
    private mapAnnouncementToResponse;
}
