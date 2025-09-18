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
exports.UserSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserSettingsService = class UserSettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserSettings(userId) {
        let settings = await this.prisma.userSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            settings = await this.createDefaultSettings(userId);
        }
        return this.mapToResponseDto(settings);
    }
    async updateUserSettings(userId, updateDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const settings = await this.prisma.userSettings.upsert({
            where: { userId },
            update: updateDto,
            create: {
                userId,
                ...updateDto,
                emailNotifications: updateDto.emailNotifications ?? true,
                pushNotifications: updateDto.pushNotifications ?? false,
                smsNotifications: updateDto.smsNotifications ?? false,
                showEmail: updateDto.showEmail ?? false,
                showPhone: updateDto.showPhone ?? false,
                profileVisibility: updateDto.profileVisibility ?? 'public',
                language: updateDto.language ?? 'en',
                timezone: updateDto.timezone ?? 'UTC',
                dateFormat: updateDto.dateFormat ?? 'MM/DD/YYYY',
            },
        });
        return this.mapToResponseDto(settings);
    }
    async createDefaultSettings(userId) {
        const settings = await this.prisma.userSettings.create({
            data: {
                userId,
                emailNotifications: true,
                pushNotifications: false,
                smsNotifications: false,
                showEmail: false,
                showPhone: false,
                profileVisibility: 'public',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
            },
        });
        return this.mapToResponseDto(settings);
    }
    async deleteUserSettings(userId) {
        await this.prisma.userSettings.delete({
            where: { userId },
        });
    }
    mapToResponseDto(settings) {
        return {
            id: settings.id,
            userId: settings.userId,
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
            smsNotifications: settings.smsNotifications,
            showEmail: settings.showEmail,
            showPhone: settings.showPhone,
            profileVisibility: settings.profileVisibility,
            language: settings.language,
            timezone: settings.timezone,
            dateFormat: settings.dateFormat,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt,
        };
    }
    async shouldSendEmailNotification(userId) {
        const settings = await this.getUserSettings(userId);
        return settings.emailNotifications;
    }
    async getUserPrivacySettings(userId) {
        const settings = await this.getUserSettings(userId);
        return {
            showEmail: settings.showEmail,
            showPhone: settings.showPhone,
            profileVisibility: settings.profileVisibility,
        };
    }
};
exports.UserSettingsService = UserSettingsService;
exports.UserSettingsService = UserSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserSettingsService);
//# sourceMappingURL=user-settings.service.js.map