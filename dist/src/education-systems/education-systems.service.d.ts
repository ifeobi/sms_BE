import { EducationSystem } from './interfaces/education-system.interface';
export declare class EducationSystemsService {
    private readonly educationSystems;
    constructor();
    getAllEducationSystems(): EducationSystem[];
    getEducationSystemById(id: string): EducationSystem | null;
    getEducationSystemsByCountry(countryCode: string): EducationSystem[];
    getAvailableCountries(): Array<{
        code: string;
        name: string;
        flag: string;
        phoneCode: string;
    }>;
    getSchoolLevelDisplayNames(countryCode: string): Array<{
        value: string;
        label: string;
    }>;
    private getCountryName;
}
