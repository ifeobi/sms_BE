import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAcademicStructureDto } from './dto/update-academic-structure.dto';

@Injectable()
export class SchoolAcademicStructureService {
  constructor(private prisma: PrismaService) {}

  async getAcademicStructureByUserId(userId: string) {
    console.log('🔍 getAcademicStructureByUserId called for userId:', userId);
    console.log('🔍 getAcademicStructureByUserId stack trace:', new Error().stack);
    
    // First, get the school admin to find the school
    const schoolAdmin = await this.prisma.schoolAdmin.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        school: true,
      },
    });

    if (!schoolAdmin) {
      throw new NotFoundException('School admin not found');
    }

    console.log('✅ Found school admin:', { schoolId: schoolAdmin.school.id, schoolName: schoolAdmin.school.name });

    // Use raw SQL to get the academic structure to ensure we get the latest JSONB data
    console.log('🔍 Querying database for schoolId:', schoolAdmin.school.id);
    
    const academicStructureResult = await this.prisma.$queryRaw`
      SELECT * FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;

    console.log('🔍 Raw query result:', academicStructureResult);
    console.log('🔍 Raw query result length:', (academicStructureResult as any[]).length);

    if (!academicStructureResult || (academicStructureResult as any[]).length === 0) {
      throw new NotFoundException('Academic structure not found for this school');
    }

    const academicStructure = (academicStructureResult as any[])[0];
    console.log('🔍 Raw academic structure from database:', academicStructure);
    console.log('🔍 Raw customClassLevels from database:', JSON.stringify(academicStructure.customClassLevels, null, 2));
    console.log('🔍 Raw customClassLevels type:', typeof academicStructure.customClassLevels);
    console.log('🔍 Raw customClassLevels is array:', Array.isArray(academicStructure.customClassLevels));
    
    // Let's also check the specific preschool data
    if (academicStructure.customClassLevels) {
      const preschoolData = academicStructure.customClassLevels.find((level: any) => level.educationLevelId === 'preschool');
      console.log('🔍 Preschool data from database:', JSON.stringify(preschoolData, null, 2));
    }

    // Get the template data to merge with school's customizations (same as EducationSystemInitService)
    const template = await this.prisma.educationSystemTemplate.findFirst({
      where: {
        countryCode: academicStructure.countryCode,
        isActive: true,
      },
    });

    if (!template) {
      // If no template found, return the raw academic structure
      return academicStructure;
    }

    // Merge template data with school's selected levels and customizations
    const templateData = template.templateData as any;
    const mergedStructure = {
      ...academicStructure,
      templateData: templateData,
      availableLevels: templateData?.levels || [],
      selectedLevels: academicStructure.selectedLevels,
      // Return granular customizations at root level for easier access
      customClassLevels: academicStructure.customClassLevels,
      customSubjects: academicStructure.customSubjects,
      customGradingScales: academicStructure.customGradingScales,
      customAcademicTerms: academicStructure.customAcademicTerms,
      customCurriculumStructure: academicStructure.customCurriculumStructure,
      customAssessmentMethods: academicStructure.customAssessmentMethods,
      customizations: {
        subjects: academicStructure.commonSubjects,
        gradingScales: academicStructure.commonGradingScales,
        academicTerms: academicStructure.commonAcademicTerms,
        // New granular customizations
        customClassLevels: academicStructure.customClassLevels,
        customSubjects: academicStructure.customSubjects,
        customGradingScales: academicStructure.customGradingScales,
        customAcademicTerms: academicStructure.customAcademicTerms,
        customCurriculumStructure: academicStructure.customCurriculumStructure,
        customAssessmentMethods: academicStructure.customAssessmentMethods,
      },
    };

    console.log('🔍 Final merged structure customClassLevels:', mergedStructure.customizations.customClassLevels);
    console.log('🔍 Final response customClassLevels JSON:', JSON.stringify(mergedStructure.customizations.customClassLevels, null, 2));

    return mergedStructure;
  }

  async updateAcademicStructure(userId: string, updateDto: UpdateAcademicStructureDto) {
    console.log('🔧 updateAcademicStructure called with:', { userId, updateDto });
    console.log('🔧 Full updateDto object:', JSON.stringify(updateDto, null, 2));
    console.log('🔧 updateDto.customClassLevels type:', typeof updateDto.customClassLevels);
    console.log('🔧 updateDto.customClassLevels value:', updateDto.customClassLevels);
    console.log('🔧 updateDto.customClassLevels stringified:', JSON.stringify(updateDto.customClassLevels, null, 2));
    
    // First, get the school admin to find the school
    const schoolAdmin = await this.prisma.schoolAdmin.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        school: true,
      },
    });

    if (!schoolAdmin) {
      console.log('❌ School admin not found for userId:', userId);
      throw new NotFoundException('School admin not found');
    }

    console.log('✅ Found school admin:', { schoolId: schoolAdmin.school.id, schoolName: schoolAdmin.school.name });

    // Update the academic structure
    console.log('🔄 Updating academic structure with data:', {
      schoolId: schoolAdmin.school.id,
      selectedLevels: updateDto.selectedLevels,
      commonSubjects: updateDto.commonSubjects,
      commonGradingScales: updateDto.commonGradingScales,
      commonAcademicTerms: updateDto.commonAcademicTerms,
      // New granular fields
      customClassLevels: updateDto.customClassLevels,
      customSubjects: updateDto.customSubjects,
      customGradingScales: updateDto.customGradingScales,
      customAcademicTerms: updateDto.customAcademicTerms,
      customCurriculumStructure: updateDto.customCurriculumStructure,
      customAssessmentMethods: updateDto.customAssessmentMethods,
    });
    
    console.log('🔍 Detailed customClassLevels data:', JSON.stringify(updateDto.customClassLevels, null, 2));
    console.log('🔍 customClassLevels type:', typeof updateDto.customClassLevels);
    console.log('🔍 customClassLevels length:', updateDto.customClassLevels?.length);
    console.log('🔍 customClassLevels is array:', Array.isArray(updateDto.customClassLevels));
    console.log('🔍 customClassLevels first item:', updateDto.customClassLevels?.[0]);
    console.log('🔍 customClassLevels preschool data:', updateDto.customClassLevels?.find((item: any) => item.educationLevelId === 'preschool'));
    console.log('🔍 customClassLevels preschool data:', updateDto.customClassLevels?.find((level: any) => level.educationLevelId === 'preschool'));

    // Debug: Check what we're about to save
    console.log('🔍 About to save customClassLevels:', JSON.stringify(updateDto.customClassLevels, null, 2));
    console.log('🔍 About to save preschool data specifically:', JSON.stringify(updateDto.customClassLevels?.find((level: any) => level.educationLevelId === 'preschool'), null, 2));

    // Try using raw SQL update for customClassLevels to ensure it's properly saved
    const customClassLevelsJson = JSON.stringify(updateDto.customClassLevels || []);
    console.log('🔍 Raw SQL customClassLevels JSON:', customClassLevelsJson);
    
    // Check what's in the database BEFORE the update
    const beforeUpdate = await this.prisma.$queryRaw`
      SELECT "customClassLevels" FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
    console.log('🔍 BEFORE UPDATE - Database customClassLevels:', JSON.stringify((beforeUpdate as any)[0]?.customClassLevels, null, 2));
    
    const updateResult = await this.prisma.$executeRaw`
      UPDATE "school_academic_structures" 
      SET "customClassLevels" = ${customClassLevelsJson}::jsonb,
          "customSubjects" = ${JSON.stringify(updateDto.customSubjects || [])}::jsonb,
          "customGradingScales" = ${JSON.stringify(updateDto.customGradingScales || [])}::jsonb,
          "customAcademicTerms" = ${JSON.stringify(updateDto.customAcademicTerms || [])}::jsonb,
          "customCurriculumStructure" = ${JSON.stringify(updateDto.customCurriculumStructure || [])}::jsonb,
          "customAssessmentMethods" = ${JSON.stringify(updateDto.customAssessmentMethods || [])}::jsonb,
          "updatedAt" = ${new Date()}
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
    
    console.log('🔍 Raw SQL update result:', updateResult);
    
    // Check what's in the database AFTER the update
    const afterUpdate = await this.prisma.$queryRaw`
      SELECT "customClassLevels" FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
    console.log('🔍 AFTER UPDATE - Database customClassLevels:', JSON.stringify((afterUpdate as any)[0]?.customClassLevels, null, 2));

    // Update the other fields using Prisma
    await this.prisma.schoolAcademicStructure.update({
      where: {
        schoolId: schoolAdmin.school.id,
      },
      data: {
        selectedLevels: updateDto.selectedLevels,
        commonSubjects: updateDto.commonSubjects,
        commonGradingScales: updateDto.commonGradingScales,
        commonAcademicTerms: updateDto.commonAcademicTerms,
        updatedAt: new Date(),
      },
    });

    // Now fetch the complete updated structure including the JSON fields using raw SQL
    // to ensure we get the latest JSONB data
    const updatedStructureResult = await this.prisma.$queryRaw`
      SELECT * FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;

    if (!updatedStructureResult || (updatedStructureResult as any[]).length === 0) {
      throw new NotFoundException('Academic structure not found after update');
    }

    const updatedStructure = (updatedStructureResult as any[])[0];

    console.log('✅ Academic structure updated successfully:', updatedStructure);
    console.log('🔍 Raw updated structure from database:', JSON.stringify(updatedStructure, null, 2));
    console.log('🔍 Raw customClassLevels from updated structure:', JSON.stringify(updatedStructure.customClassLevels, null, 2));
    console.log('🔍 Custom class levels in updated structure:', (updatedStructure as any).customClassLevels);
    console.log('🔍 Full customClassLevels JSON:', JSON.stringify((updatedStructure as any).customClassLevels, null, 2));
    console.log('🔍 Preschool data in saved structure:', JSON.stringify((updatedStructure as any).customClassLevels?.find((level: any) => level.educationLevelId === 'preschool'), null, 2));
    console.log('🔍 Database save verification - customClassLevels type:', typeof (updatedStructure as any).customClassLevels);
    console.log('🔍 Database save verification - customClassLevels length:', (updatedStructure as any).customClassLevels?.length);
    console.log('🔍 Database save verification - customClassLevels first item:', (updatedStructure as any).customClassLevels?.[0]);
    console.log('🔍 Database save verification - preschool data saved:', (updatedStructure as any).customClassLevels?.find((item: any) => item.educationLevelId === 'preschool'));
    console.log('🔍 Database save verification - preschool data saved:', (updatedStructure as any).customClassLevels?.find((level: any) => level.educationLevelId === 'preschool'));

    // Let's also query the database directly to see what's actually stored
    const directQuery = await this.prisma.$queryRaw`
      SELECT "customClassLevels" FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
    console.log('🔍 Direct database query result:', directQuery);
    console.log('🔍 Direct database query preschool data:', JSON.stringify((directQuery as any)[0]?.customClassLevels?.find((level: any) => level.educationLevelId === 'preschool'), null, 2));

    // Let's also get the full record to see what's actually stored
    const fullRecord = await this.prisma.$queryRaw`
      SELECT * FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
    console.log('🔍 Full database record:', fullRecord);

    // Get the template data to merge with school's customizations (same as getAcademicStructureByUserId)
    const template = await this.prisma.educationSystemTemplate.findFirst({
      where: {
        countryCode: updatedStructure.countryCode,
        isActive: true,
      },
    });

    if (!template) {
      // If no template found, return the raw academic structure
      return updatedStructure;
    }

    // Merge template data with school's selected levels and customizations
    const templateData = template.templateData as any;
    const mergedStructure = {
      ...updatedStructure,
      templateData: templateData,
      availableLevels: templateData?.levels || [],
      selectedLevels: updatedStructure.selectedLevels,
      // Return granular customizations at root level for easier access
      customClassLevels: (updatedStructure as any).customClassLevels,
      customSubjects: (updatedStructure as any).customSubjects,
      customGradingScales: (updatedStructure as any).customGradingScales,
      customAcademicTerms: (updatedStructure as any).customAcademicTerms,
      customCurriculumStructure: (updatedStructure as any).customCurriculumStructure,
      customAssessmentMethods: (updatedStructure as any).customAssessmentMethods,
      customizations: {
        subjects: updatedStructure.commonSubjects,
        gradingScales: updatedStructure.commonGradingScales,
        academicTerms: updatedStructure.commonAcademicTerms,
        // New granular customizations
        customClassLevels: (updatedStructure as any).customClassLevels,
        customSubjects: (updatedStructure as any).customSubjects,
        customGradingScales: (updatedStructure as any).customGradingScales,
        customAcademicTerms: (updatedStructure as any).customAcademicTerms,
        customCurriculumStructure: (updatedStructure as any).customCurriculumStructure,
        customAssessmentMethods: (updatedStructure as any).customAssessmentMethods,
      },
    };

    console.log('🔍 Final merged structure customClassLevels:', mergedStructure.customizations.customClassLevels);
    console.log('🔍 Final response customizations:', JSON.stringify(mergedStructure.customizations, null, 2));
    console.log('🔍 Final response customClassLevels JSON:', JSON.stringify(mergedStructure.customizations.customClassLevels, null, 2));

    return mergedStructure;
  }
}

