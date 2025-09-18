import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto, UserSettingsResponseDto } from './dto/user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserSettings(userId: string): Promise<UserSettingsResponseDto> {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    return this.mapToResponseDto(settings);
  }

  async updateUserSettings(
    userId: string,
    updateDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upsert settings (create if doesn't exist, update if exists)
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: updateDto,
      create: {
        userId,
        ...updateDto,
        // Set defaults for any missing fields
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

  async createDefaultSettings(userId: string): Promise<UserSettingsResponseDto> {
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

  async deleteUserSettings(userId: string): Promise<void> {
    await this.prisma.userSettings.delete({
      where: { userId },
    });
  }

  private mapToResponseDto(settings: any): UserSettingsResponseDto {
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

  // Helper method to check if user wants email notifications
  async shouldSendEmailNotification(userId: string): Promise<boolean> {
    const settings = await this.getUserSettings(userId);
    return settings.emailNotifications;
  }

  // Helper method to get user's privacy settings
  async getUserPrivacySettings(userId: string): Promise<{
    showEmail: boolean;
    showPhone: boolean;
    profileVisibility: string;
  }> {
    const settings = await this.getUserSettings(userId);
    return {
      showEmail: settings.showEmail,
      showPhone: settings.showPhone,
      profileVisibility: settings.profileVisibility,
    };
  }
}
