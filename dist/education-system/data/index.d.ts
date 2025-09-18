import { EducationSystem, ClassLevel, SystemSuggestion, SubjectDefinition, GradingScale, AcademicTerm } from '../interfaces/education-system.interface';
export declare const educationSystems: EducationSystem[];
export declare const systemsByCountry: Record<string, EducationSystem[]>;
export declare function getEducationSystem(countryCode: string): EducationSystem | undefined;
export declare function getAvailableCountries(): {
    code: string;
    name: string;
    flag: string;
    phoneCode: string;
}[];
export declare function getSchoolLevelDisplayNames(countryCode: string): {
    value: string;
    label: string;
}[];
export declare function getEducationSystemById(id: string): EducationSystem | undefined;
export declare function getSystemsByCountryCode(countryCode: string): EducationSystem[];
export declare function suggestEducationSystems(countryCode: string, schoolType: "primary" | "secondary" | "tertiary"): SystemSuggestion[];
export declare function getSubjectsForLevel(systemId: string, levelId: string): SubjectDefinition[];
export declare function getClassLevelsForLevel(systemId: string, levelId: string): ClassLevel[];
export declare function getSubjectsForClassLevel(systemId: string, classLevelId: string): string[];
export declare function isValidClassLevel(systemId: string, classLevelId: string): boolean;
export declare function getGradingScale(systemId: string, levelId?: string): GradingScale;
export declare function getAcademicTerms(systemId: string, levelId?: string): AcademicTerm[];
