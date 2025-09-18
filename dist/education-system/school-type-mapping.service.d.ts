import { PrismaService } from '../prisma/prisma.service';
export interface SchoolTypeMapping {
    templateId: string;
    selectedLevels: string[];
    countryCode: string;
}
export declare class SchoolTypeMappingService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    mapStaticSchoolTypesToTemplate(countryCode: string, staticSchoolTypes: string[]): Promise<SchoolTypeMapping | null>;
    private mapStaticTypesToLevels;
    private getStaticToLevelMappings;
    getAvailableStaticSchoolTypes(countryCode: string): string[];
    validateStaticSchoolTypes(countryCode: string, staticSchoolTypes: string[]): boolean;
}
