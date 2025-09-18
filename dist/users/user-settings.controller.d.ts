import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto, UserSettingsResponseDto } from './dto/user-settings.dto';
export declare class UserSettingsController {
    private readonly userSettingsService;
    constructor(userSettingsService: UserSettingsService);
    getUserSettings(req: any): Promise<UserSettingsResponseDto>;
    updateUserSettings(req: any, updateDto: UpdateUserSettingsDto): Promise<UserSettingsResponseDto>;
    deleteUserSettings(req: any): Promise<{
        message: string;
    }>;
}
