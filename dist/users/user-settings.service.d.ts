import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto, UserSettingsResponseDto } from './dto/user-settings.dto';
export declare class UserSettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserSettings(userId: string): Promise<UserSettingsResponseDto>;
    updateUserSettings(userId: string, updateDto: UpdateUserSettingsDto): Promise<UserSettingsResponseDto>;
    createDefaultSettings(userId: string): Promise<UserSettingsResponseDto>;
    deleteUserSettings(userId: string): Promise<void>;
    private mapToResponseDto;
    shouldSendEmailNotification(userId: string): Promise<boolean>;
    getUserPrivacySettings(userId: string): Promise<{
        showEmail: boolean;
        showPhone: boolean;
        profileVisibility: string;
    }>;
}
