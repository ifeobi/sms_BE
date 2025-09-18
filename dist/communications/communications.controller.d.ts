import { CommunicationsService } from './communications.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { MessageResponseDto, AnnouncementResponseDto } from './dto/communication-response.dto';
export declare class CommunicationsController {
    private readonly communicationsService;
    constructor(communicationsService: CommunicationsService);
    sendMessage(req: any, createMessageDto: CreateMessageDto): Promise<MessageResponseDto>;
    getUserMessages(req: any, page?: number, limit?: number): Promise<MessageResponseDto[]>;
    getInboxMessages(req: any, page?: number, limit?: number): Promise<MessageResponseDto[]>;
    getSentMessages(req: any, page?: number, limit?: number): Promise<MessageResponseDto[]>;
    markMessageAsRead(req: any, messageId: string): Promise<MessageResponseDto>;
    deleteMessage(req: any, messageId: string): Promise<{
        message: string;
    }>;
    getRecipients(req: any): Promise<any[]>;
    createAnnouncement(req: any, createAnnouncementDto: CreateAnnouncementDto): Promise<AnnouncementResponseDto>;
    getAnnouncements(req: any, page?: number, limit?: number): Promise<AnnouncementResponseDto[]>;
    getSchoolAnnouncements(schoolId: string, page?: number, limit?: number): Promise<AnnouncementResponseDto[]>;
}
