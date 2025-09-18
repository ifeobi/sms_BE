import { PrismaService } from '../prisma/prisma.service';
export declare class SectionManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    getSectionTemplates(): Promise<any>;
    getCustomSectionPatterns(schoolId: string): Promise<any>;
    createCustomSectionPattern(schoolId: string, name: string, pattern: string[], templateId?: string): Promise<any>;
    getSectionsForLevel(levelId: string): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    }[]>;
    createSectionsFromTemplate(levelId: string, schoolId: string, templateId: string, baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromCustomPattern(levelId: string, schoolId: string, customPatternId: string, baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromPattern(levelId: string, schoolId: string, pattern: string[], baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addSection(levelId: string, schoolId: string, sectionName: string, baseClassName: string, capacity?: number): Promise<{
        id: string;
        schoolId: string;
        isActive: boolean;
        name: string;
        order: number;
        levelId: string;
    }>;
    updateSection(sectionId: string, updates: {
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
    reorderSections(levelId: string, sectionIds: string[]): Promise<{
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
