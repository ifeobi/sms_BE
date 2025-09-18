import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ description: 'Message ID' })
  id: string;

  @ApiProperty({ description: 'Sender user ID' })
  senderId: string;

  @ApiProperty({ description: 'Recipient user ID' })
  recipientId: string;

  @ApiProperty({ description: 'Message subject' })
  subject: string;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Message type' })
  type: string;

  @ApiProperty({ description: 'Message priority' })
  priority: string;

  @ApiProperty({ description: 'Is message read' })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Read timestamp' })
  readAt?: Date;

  @ApiPropertyOptional({ description: 'Parent message ID for replies' })
  parentMessageId?: string;

  @ApiProperty({ description: 'File attachments' })
  attachments: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  // Sender and recipient details
  @ApiProperty({ description: 'Sender details' })
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    profilePicture?: string;
  };

  @ApiProperty({ description: 'Recipient details' })
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    profilePicture?: string;
  };
}

export class AnnouncementResponseDto {
  @ApiProperty({ description: 'Announcement ID' })
  id: string;

  @ApiProperty({ description: 'School ID' })
  schoolId: string;

  @ApiProperty({ description: 'Announcement title' })
  title: string;

  @ApiProperty({ description: 'Announcement content' })
  content: string;

  @ApiProperty({ description: 'Announcement type' })
  type: string;

  @ApiProperty({ description: 'Message priority' })
  priority: string;

  @ApiProperty({ description: 'Target audience' })
  targetAudience: string;

  @ApiProperty({ description: 'Target class IDs' })
  targetClassIds: string[];

  @ApiProperty({ description: 'Target student IDs' })
  targetStudentIds: string[];

  @ApiProperty({ description: 'Is published' })
  isPublished: boolean;

  @ApiPropertyOptional({ description: 'Scheduled timestamp' })
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Published timestamp' })
  publishedAt?: Date;

  @ApiPropertyOptional({ description: 'Expiration timestamp' })
  expiresAt?: Date;

  @ApiProperty({ description: 'File attachments' })
  attachments: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'School details' })
  school: {
    id: string;
    name: string;
    logo?: string;
  };
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification content' })
  content: string;

  @ApiProperty({ description: 'Notification type' })
  type: string;

  @ApiProperty({ description: 'Message priority' })
  priority: string;

  @ApiProperty({ description: 'Is notification read' })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Read timestamp' })
  readAt?: Date;

  @ApiPropertyOptional({ description: 'Action URL' })
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
