export declare class MessageResponseDto {
    id: string;
    senderId: string;
    recipientId: string;
    subject: string;
    content: string;
    type: string;
    priority: string;
    isRead: boolean;
    readAt?: Date;
    parentMessageId?: string;
    attachments: string[];
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        type: string;
        profilePicture?: string;
    };
    recipient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        type: string;
        profilePicture?: string;
    };
}
export declare class AnnouncementResponseDto {
    id: string;
    schoolId: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    targetAudience: string;
    targetClassIds: string[];
    targetStudentIds: string[];
    isPublished: boolean;
    scheduledAt?: Date;
    publishedAt?: Date;
    expiresAt?: Date;
    attachments: string[];
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
    school: {
        id: string;
        name: string;
        logo?: string;
    };
}
export declare class NotificationResponseDto {
    id: string;
    userId: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    isRead: boolean;
    readAt?: Date;
    actionUrl?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
