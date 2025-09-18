import { EducationSystemInitService } from './education-system-init.service';
export declare class EducationSystemController {
    private readonly educationSystemInitService;
    constructor(educationSystemInitService: EducationSystemInitService);
    getAvailableCountries(): Promise<{
        code: string;
        name: string;
        phoneCode: any;
        flag: any;
    }[]>;
    getAllEducationSystems(): Promise<{
        description: string | null;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        countryCode: string;
        countryName: string;
        systemName: string;
        version: string;
        templateData: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getEducationSystemByCountry(countryCode: string): Promise<{
        description: string | null;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        countryCode: string;
        countryName: string;
        systemName: string;
        version: string;
        templateData: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    initializeEducationSystems(): Promise<{
        message: string;
    }>;
    resetEducationSystems(): Promise<{
        message: string;
    }>;
    getSchoolAcademicStructure(schoolId: string): Promise<({
        school: {
            id: string;
            name: string;
            country: string;
        };
    } & {
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        countryCode: string;
        countryName: string;
        systemName: string;
        schoolId: string;
        selectedLevels: import("@prisma/client/runtime/library").JsonValue;
        commonSubjects: import("@prisma/client/runtime/library").JsonValue | null;
        commonGradingScales: import("@prisma/client/runtime/library").JsonValue | null;
        commonAcademicTerms: import("@prisma/client/runtime/library").JsonValue | null;
        customClassLevels: import("@prisma/client/runtime/library").JsonValue | null;
        customSubjects: import("@prisma/client/runtime/library").JsonValue | null;
        customGradingScales: import("@prisma/client/runtime/library").JsonValue | null;
        customAcademicTerms: import("@prisma/client/runtime/library").JsonValue | null;
        customCurriculumStructure: import("@prisma/client/runtime/library").JsonValue | null;
        customAssessmentMethods: import("@prisma/client/runtime/library").JsonValue | null;
    }) | null>;
    createSchoolAcademicStructure(schoolId: string, body: {
        templateId: string;
        selectedLevels: string[];
    }): Promise<{
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        countryCode: string;
        countryName: string;
        systemName: string;
        schoolId: string;
        selectedLevels: import("@prisma/client/runtime/library").JsonValue;
        commonSubjects: import("@prisma/client/runtime/library").JsonValue | null;
        commonGradingScales: import("@prisma/client/runtime/library").JsonValue | null;
        commonAcademicTerms: import("@prisma/client/runtime/library").JsonValue | null;
        customClassLevels: import("@prisma/client/runtime/library").JsonValue | null;
        customSubjects: import("@prisma/client/runtime/library").JsonValue | null;
        customGradingScales: import("@prisma/client/runtime/library").JsonValue | null;
        customAcademicTerms: import("@prisma/client/runtime/library").JsonValue | null;
        customCurriculumStructure: import("@prisma/client/runtime/library").JsonValue | null;
        customAssessmentMethods: import("@prisma/client/runtime/library").JsonValue | null;
    } | import(".prisma/client").Prisma.BatchPayload>;
    updateSchoolAcademicStructure(schoolId: string, body: {
        templateId: string;
        selectedLevels: string[];
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
