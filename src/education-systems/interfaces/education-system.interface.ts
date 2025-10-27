export interface EducationSystem {
  id: string;
  countryCode: string;
  systemName: string;
  description: string;
  flag: string;
  phoneCode: string;
  features: EducationSystemFeatures;
  calendar: EducationSystemCalendar;
  levels: EducationLevel[];
}

export interface EducationLevel {
  id: string;
  name: string;
  description: string;
  ageRange: [number, number];
  order: number;
  classLevels: ClassLevel[];
  subjects: string[];
  nationalExam?: string;
}

export interface ClassLevel {
  id: string;
  name: string;
  ageRange: [number, number];
  description: string;
  order: number;
  subjects: string[];
}

export interface SubjectDefinition {
  id: string;
  name: string;
  category: 'core' | 'science' | 'social' | 'arts' | 'language' | 'vocational';
  isRequired: boolean;
  applicableLevels: string[];
  description?: string;
  credits?: number;
}

export interface EducationSystemFeatures {
  usesTerms: boolean;
  hasExams: boolean;
  supportsElectives: boolean;
  maxSubjectsPerLevel: number;
}

export interface EducationSystemCalendar {
  academicYearStart: number; // Month (1-12)
  academicYearEnd: number; // Month (1-12)
  vacationPeriods: VacationPeriod[];
}

export interface VacationPeriod {
  name: string;
  startMonth: number;
  endMonth: number;
  description?: string;
}
