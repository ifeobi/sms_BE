import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    console.log('=== GET USER SETTINGS DEBUG ===');
    console.log('Getting settings for user:', userId);
    console.log('================================');

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, lastName: true }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get or create settings
      let settings = await this.prisma.userSettings.findUnique({
        where: { userId }
      });

      if (!settings) {
        console.log('No settings found, creating default settings');
        settings = await this.createDefaultSettings(userId);
      }

      console.log('✅ Settings retrieved successfully');
      console.log('================================');
      return settings;
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      console.log('================================');
      throw error;
    }
  }

  async updateUserSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    console.log('=== UPDATE USER SETTINGS DEBUG ===');
    console.log('Updating settings for user:', userId);
    console.log('Settings data:', JSON.stringify(updateSettingsDto, null, 2));
    console.log('================================');

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get existing settings or create new ones
      let settings = await this.prisma.userSettings.findUnique({
        where: { userId }
      });

      if (!settings) {
        console.log('No existing settings, creating new ones');
        settings = await this.createDefaultSettings(userId);
      }

      // Update settings with new data
      const updatedSettings = await this.prisma.userSettings.update({
        where: { userId },
        data: {
          profileData: updateSettingsDto.profile !== undefined ? (updateSettingsDto.profile as any) : settings.profileData,
          notifications: updateSettingsDto.notifications !== undefined ? (updateSettingsDto.notifications as any) : settings.notifications,
          privacy: updateSettingsDto.privacy !== undefined ? (updateSettingsDto.privacy as any) : settings.privacy,
          security: updateSettingsDto.security !== undefined ? (updateSettingsDto.security as any) : settings.security,
          appearance: updateSettingsDto.appearance !== undefined ? (updateSettingsDto.appearance as any) : settings.appearance,
          accessibility: updateSettingsDto.accessibility !== undefined ? (updateSettingsDto.accessibility as any) : settings.accessibility,
          communication: updateSettingsDto.communication !== undefined ? (updateSettingsDto.communication as any) : settings.communication,
        }
      });

      console.log('✅ Settings updated successfully');
      console.log('================================');
      return updatedSettings;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      console.log('================================');
      throw error;
    }
  }

  async exportUserSettings(userId: string) {
    console.log('=== EXPORT USER SETTINGS DEBUG ===');
    console.log('Exporting settings for user:', userId);
    console.log('================================');

    try {
      const settings = await this.getUserSettings(userId);
      
      const exportData = {
        userId,
        exportedAt: new Date().toISOString(),
        settings: {
          profile: settings.profileData,
          notifications: settings.notifications,
          privacy: settings.privacy,
          security: settings.security,
          appearance: settings.appearance,
          accessibility: settings.accessibility,
          communication: settings.communication,
        }
      };

      console.log('✅ Settings exported successfully');
      console.log('================================');
      return exportData;
    } catch (error) {
      console.error('❌ Error exporting settings:', error);
      console.log('================================');
      throw error;
    }
  }

  async importUserSettings(userId: string, settingsData: any) {
    console.log('=== IMPORT USER SETTINGS DEBUG ===');
    console.log('Importing settings for user:', userId);
    console.log('Settings data:', JSON.stringify(settingsData, null, 2));
    console.log('================================');

    try {
      // Validate the imported data structure
      if (!settingsData.settings) {
        throw new Error('Invalid settings data format');
      }

      const { settings } = settingsData;

      // Update settings with imported data
      const updateData: UpdateSettingsDto = {
        profile: settings.profile,
        notifications: settings.notifications,
        privacy: settings.privacy,
        security: settings.security,
        appearance: settings.appearance,
        accessibility: settings.accessibility,
        communication: settings.communication,
      };

      const updatedSettings = await this.updateUserSettings(userId, updateData);

      console.log('✅ Settings imported successfully');
      console.log('================================');
      return updatedSettings;
    } catch (error) {
      console.error('❌ Error importing settings:', error);
      console.log('================================');
      throw error;
    }
  }

  async resetUserSettings(userId: string) {
    console.log('=== RESET USER SETTINGS DEBUG ===');
    console.log('Resetting settings for user:', userId);
    console.log('================================');

    try {
      // Delete existing settings
      await this.prisma.userSettings.deleteMany({
        where: { userId }
      });

      // Create default settings
      const defaultSettings = await this.createDefaultSettings(userId);

      console.log('✅ Settings reset successfully');
      console.log('================================');
      return defaultSettings;
    } catch (error) {
      console.error('❌ Error resetting settings:', error);
      console.log('================================');
      throw error;
    }
  }

  private async createDefaultSettings(userId: string) {
    const defaultSettings = {
      profileData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: '',
        profilePicture: null
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        gradeUpdates: true,
        attendanceAlerts: true,
        paymentReminders: true,
        eventNotifications: true,
        weeklyReports: true,
        emergencyAlerts: true,
        schoolUpdates: true,
        teacherMessages: true,
        systemMaintenance: false
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false,
        allowMessages: true,
        dataSharing: false,
        analytics: false,
        locationTracking: false,
        biometricAuth: false,
        autoLogout: true,
        rememberDevice: false
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: true,
        sessionTimeout: 30,
        passwordExpiry: 90,
        deviceManagement: true,
        suspiciousActivity: true,
        passwordStrength: 'medium',
        loginAttempts: 5,
        accountLockout: 30
      },
      appearance: {
        theme: 'light',
        language: 'en',
        fontSize: 'medium',
        colorScheme: 'default',
        darkMode: false,
        highContrast: false,
        animations: true,
        soundEffects: true
      },
      accessibility: {
        screenReader: false,
        keyboardNavigation: true,
        voiceCommands: false,
        largeText: false,
        colorBlindSupport: false,
        motionReduction: false,
        focusIndicators: true,
        altText: true
      },
      communication: {
        preferredLanguage: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        emailFrequency: 'daily',
        smsLanguage: 'en',
        voiceLanguage: 'en',
        autoTranslate: false
      }
    };

    return this.prisma.userSettings.create({
      data: {
        userId,
        ...defaultSettings
      }
    });
  }
}
