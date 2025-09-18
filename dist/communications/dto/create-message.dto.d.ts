export declare enum MessageType {
    MESSAGE = "MESSAGE",
    ANNOUNCEMENT = "ANNOUNCEMENT",
    NOTIFICATION = "NOTIFICATION"
}
export declare enum MessagePriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class CreateMessageDto {
    recipientId: string;
    subject: string;
    content: string;
    type?: MessageType;
    priority?: MessagePriority;
    parentMessageId?: string;
    attachments?: string[];
    metadata?: any;
}
