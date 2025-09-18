import { EducationSystemsService } from './education-systems.service';
import { EducationSystem } from './interfaces/education-system.interface';
export declare class EducationSystemsController {
    private readonly educationSystemsService;
    constructor(educationSystemsService: EducationSystemsService);
    getAllEducationSystems(): EducationSystem[];
    getAvailableCountries(): {
        code: string;
        name: string;
        flag: string;
        phoneCode: string;
    }[];
    getSchoolLevelDisplayNames(countryCode: string): {
        value: string;
        label: string;
    }[];
    getEducationSystemById(id: string): EducationSystem | null;
}
