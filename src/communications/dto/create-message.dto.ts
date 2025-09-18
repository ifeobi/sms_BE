import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  MESSAGE = 'MESSAGE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  NOTIFICATION = 'NOTIFICATION',
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateMessageDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsString()
  recipientId: string;

  @ApiProperty({ description: 'Message subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ 
    description: 'Message type', 
    enum: MessageType,
    default: MessageType.MESSAGE 
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.MESSAGE;

  @ApiPropertyOptional({ 
    description: 'Message priority', 
    enum: MessagePriority,
    default: MessagePriority.NORMAL 
  })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority = MessagePriority.NORMAL;

  @ApiPropertyOptional({ description: 'Parent message ID for replies' })
  @IsOptional()
  @IsString()
  parentMessageId?: string;

  @ApiPropertyOptional({ description: 'File attachments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}
