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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const communications_service_1 = require("./communications.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_announcement_dto_1 = require("./dto/create-announcement.dto");
const communication_response_dto_1 = require("./dto/communication-response.dto");
let CommunicationsController = class CommunicationsController {
    communicationsService;
    constructor(communicationsService) {
        this.communicationsService = communicationsService;
    }
    async sendMessage(req, createMessageDto) {
        try {
            const userId = req.user.id;
            return await this.communicationsService.createMessage(userId, createMessageDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to send message', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserMessages(req, page = 1, limit = 20) {
        try {
            const userId = req.user.id;
            return await this.communicationsService.getUserMessages(userId, page, limit);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get messages', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInboxMessages(req, page = 1, limit = 20) {
        try {
            const userId = req.user.id;
            return await this.communicationsService.getInboxMessages(userId, page, limit);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get inbox messages', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSentMessages(req, page = 1, limit = 20) {
        try {
            const userId = req.user.id;
            return await this.communicationsService.getSentMessages(userId, page, limit);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get sent messages', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async markMessageAsRead(req, messageId) {
        try {
            const userId = req.user.id;
            return await this.communicationsService.markMessageAsRead(userId, messageId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to mark message as read', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteMessage(req, messageId) {
        try {
            const userId = req.user.id;
            await this.communicationsService.deleteMessage(userId, messageId);
            return { message: 'Message deleted successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete message', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRecipients(req) {
        try {
            const userId = req.user.id;
            const userType = req.user.type;
            if (userType.toLowerCase() === 'parent') {
                return await this.communicationsService.getParentRecipients(userId);
            }
            else if (userType.toLowerCase() === 'teacher') {
                return await this.communicationsService.getTeacherRecipients(userId);
            }
            else if (userType.toLowerCase() === 'school_admin') {
                return await this.communicationsService.getSchoolAdminRecipients(userId);
            }
            else {
                throw new common_1.HttpException('Access denied. Invalid user type for messaging.', common_1.HttpStatus.FORBIDDEN);
            }
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get recipients', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createAnnouncement(req, createAnnouncementDto) {
        try {
            const userType = req.user.type;
            if (userType.toLowerCase() !== 'school_admin') {
                throw new common_1.HttpException('Access denied. Only school admins can create announcements.', common_1.HttpStatus.FORBIDDEN);
            }
            const schoolAdmin = await this.communicationsService['prisma'].schoolAdmin.findUnique({
                where: { userId: req.user.id },
            });
            if (!schoolAdmin) {
                throw new common_1.HttpException('School admin relationship not found', common_1.HttpStatus.NOT_FOUND);
            }
            return await this.communicationsService.createAnnouncement(schoolAdmin.schoolId, createAnnouncementDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create announcement', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAnnouncements(req, page = 1, limit = 20) {
        try {
            const userType = req.user.type;
            const userId = req.user.id;
            if (userType.toLowerCase() === 'parent') {
                return await this.communicationsService.getParentAnnouncements(userId, page, limit);
            }
            else if (userType.toLowerCase() === 'school_admin') {
                const schoolAdmin = await this.communicationsService['prisma'].schoolAdmin.findUnique({
                    where: { userId: req.user.id },
                });
                if (!schoolAdmin) {
                    throw new common_1.HttpException('School admin relationship not found', common_1.HttpStatus.NOT_FOUND);
                }
                return await this.communicationsService.getSchoolAnnouncements(schoolAdmin.schoolId, page, limit);
            }
            else {
                throw new common_1.HttpException('Access denied. Only parents and school admins can view announcements.', common_1.HttpStatus.FORBIDDEN);
            }
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get announcements', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSchoolAnnouncements(schoolId, page = 1, limit = 20) {
        try {
            return await this.communicationsService.getSchoolAnnouncements(schoolId, page, limit);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get school announcements', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a new message' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Message sent successfully',
        type: communication_response_dto_1.MessageResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user messages (sent and received)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Messages retrieved successfully',
        type: [communication_response_dto_1.MessageResponseDto],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getUserMessages", null);
__decorate([
    (0, common_1.Get)('messages/inbox'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inbox messages (received only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Inbox messages retrieved successfully',
        type: [communication_response_dto_1.MessageResponseDto],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getInboxMessages", null);
__decorate([
    (0, common_1.Get)('messages/sent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sent messages' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sent messages retrieved successfully',
        type: [communication_response_dto_1.MessageResponseDto],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getSentMessages", null);
__decorate([
    (0, common_1.Put)('messages/:id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark message as read' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message marked as read successfully',
        type: communication_response_dto_1.MessageResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "markMessageAsRead", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a message' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message deleted successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('recipients'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available message recipients for user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recipients retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getRecipients", null);
__decorate([
    (0, common_1.Post)('announcements'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new announcement (School Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Announcement created successfully',
        type: communication_response_dto_1.AnnouncementResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_announcement_dto_1.CreateAnnouncementDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Get)('announcements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get announcements for user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Announcements retrieved successfully',
        type: [communication_response_dto_1.AnnouncementResponseDto],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Get)('announcements/school/:schoolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get announcements for a specific school' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'School announcements retrieved successfully',
        type: [communication_response_dto_1.AnnouncementResponseDto],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    __param(0, (0, common_1.Param)('schoolId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getSchoolAnnouncements", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, swagger_1.ApiTags)('Communications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('communications'),
    __metadata("design:paramtypes", [communications_service_1.CommunicationsService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map