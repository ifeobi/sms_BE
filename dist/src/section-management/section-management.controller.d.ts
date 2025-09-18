import { SectionManagementService } from './section-management.service';
export declare class SectionManagementController {
    private readonly sectionManagementService;
    constructor(sectionManagementService: SectionManagementService);
    getSectionTemplates(): Promise<any>;
    getCustomSectionPatterns(schoolId: string): Promise<any>;
    createCustomSectionPattern(body: {
        schoolId: string;
        name: string;
        pattern: string[];
        templateId?: string;
    }): Promise<any>;
    getSectionsForLevel(levelId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
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
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    }>;
    updateSection(sectionId: string, body: {
        sectionName?: string;
        capacity?: number;
        baseClassName?: string;
    }): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    }>;
    removeSection(sectionId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    }>;
    reorderSections(levelId: string, body: {
        sectionIds: string[];
    }): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    }[]>;
    getSectionStatistics(levelId: string): Promise<{
        id: string;
        name: string;
        sectionName: any;
        capacity: any;
        enrolledStudents: any;
        availableSpots: number | null;
        utilizationRate: number | null;
    }[]>;
}
