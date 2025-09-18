"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResponseDto = exports.AnnouncementResponseDto = exports.MessageResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MessageResponseDto {
    id;
    senderId;
    recipientId;
    subject;
    content;
    type;
    priority;
    isRead;
    readAt;
    parentMessageId;
    attachments;
    metadata;
    createdAt;
    updatedAt;
    sender;
    recipient;
}
exports.MessageResponseDto = MessageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender user ID' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient user ID' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message subject' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message type' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message priority' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is message read' }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Read timestamp' }),
    __metadata("design:type", Date)
], MessageResponseDto.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent message ID for replies' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "parentMessageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File attachments' }),
    __metadata("design:type", Array)
], MessageResponseDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], MessageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], MessageResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender details' }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient details' }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "recipient", void 0);
class AnnouncementResponseDto {
    id;
    schoolId;
    title;
    content;
    type;
    priority;
    targetAudience;
    targetClassIds;
    targetStudentIds;
    isPublished;
    scheduledAt;
    publishedAt;
    expiresAt;
    attachments;
    metadata;
    createdAt;
    updatedAt;
    school;
}
exports.AnnouncementResponseDto = AnnouncementResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement ID' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement title' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement content' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement type' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message priority' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target audience' }),
    __metadata("design:type", String)
], AnnouncementResponseDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target class IDs' }),
    __metadata("design:type", Array)
], AnnouncementResponseDto.prototype, "targetClassIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target student IDs' }),
    __metadata("design:type", Array)
], AnnouncementResponseDto.prototype, "targetStudentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is published' }),
    __metadata("design:type", Boolean)
], AnnouncementResponseDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled timestamp' }),
    __metadata("design:type", Date)
], AnnouncementResponseDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Published timestamp' }),
    __metadata("design:type", Date)
], AnnouncementResponseDto.prototype, "publishedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expiration timestamp' }),
    __metadata("design:type", Date)
], AnnouncementResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File attachments' }),
    __metadata("design:type", Array)
], AnnouncementResponseDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    __metadata("design:type", Object)
], AnnouncementResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], AnnouncementResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], AnnouncementResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School details' }),
    __metadata("design:type", Object)
], AnnouncementResponseDto.prototype, "school", void 0);
class NotificationResponseDto {
    id;
    userId;
    title;
    content;
    type;
    priority;
    isRead;
    readAt;
    actionUrl;
    metadata;
    createdAt;
    updatedAt;
}
exports.NotificationResponseDto = NotificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification ID' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification content' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification type' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message priority' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is notification read' }),
    __metadata("design:type", Boolean)
], NotificationResponseDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Read timestamp' }),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Action URL' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "actionUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    __metadata("design:type", Object)
], NotificationResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=communication-response.dto.js.map