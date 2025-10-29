import { Injectable } from '@nestjs/common';
import {
  EducationSystem,
  EducationLevel,
  ClassLevel,
  SubjectDefinition,
} from './interfaces/education-system.interface';
import { allEducationSystems } from './helpers/education-systems-data';

@Injectable()
export class EducationSystemsService {
  private readonly educationSystems: Record<string, EducationSystem>;

  constructor() {
    // Initialize education systems from the helpers data
    this.educationSystems = {};
    allEducationSystems.forEach((system) => {
      this.educationSystems[system.id] = system;
    });
  }

  getAllEducationSystems(): EducationSystem[] {
    return Object.values(this.educationSystems);
  }

  getEducationSystemById(id: string): EducationSystem | null {
    return this.educationSystems[id] || null;
  }

  getEducationSystemsByCountry(countryCode: string): EducationSystem[] {
    return Object.values(this.educationSystems).filter(
      (system) => system.countryCode === countryCode,
    );
  }

  getAvailableCountries(): Array<{
    code: string;
    name: string;
    flag: string;
    phoneCode: string;
  }> {
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

  getSchoolLevelDisplayNames(countryCode: string): Array<{
    value: string;
    label: string;
  }> {
    const systems = this.getEducationSystemsByCountry(countryCode);
    const levels: Array<{ value: string; label: string }> = [];

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

  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
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
}
