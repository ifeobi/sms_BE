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
var SchoolTypeMappingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolTypeMappingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchoolTypeMappingService = SchoolTypeMappingService_1 = class SchoolTypeMappingService {
    prisma;
    logger = new common_1.Logger(SchoolTypeMappingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async mapStaticSchoolTypesToTemplate(countryCode, staticSchoolTypes) {
        this.logger.log(`🔍 Mapping static school types for country: ${countryCode}`);
        this.logger.log(`Static school types: ${staticSchoolTypes.join(', ')}`);
        try {
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
            const mappedLevels = this.mapStaticTypesToLevels(countryCode, staticSchoolTypes);
            if (mappedLevels.length === 0) {
                this.logger.warn(`❌ No valid level mappings found for school types: ${staticSchoolTypes.join(', ')}`);
                return null;
            }
            const result = {
                templateId: template.id,
                selectedLevels: mappedLevels,
                countryCode: template.countryCode,
            };
            this.logger.log(`✅ Mapping result:`, result);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error mapping school types:`, error);
            throw error;
        }
    }
    mapStaticTypesToLevels(countryCode, staticSchoolTypes) {
        const mappings = this.getStaticToLevelMappings(countryCode);
        const mappedLevels = [];
        for (const staticType of staticSchoolTypes) {
            const mapping = mappings[staticType];
            if (mapping) {
                mappedLevels.push(...mapping);
            }
            else {
                this.logger.warn(`⚠️ No mapping found for static school type: ${staticType}`);
            }
        }
        return [...new Set(mappedLevels)];
    }
    getStaticToLevelMappings(countryCode) {
        const mappings = {
            NG: {
                'nursery': ['nursery'],
                'primary': ['primary'],
                'jss': ['jss'],
                'sss': ['sss'],
                'preschool': ['preschool'],
            },
            GH: {
                'kindergarten': ['kindergarten'],
                'primary': ['primary'],
                'jhs': ['jhs'],
                'shs': ['shs'],
            },
            KE: {
                'primary': ['primary'],
                'secondary': ['secondary'],
            },
            UG: {
                'primary': ['primary'],
                'olevel': ['olevel'],
                'alevel': ['alevel'],
            },
            TZ: {
                'primary': ['primary'],
                'olevel': ['olevel'],
                'alevel': ['alevel'],
            },
            ZA: {
                'foundation': ['foundation'],
                'intermediate': ['intermediate'],
                'senior': ['senior'],
                'further': ['further'],
            },
            ZW: {
                'primary': ['primary'],
                'olevel': ['olevel'],
                'alevel': ['alevel'],
            },
            SN: {
                'primary': ['primary'],
                'college': ['college'],
                'lycee': ['lycee'],
            },
            CI: {
                'primary': ['primary'],
                'college': ['college'],
                'lycee': ['lycee'],
            },
            EG: {
                'primary': ['primary'],
                'preparatory': ['preparatory'],
                'secondary': ['secondary'],
            },
            MA: {
                'primary': ['primary'],
                'college': ['college'],
                'lycee': ['lycee'],
            },
            US: {
                'elementary': ['elementary'],
                'middle': ['middle'],
                'high': ['high'],
            },
            GB: {
                'primary': ['primary'],
                'secondary': ['secondary'],
                'sixth_form': ['sixth_form'],
            },
            CA: {
                'elementary': ['elementary'],
                'secondary': ['secondary'],
            },
        };
        return mappings[countryCode] || {};
    }
    getAvailableStaticSchoolTypes(countryCode) {
        const mappings = this.getStaticToLevelMappings(countryCode);
        return Object.keys(mappings);
    }
    validateStaticSchoolTypes(countryCode, staticSchoolTypes) {
        const availableTypes = this.getAvailableStaticSchoolTypes(countryCode);
        return staticSchoolTypes.every(type => availableTypes.includes(type));
    }
};
exports.SchoolTypeMappingService = SchoolTypeMappingService;
exports.SchoolTypeMappingService = SchoolTypeMappingService = SchoolTypeMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolTypeMappingService);
//# sourceMappingURL=school-type-mapping.service.js.map