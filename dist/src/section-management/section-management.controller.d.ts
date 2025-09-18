import { SectionManagementService } from './section-management.service';
export declare class SectionManagementController {
    private readonly sectionManagementService;
    constructor(sectionManagementService: SectionManagementService);
    getSectionTemplates(): Promise<{
        id: string;
        name: string;
        description: string;
        pattern: string[];
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCustomSectionPatterns(schoolId: string): Promise<({
        template: {
            id: string;
            name: string;
            description: string;
            pattern: string[];
            isDefault: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        name: string;
        pattern: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        templateId: string | null;
    })[]>;
    createCustomSectionPattern(body: {
        schoolId: string;
        name: string;
        pattern: string[];
        templateId?: string;
    }): Promise<{
        id: string;
        name: string;
        pattern: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        templateId: string | null;
    }>;
    getSectionsForLevel(levelId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
        order: number;
    }[]>;
    createSectionsFromTemplate(body: {
        levelId: string;
        schoolId: string;
        templateId: string;
        baseClassName: string;
        capacity?: number;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromCustomPattern(body: {
        levelId: string;
        schoolId: string;
        customPatternId: string;
        baseClassName: string;
        capacity?: number;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromPattern(body: {
        levelId: string;
        schoolId: string;
        pattern: string[];
        baseClassName: string;
        capacity?: number;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addSection(body: {
        levelId: string;
        schoolId: string;
        sectionName: string;
        baseClassName: string;
        capacity?: number;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
        order: number;
    }>;
    updateSection(sectionId: string, body: {
        sectionName?: string;
        capacity?: number;
        baseClassName?: string;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
        order: number;
    }>;
    removeSection(sectionId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
        order: number;
    }>;
    reorderSections(levelId: string, body: {
        sectionIds: string[];
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        levelId: string;
        sectionName: string | null;
        sectionOrder: number | null;
        capacity: number | null;
        templateUsed: string | null;
        order: number;
    }[]>;
    getSectionStatistics(levelId: string): Promise<{
        id: string;
        name: string;
        sectionName: string | null;
        capacity: number | null;
        enrolledStudents: number;
        availableSpots: number | null;
        utilizationRate: number | null;
    }[]>;
}
