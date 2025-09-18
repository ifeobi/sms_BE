"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolAcademicStructureService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchoolAcademicStructureService = class SchoolAcademicStructureService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAcademicStructureByUserId(userId) {
        console.log('🔍 getAcademicStructureByUserId called for userId:', userId);
        console.log('🔍 getAcademicStructureByUserId stack trace:', new Error().stack);
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
            throw new common_1.NotFoundException('School admin not found');
        }
        console.log('✅ Found school admin:', { schoolId: schoolAdmin.school.id, schoolName: schoolAdmin.school.name });
        console.log('🔍 Querying database for schoolId:', schoolAdmin.school.id);
        const academicStructureResult = await this.prisma.$queryRaw `
      SELECT * FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
        console.log('🔍 Raw query result:', academicStructureResult);
        console.log('🔍 Raw query result length:', academicStructureResult.length);
        if (!academicStructureResult || academicStructureResult.length === 0) {
            throw new common_1.NotFoundException('Academic structure not found for this school');
        }
        const academicStructure = academicStructureResult[0];
        console.log('🔍 Raw academic structure from database:', academicStructure);
        console.log('🔍 Raw customClassLevels from database:', JSON.stringify(academicStructure.customClassLevels, null, 2));
        console.log('🔍 Raw customClassLevels type:', typeof academicStructure.customClassLevels);
        console.log('🔍 Raw customClassLevels is array:', Array.isArray(academicStructure.customClassLevels));
        if (academicStructure.customClassLevels) {
            const preschoolData = academicStructure.customClassLevels.find((level) => level.educationLevelId === 'preschool');
            console.log('🔍 Preschool data from database:', JSON.stringify(preschoolData, null, 2));
        }
        const template = await this.prisma.educationSystemTemplate.findFirst({
            where: {
                countryCode: academicStructure.countryCode,
                isActive: true,
            },
        });
        if (!template) {
            return academicStructure;
        }
        const templateData = template.templateData;
        const mergedStructure = {
            ...academicStructure,
            templateData: templateData,
            availableLevels: templateData?.levels || [],
            selectedLevels: academicStructure.selectedLevels,
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
    async updateAcademicStructure(userId, updateDto) {
        console.log('🔧 updateAcademicStructure called with:', { userId, updateDto });
        console.log('🔧 Full updateDto object:', JSON.stringify(updateDto, null, 2));
        console.log('🔧 updateDto.customClassLevels type:', typeof updateDto.customClassLevels);
        console.log('🔧 updateDto.customClassLevels value:', updateDto.customClassLevels);
        console.log('🔧 updateDto.customClassLevels stringified:', JSON.stringify(updateDto.customClassLevels, null, 2));
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
            throw new common_1.NotFoundException('School admin not found');
        }
        console.log('✅ Found school admin:', { schoolId: schoolAdmin.school.id, schoolName: schoolAdmin.school.name });
        console.log('🔄 Updating academic structure with data:', {
            schoolId: schoolAdmin.school.id,
            selectedLevels: updateDto.selectedLevels,
            commonSubjects: updateDto.commonSubjects,
            commonGradingScales: updateDto.commonGradingScales,
            commonAcademicTerms: updateDto.commonAcademicTerms,
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
        console.log('🔍 customClassLevels preschool data:', updateDto.customClassLevels?.find((item) => item.educationLevelId === 'preschool'));
        console.log('🔍 customClassLevels preschool data:', updateDto.customClassLevels?.find((level) => level.educationLevelId === 'preschool'));
        console.log('🔍 About to save customClassLevels:', JSON.stringify(updateDto.customClassLevels, null, 2));
        console.log('🔍 About to save preschool data specifically:', JSON.stringify(updateDto.customClassLevels?.find((level) => level.educationLevelId === 'preschool'), null, 2));
        const customClassLevelsJson = JSON.stringify(updateDto.customClassLevels || []);
        console.log('🔍 Raw SQL customClassLevels JSON:', customClassLevelsJson);
        const beforeUpdate = await this.prisma.$queryRaw `
      SELECT "customClassLevels" FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
        console.log('🔍 BEFORE UPDATE - Database customClassLevels:', JSON.stringify(beforeUpdate[0]?.customClassLevels, null, 2));
        const updateResult = await this.prisma.$executeRaw `
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
        const afterUpdate = await this.prisma.$queryRaw `
      SELECT "customClassLevels" FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
        console.log('🔍 AFTER UPDATE - Database customClassLevels:', JSON.stringify(afterUpdate[0]?.customClassLevels, null, 2));
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
        const updatedStructureResult = await this.prisma.$queryRaw `
      SELECT * FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
        if (!updatedStructureResult || updatedStructureResult.length === 0) {
            throw new common_1.NotFoundException('Academic structure not found after update');
        }
        const updatedStructure = updatedStructureResult[0];
        console.log('✅ Academic structure updated successfully:', updatedStructure);
        console.log('🔍 Raw updated structure from database:', JSON.stringify(updatedStructure, null, 2));
        console.log('🔍 Raw customClassLevels from updated structure:', JSON.stringify(updatedStructure.customClassLevels, null, 2));
        console.log('🔍 Custom class levels in updated structure:', updatedStructure.customClassLevels);
        console.log('🔍 Full customClassLevels JSON:', JSON.stringify(updatedStructure.customClassLevels, null, 2));
        console.log('🔍 Preschool data in saved structure:', JSON.stringify(updatedStructure.customClassLevels?.find((level) => level.educationLevelId === 'preschool'), null, 2));
        console.log('🔍 Database save verification - customClassLevels type:', typeof updatedStructure.customClassLevels);
        console.log('🔍 Database save verification - customClassLevels length:', updatedStructure.customClassLevels?.length);
        console.log('🔍 Database save verification - customClassLevels first item:', updatedStructure.customClassLevels?.[0]);
        console.log('🔍 Database save verification - preschool data saved:', updatedStructure.customClassLevels?.find((item) => item.educationLevelId === 'preschool'));
        console.log('🔍 Database save verification - preschool data saved:', updatedStructure.customClassLevels?.find((level) => level.educationLevelId === 'preschool'));
        const directQuery = await this.prisma.$queryRaw `
      SELECT "customClassLevels" FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
        console.log('🔍 Direct database query result:', directQuery);
        console.log('🔍 Direct database query preschool data:', JSON.stringify(directQuery[0]?.customClassLevels?.find((level) => level.educationLevelId === 'preschool'), null, 2));
        const fullRecord = await this.prisma.$queryRaw `
      SELECT * FROM "school_academic_structures" 
      WHERE "schoolId" = ${schoolAdmin.school.id}
    `;
        console.log('🔍 Full database record:', fullRecord);
        const template = await this.prisma.educationSystemTemplate.findFirst({
            where: {
                countryCode: updatedStructure.countryCode,
                isActive: true,
            },
        });
        if (!template) {
            return updatedStructure;
        }
        const templateData = template.templateData;
        const mergedStructure = {
            ...updatedStructure,
            templateData: templateData,
            availableLevels: templateData?.levels || [],
            selectedLevels: updatedStructure.selectedLevels,
            customClassLevels: updatedStructure.customClassLevels,
            customSubjects: updatedStructure.customSubjects,
            customGradingScales: updatedStructure.customGradingScales,
            customAcademicTerms: updatedStructure.customAcademicTerms,
            customCurriculumStructure: updatedStructure.customCurriculumStructure,
            customAssessmentMethods: updatedStructure.customAssessmentMethods,
            customizations: {
                subjects: updatedStructure.commonSubjects,
                gradingScales: updatedStructure.commonGradingScales,
                academicTerms: updatedStructure.commonAcademicTerms,
                customClassLevels: updatedStructure.customClassLevels,
                customSubjects: updatedStructure.customSubjects,
                customGradingScales: updatedStructure.customGradingScales,
                customAcademicTerms: updatedStructure.customAcademicTerms,
                customCurriculumStructure: updatedStructure.customCurriculumStructure,
                customAssessmentMethods: updatedStructure.customAssessmentMethods,
            },
        };
        console.log('🔍 Final merged structure customClassLevels:', mergedStructure.customizations.customClassLevels);
        console.log('🔍 Final response customizations:', JSON.stringify(mergedStructure.customizations, null, 2));
        console.log('🔍 Final response customClassLevels JSON:', JSON.stringify(mergedStructure.customizations.customClassLevels, null, 2));
        return mergedStructure;
    }
};
exports.SchoolAcademicStructureService = SchoolAcademicStructureService;
exports.SchoolAcademicStructureService = SchoolAcademicStructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolAcademicStructureService);
//# sourceMappingURL=school-academic-structure.service.js.map