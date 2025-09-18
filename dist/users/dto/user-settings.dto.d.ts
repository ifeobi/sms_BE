export declare class UpdateUserSettingsDto {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    profileVisibility?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
}
export declare class UserSettingsResponseDto {
    id: string;
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    showEmail: boolean;
    showPhone: boolean;
    profileVisibility: string;
    language: string;
    timezone: string;
    dateFormat: string;
    createdAt: Date;
    updatedAt: Date;
}
