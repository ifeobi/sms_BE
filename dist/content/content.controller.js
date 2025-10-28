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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const content_service_1 = require("./content.service");
const create_content_dto_1 = require("./dto/create-content.dto");
const update_content_dto_1 = require("./dto/update-content.dto");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ContentController = class ContentController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    async create(createContentDto, req) {
        console.log('Content Controller - User from JWT:', req.user);
        let creatorId = req.user.creatorId;
        if (!creatorId) {
            console.log('Content Controller - No creatorId in JWT, looking up from userId:', req.user.id);
            const creator = await this.contentService.findCreatorByUserId(req.user.id);
            if (creator) {
                creatorId = creator.id;
                console.log('Content Controller - Found creatorId:', creatorId);
            }
            else {
                throw new Error('Creator account not found for this user');
            }
        }
        console.log('Content Controller - CreatorId being used:', creatorId);
        return this.contentService.create(createContentDto, creatorId);
    }
    findAll(skip, take, status, contentCategoryId, subjectCategoryId) {
        const where = {};
        if (status) {
            const upperStatus = status.toUpperCase();
            if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(upperStatus)) {
                where.status = upperStatus;
            }
        }
        if (contentCategoryId)
            where.contentCategoryId = contentCategoryId;
        if (subjectCategoryId)
            where.subjectCategoryId = subjectCategoryId;
        return this.contentService.findAll({
            skip,
            take,
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findMyContent(req, skip, take, status) {
        let creatorId = req.user.creatorId;
        if (!creatorId) {
            const creator = await this.contentService.findCreatorByUserId(req.user.id);
            if (creator) {
                creatorId = creator.id;
            }
            else {
                throw new Error('Creator account not found for this user');
            }
        }
        let contentStatus;
        if (status) {
            const upperStatus = status.toUpperCase();
            if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(upperStatus)) {
                contentStatus = upperStatus;
            }
        }
        return this.contentService.findByCreator(creatorId, {
            skip,
            take,
            status: contentStatus,
        });
    }
    getContentCategories() {
        return this.contentService.getContentCategories();
    }
    getSubjectCategories() {
        return this.contentService.getSubjectCategories();
    }
    findOne(id) {
        return this.contentService.findOne(id);
    }
    async update(id, updateContentDto, req) {
        console.log('Update Controller - Content ID:', id);
        console.log('Update Controller - Update data:', updateContentDto);
        console.log('Update Controller - User from JWT:', req.user);
        console.log('=== CONTROLLER FIELD DEBUG ===');
        console.log('Textbook Author in DTO:', updateContentDto.textbookAuthor);
        console.log('Textbook Publisher in DTO:', updateContentDto.textbookPublisher);
        console.log('Textbook Year in DTO:', updateContentDto.textbookYear);
        console.log('==============================');
        let creatorId = req.user.creatorId;
        if (!creatorId) {
            const creator = await this.contentService.findCreatorByUserId(req.user.id);
            if (creator) {
                creatorId = creator.id;
            }
            else {
                throw new Error('Creator account not found for this user');
            }
        }
        console.log('Update Controller - Creator ID:', creatorId);
        const result = await this.contentService.update(id, updateContentDto, creatorId);
        console.log('Update Controller - Update result:', result);
        return result;
    }
    async remove(id, req) {
        console.log('Delete Controller - User from JWT:', req.user);
        console.log('Delete Controller - Content ID:', id);
        let creatorId = req.user.creatorId;
        if (!creatorId) {
            console.log('Delete Controller - No creatorId in JWT, looking up from userId:', req.user.id);
            const creator = await this.contentService.findCreatorByUserId(req.user.id);
            if (creator) {
                creatorId = creator.id;
                console.log('Delete Controller - Found creatorId:', creatorId);
            }
            else {
                throw new Error('Creator account not found for this user');
            }
        }
        console.log('Delete Controller - CreatorId being used:', creatorId);
        return this.contentService.remove(id, creatorId);
    }
    uploadFile(uploadFileDto) {
        return this.contentService.uploadFile(uploadFileDto);
    }
    getContentFiles(contentId) {
        return this.contentService.getContentFiles(contentId);
    }
    deleteFile(fileId, req) {
        const creatorId = req.user.creatorId || req.user.id;
        return this.contentService.deleteFile(fileId, creatorId);
    }
    incrementViewCount(contentId) {
        return this.contentService.incrementViewCount(contentId);
    }
    incrementDownloadCount(contentId) {
        return this.contentService.incrementDownloadCount(contentId);
    }
    incrementSalesCount(contentId) {
        return this.contentService.incrementSalesCount(contentId);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_content_dto_1.CreateContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('skip', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('take', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('contentCategoryId')),
    __param(4, (0, common_1.Query)('subjectCategoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-content'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('skip', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('take', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "findMyContent", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getContentCategories", null);
__decorate([
    (0, common_1.Get)('subject-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getSubjectCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_content_dto_1.UpdateContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('files'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_file_dto_1.UploadFileDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id/files'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getContentFiles", null);
__decorate([
    (0, common_1.Delete)('files/:fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)(':id/view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "incrementViewCount", null);
__decorate([
    (0, common_1.Post)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "incrementDownloadCount", null);
__decorate([
    (0, common_1.Post)(':id/sale'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "incrementSalesCount", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)('content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map