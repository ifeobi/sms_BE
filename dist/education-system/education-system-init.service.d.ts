import { PrismaService } from '../prisma/prisma.service';
export declare class EducationSystemInitService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    initializeEducationSystems(): Promise<void>;
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
    resetEducationSystems(): Promise<void>;
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
    createSchoolAcademicStructure(schoolId: string, templateId: string, selectedLevels: string[]): Promise<{
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
    updateSchoolAcademicStructure(schoolId: string, templateId: string, selectedLevels: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getAvailableCountries(): Promise<{
        code: string;
        name: string;
        phoneCode: any;
        flag: any;
    }[]>;
}
