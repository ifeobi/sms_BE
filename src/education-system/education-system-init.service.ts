import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { educationSystems } from './data';

@Injectable()
export class EducationSystemInitService {
  private readonly logger = new Logger(EducationSystemInitService.name);

  constructor(private prisma: PrismaService) {}

  async initializeEducationSystems(): Promise<void> {
    try {
      this.logger.log('🚀 Starting education systems initialization...');
      this.logger.log(`📊 Found ${educationSystems.length} education systems to initialize`);

      // Check if education systems are already initialized
      this.logger.log('🔍 Checking for existing education system templates...');
      const existingCount = await this.prisma.educationSystemTemplate.count();
      this.logger.log(`📈 Found ${existingCount} existing templates in database`);
      
      if (existingCount > 0) {
        this.logger.log(`✅ Education systems already initialized (${existingCount} templates found). Skipping...`);
        return;
      }

      this.logger.log(`Initializing ${educationSystems.length} education systems...`);

      // Create education system templates
      for (const system of educationSystems) {
        await this.prisma.educationSystemTemplate.create({
          data: {
            countryCode: system.countryCode,
            countryName: system.country,
            systemName: system.systemName,
            description: system.description,
            templateData: JSON.parse(JSON.stringify(system)),
            isActive: true,
          },
        });

        this.logger.log(`✅ Created template for ${system.country} (${system.countryCode})`);
      }

      this.logger.log('🎉 Education systems initialization completed successfully!');
    } catch (error) {
      this.logger.error('❌ Failed to initialize education systems:', error);
      throw error;
    }
  }

  async getEducationSystemByCountry(countryCode: string) {
    return await this.prisma.educationSystemTemplate.findFirst({
      where: {
        countryCode: countryCode.toUpperCase(),
        isActive: true,
      },
    });
  }

  async getAllEducationSystems() {
    return await this.prisma.educationSystemTemplate.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        countryName: 'asc',
      },
    });
  }

  async resetEducationSystems(): Promise<void> {
    this.logger.warn('Resetting all education systems...');
    
    await this.prisma.educationSystemTemplate.deleteMany({});
    
    this.logger.log('All education systems deleted. Reinitializing...');
    await this.initializeEducationSystems();
  }

  // School Academic Structure Methods
  async getSchoolAcademicStructure(schoolId: string) {
    this.logger.log(`🔍 Fetching academic structure for school: ${schoolId}`);
    
    const academicStructure = await this.prisma.schoolAcademicStructure.findFirst({
      where: {
        schoolId: schoolId,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
      },
    });

    if (!academicStructure) {
      this.logger.warn(`❌ No academic structure found for school: ${schoolId}`);
      return null;
    }

    // Get the template data to merge with school's customizations
    const template = await this.prisma.educationSystemTemplate.findFirst({
      where: {
        countryCode: academicStructure.countryCode,
        isActive: true,
      },
    });

    if (!template) {
      this.logger.warn(`❌ No template found for country: ${academicStructure.countryCode}`);
      return academicStructure;
    }

    // Merge template data with school's selected levels and customizations
    const templateData = template.templateData as any;
    const mergedStructure = {
      ...academicStructure,
      templateData: templateData,
      availableLevels: templateData?.levels || [],
      selectedLevels: academicStructure.selectedLevels,
      customizations: {
        subjects: academicStructure.commonSubjects,
        gradingScales: academicStructure.commonGradingScales,
        academicTerms: academicStructure.commonAcademicTerms,
      },
    };

    this.logger.log(`✅ Successfully fetched academic structure for school: ${schoolId}`);
    return mergedStructure;
  }

  async createSchoolAcademicStructure(schoolId: string, templateId: string, selectedLevels: string[]) {
    this.logger.log(`🏗️ Creating academic structure for school: ${schoolId} with template: ${templateId}`);
    
    // Get the template
    const template = await this.prisma.educationSystemTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Check if school already has an academic structure
    const existingStructure = await this.prisma.schoolAcademicStructure.findFirst({
      where: { schoolId },
    });

    if (existingStructure) {
      this.logger.warn(`⚠️ School ${schoolId} already has an academic structure. Updating instead.`);
      return this.updateSchoolAcademicStructure(schoolId, templateId, selectedLevels);
    }

    // Filter template levels to only include selected ones
    const templateData = template.templateData as any;
    const filteredLevels = (templateData?.levels || []).filter((level: any) => 
      selectedLevels.includes(level.id)
    );

    // Create the academic structure
    const academicStructure = await this.prisma.schoolAcademicStructure.create({
      data: {
        schoolId,
        countryCode: template.countryCode,
        countryName: template.countryName,
        systemName: template.systemName,
        selectedLevels: filteredLevels,
        commonSubjects: templateData?.subjects || [],
        commonGradingScales: templateData?.gradingScales || [],
        commonAcademicTerms: templateData?.academicTerms || [],
      },
    });

    this.logger.log(`✅ Successfully created academic structure for school: ${schoolId}`);
    return academicStructure;
  }

  async updateSchoolAcademicStructure(schoolId: string, templateId: string, selectedLevels: string[]) {
    this.logger.log(`🔄 Updating academic structure for school: ${schoolId} with template: ${templateId}`);
    
    // Get the template
    const template = await this.prisma.educationSystemTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Filter template levels to only include selected ones
    const templateData = template.templateData as any;
    const filteredLevels = (templateData?.levels || []).filter((level: any) => 
      selectedLevels.includes(level.id)
    );

    // Update the academic structure
    const academicStructure = await this.prisma.schoolAcademicStructure.updateMany({
      where: { schoolId },
      data: {
        countryCode: template.countryCode,
        countryName: template.countryName,
        systemName: template.systemName,
        selectedLevels: filteredLevels,
        commonSubjects: templateData?.subjects || [],
        commonGradingScales: templateData?.gradingScales || [],
        commonAcademicTerms: templateData?.academicTerms || [],
      },
    });

    this.logger.log(`✅ Successfully updated academic structure for school: ${schoolId}`);
    return academicStructure;
  }

  async getAvailableCountries() {
    this.logger.log('🌍 Fetching available countries from education systems');
    
    const templates = await this.prisma.educationSystemTemplate.findMany({
      where: { isActive: true },
      select: {
        countryCode: true,
        countryName: true,
        templateData: true,
      },
      orderBy: { countryName: 'asc' },
    });

    // Extract unique countries with their phone codes from template data
    const countries = templates.map(template => {
      const templateData = template.templateData as any;
      return {
        code: template.countryCode,
        name: template.countryName,
        phoneCode: templateData?.phoneCode || '+1', // fallback
        flag: templateData?.flag || '🏳️', // fallback
      };
    });

    // Remove duplicates (in case multiple templates exist for same country)
    const uniqueCountries = countries.filter((country, index, self) => 
      index === self.findIndex(c => c.code === country.code)
    );

    this.logger.log(`✅ Found ${uniqueCountries.length} unique countries`);
    return uniqueCountries;
  }
}
