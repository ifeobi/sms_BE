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
exports.EducationSystemsService = void 0;
const common_1 = require("@nestjs/common");
const education_systems_data_1 = require("./helpers/education-systems-data");
let EducationSystemsService = class EducationSystemsService {
    educationSystems;
    constructor() {
        this.educationSystems = {};
        education_systems_data_1.allEducationSystems.forEach((system) => {
            this.educationSystems[system.id] = system;
        });
    }
    getAllEducationSystems() {
        return Object.values(this.educationSystems);
    }
    getEducationSystemById(id) {
        return this.educationSystems[id] || null;
    }
    getEducationSystemsByCountry(countryCode) {
        return Object.values(this.educationSystems).filter((system) => system.countryCode === countryCode);
    }
    getAvailableCountries() {
        const countries = new Map();
        Object.values(this.educationSystems).forEach((system) => {
            if (!countries.has(system.countryCode)) {
                countries.set(system.countryCode, {
                    code: system.countryCode,
                    name: this.getCountryName(system.countryCode),
                    flag: system.flag,
                    phoneCode: system.phoneCode,
                });
            }
        });
        return Array.from(countries.values());
    }
    getSchoolLevelDisplayNames(countryCode) {
        const systems = this.getEducationSystemsByCountry(countryCode);
        const levels = [];
        systems.forEach((system) => {
            system.levels.forEach((level) => {
                levels.push({
                    value: level.id,
                    label: level.name,
                });
            });
        });
        return levels;
    }
    getCountryName(countryCode) {
        const countryNames = {
            NG: 'Nigeria',
            GH: 'Ghana',
            KE: 'Kenya',
            UG: 'Uganda',
            TZ: 'Tanzania',
            ZA: 'South Africa',
            ZW: 'Zimbabwe',
            SN: 'Senegal',
            CI: "Côte d'Ivoire",
            EG: 'Egypt',
            MA: 'Morocco',
            US: 'United States',
            GB: 'United Kingdom',
            CA: 'Canada',
        };
        return countryNames[countryCode] || countryCode;
    }
};
exports.EducationSystemsService = EducationSystemsService;
exports.EducationSystemsService = EducationSystemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EducationSystemsService);
//# sourceMappingURL=education-systems.service.js.map