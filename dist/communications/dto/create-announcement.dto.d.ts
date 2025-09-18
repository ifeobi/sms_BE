export declare enum AnnouncementType {
    GENERAL = "GENERAL",
    ACADEMIC = "ACADEMIC",
    FINANCIAL = "FINANCIAL",
    EMERGENCY = "EMERGENCY",
    EVENT = "EVENT"
}
export declare enum AnnouncementAudience {
    ALL_PARENTS = "ALL_PARENTS",
    ALL_STUDENTS = "ALL_STUDENTS",
    ALL_TEACHERS = "ALL_TEACHERS",
    SPECIFIC_CLASS = "SPECIFIC_CLASS",
    SPECIFIC_STUDENTS = "SPECIFIC_STUDENTS",
    SCHOOL_WIDE = "SCHOOL_WIDE"
}
export declare enum MessagePriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class CreateAnnouncementDto {
    title: string;
    content: string;
    type?: AnnouncementType;
    priority?: MessagePriority;
    targetAudience?: AnnouncementAudience;
    targetClassIds?: string[];
    targetStudentIds?: string[];
    scheduledAt?: string;
    expiresAt?: string;
    attachments?: string[];
    metadata?: any;
}
