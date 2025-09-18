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
exports.CreateMessageDto = exports.MessagePriority = exports.MessageType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var MessageType;
(function (MessageType) {
    MessageType["MESSAGE"] = "MESSAGE";
    MessageType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
    MessageType["NOTIFICATION"] = "NOTIFICATION";
})(MessageType || (exports.MessageType = MessageType = {}));
var MessagePriority;
(function (MessagePriority) {
    MessagePriority["LOW"] = "LOW";
    MessagePriority["NORMAL"] = "NORMAL";
    MessagePriority["HIGH"] = "HIGH";
    MessagePriority["URGENT"] = "URGENT";
})(MessagePriority || (exports.MessagePriority = MessagePriority = {}));
class CreateMessageDto {
    recipientId;
    subject;
    content;
    type = MessageType.MESSAGE;
    priority = MessagePriority.NORMAL;
    parentMessageId;
    attachments;
    metadata;
}
exports.CreateMessageDto = CreateMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient user ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message subject' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Message type',
        enum: MessageType,
        default: MessageType.MESSAGE
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MessageType),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Message priority',
        enum: MessagePriority,
        default: MessagePriority.NORMAL
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MessagePriority),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent message ID for replies' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "parentMessageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File attachments' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMessageDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMessageDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-message.dto.js.map