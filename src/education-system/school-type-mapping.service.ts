import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SchoolTypeMapping {
  templateId: string;
  selectedLevels: string[];
  countryCode: string;
}

@Injectable()
export class SchoolTypeMappingService {
  private readonly logger = new Logger(SchoolTypeMappingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Maps static school types to template-based configuration
   * This allows the frontend to use static data while the backend uses templates
   */
  async mapStaticSchoolTypesToTemplate(
    countryCode: string,
    staticSchoolTypes: string[]
  ): Promise<SchoolTypeMapping | null> {
    this.logger.log(`🔍 Mapping static school types for country: ${countryCode}`);
    this.logger.log(`Static school types: ${staticSchoolTypes.join(', ')}`);

    try {
      // Get the education system template for the country
      const template = await this.prisma.educationSystemTemplate.findFirst({
        where: {
          countryCode: countryCode.toUpperCase(),
          isActive: true,
        },
      });

      if (!template) {
        this.logger.warn(`❌ No template found for country: ${countryCode}`);
        return null;
      }

      this.logger.log(`✅ Found template: ${template.systemName} (ID: ${template.id})`);

      // Map static school types to template level IDs
      const mappedLevels = this.mapStaticTypesToLevels(countryCode, staticSchoolTypes);
      
      if (mappedLevels.length === 0) {
        this.logger.warn(`❌ No valid level mappings found for school types: ${staticSchoolTypes.join(', ')}`);
        return null;
      }

      const result: SchoolTypeMapping = {
        templateId: template.id,
        selectedLevels: mappedLevels,
        countryCode: template.countryCode,
      };

      this.logger.log(`✅ Mapping result:`, result);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error mapping school types:`, error);
      throw error;
    }
  }

  /**
   * Maps static school type IDs to template level IDs
   * This is where the magic happens - static frontend selections become template-based backend data
   */
  private mapStaticTypesToLevels(countryCode: string, staticSchoolTypes: string[]): string[] {
    const mappings = this.getStaticToLevelMappings(countryCode);
    const mappedLevels: string[] = [];

    for (const staticType of staticSchoolTypes) {
      const mapping = mappings[staticType];
      if (mapping) {
        mappedLevels.push(...mapping);
      } else {
        this.logger.warn(`⚠️ No mapping found for static school type: ${staticType}`);
      }
    }

    // Remove duplicates
    return [...new Set(mappedLevels)];
  }

  /**
   * Get static school type to template level mappings for each country
   * This defines how frontend static selections map to backend template levels
   */
  private getStaticToLevelMappings(countryCode: string): Record<string, string[]> {
    const mappings: Record<string, Record<string, string[]>> = {
      NG: {
        // Nigerian mappings
        'nursery': ['nursery'],
        'primary': ['primary'],
        'jss': ['jss'],
        'sss': ['sss'],
        'preschool': ['preschool'],
      },
      GH: {
        // Ghanaian mappings
        'kindergarten': ['kindergarten'],
        'primary': ['primary'],
        'jhs': ['jhs'],
        'shs': ['shs'],
      },
      KE: {
        // Kenyan mappings
        'primary': ['primary'],
        'secondary': ['secondary'],
      },
      UG: {
        // Ugandan mappings
        'primary': ['primary'],
        'olevel': ['olevel'],
        'alevel': ['alevel'],
      },
      TZ: {
        // Tanzanian mappings
        'primary': ['primary'],
        'olevel': ['olevel'],
        'alevel': ['alevel'],
      },
      ZA: {
        // South African mappings
        'foundation': ['foundation'],
        'intermediate': ['intermediate'],
        'senior': ['senior'],
        'further': ['further'],
      },
      ZW: {
        // Zimbabwean mappings
        'primary': ['primary'],
        'olevel': ['olevel'],
        'alevel': ['alevel'],
      },
      SN: {
        // Senegalese mappings
        'primary': ['primary'],
        'college': ['college'],
        'lycee': ['lycee'],
      },
      CI: {
        // Ivorian mappings
        'primary': ['primary'],
        'college': ['college'],
        'lycee': ['lycee'],
      },
      EG: {
        // Egyptian mappings
        'primary': ['primary'],
        'preparatory': ['preparatory'],
        'secondary': ['secondary'],
      },
      MA: {
        // Moroccan mappings
        'primary': ['primary'],
        'college': ['college'],
        'lycee': ['lycee'],
      },
      US: {
        // American mappings
        'elementary': ['elementary'],
        'middle': ['middle'],
        'high': ['high'],
      },
      GB: {
        // British mappings
        'primary': ['primary'],
        'secondary': ['secondary'],
        'sixth_form': ['sixth_form'],
      },
      CA: {
        // Canadian mappings
        'elementary': ['elementary'],
        'secondary': ['secondary'],
      },
    };

    return mappings[countryCode] || {};
  }

  /**
   * Get available static school types for a country
   * This is used by the frontend to know which static options to show
   */
  getAvailableStaticSchoolTypes(countryCode: string): string[] {
    const mappings = this.getStaticToLevelMappings(countryCode);
    return Object.keys(mappings);
  }

  /**
   * Validate that static school types are valid for a country
   */
  validateStaticSchoolTypes(countryCode: string, staticSchoolTypes: string[]): boolean {
    const availableTypes = this.getAvailableStaticSchoolTypes(countryCode);
    return staticSchoolTypes.every(type => availableTypes.includes(type));
  }
}
