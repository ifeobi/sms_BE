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
var EducationSystemInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationSystemInitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const data_1 = require("./data");
let EducationSystemInitService = EducationSystemInitService_1 = class EducationSystemInitService {
    prisma;
    logger = new common_1.Logger(EducationSystemInitService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initializeEducationSystems() {
        try {
            this.logger.log('🚀 Starting education systems initialization...');
            this.logger.log(`📊 Found ${data_1.educationSystems.length} education systems to initialize`);
            this.logger.log('🔍 Checking for existing education system templates...');
            const existingCount = await this.prisma.educationSystemTemplate.count();
            this.logger.log(`📈 Found ${existingCount} existing templates in database`);
            if (existingCount > 0) {
                this.logger.log(`✅ Education systems already initialized (${existingCount} templates found). Skipping...`);
                return;
            }
            this.logger.log(`Initializing ${data_1.educationSystems.length} education systems...`);
            for (const system of data_1.educationSystems) {
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
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize education systems:', error);
            throw error;
        }
    }
    async getEducationSystemByCountry(countryCode) {
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
    async resetEducationSystems() {
        this.logger.warn('Resetting all education systems...');
        await this.prisma.educationSystemTemplate.deleteMany({});
        this.logger.log('All education systems deleted. Reinitializing...');
        await this.initializeEducationSystems();
    }
    async getSchoolAcademicStructure(schoolId) {
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
        const templateData = template.templateData;
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
    async createSchoolAcademicStructure(schoolId, templateId, selectedLevels) {
        this.logger.log(`🏗️ Creating academic structure for school: ${schoolId} with template: ${templateId}`);
        const template = await this.prisma.educationSystemTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new Error(`Template with ID ${templateId} not found`);
        }
        const existingStructure = await this.prisma.schoolAcademicStructure.findFirst({
            where: { schoolId },
        });
        if (existingStructure) {
            this.logger.warn(`⚠️ School ${schoolId} already has an academic structure. Updating instead.`);
            return this.updateSchoolAcademicStructure(schoolId, templateId, selectedLevels);
        }
        const templateData = template.templateData;
        const filteredLevels = (templateData?.levels || []).filter((level) => selectedLevels.includes(level.id));
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
    async updateSchoolAcademicStructure(schoolId, templateId, selectedLevels) {
        this.logger.log(`🔄 Updating academic structure for school: ${schoolId} with template: ${templateId}`);
        const template = await this.prisma.educationSystemTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new Error(`Template with ID ${templateId} not found`);
        }
        const templateData = template.templateData;
        const filteredLevels = (templateData?.levels || []).filter((level) => selectedLevels.includes(level.id));
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
        const countries = templates.map(template => {
            const templateData = template.templateData;
            return {
                code: template.countryCode,
                name: template.countryName,
                phoneCode: templateData?.phoneCode || '+1',
                flag: templateData?.flag || '🏳️',
            };
        });
        const uniqueCountries = countries.filter((country, index, self) => index === self.findIndex(c => c.code === country.code));
        this.logger.log(`✅ Found ${uniqueCountries.length} unique countries`);
        return uniqueCountries;
    }
};
exports.EducationSystemInitService = EducationSystemInitService;
exports.EducationSystemInitService = EducationSystemInitService = EducationSystemInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EducationSystemInitService);
//# sourceMappingURL=education-system-init.service.js.map