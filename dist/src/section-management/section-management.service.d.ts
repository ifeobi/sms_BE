import { PrismaService } from '../prisma/prisma.service';
export declare class SectionManagementService {
    private prisma;
    constructor(prisma: PrismaService);
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
    createCustomSectionPattern(schoolId: string, name: string, pattern: string[], templateId?: string): Promise<{
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
    createSectionsFromTemplate(levelId: string, schoolId: string, templateId: string, baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromCustomPattern(levelId: string, schoolId: string, customPatternId: string, baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSectionsFromPattern(levelId: string, schoolId: string, pattern: string[], baseClassName: string, capacity?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addSection(levelId: string, schoolId: string, sectionName: string, baseClassName: string, capacity?: number): Promise<{
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
    updateSection(sectionId: string, updates: {
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
    reorderSections(levelId: string, sectionIds: string[]): Promise<{
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
