export interface EducationSystem {
  id: string;
  country: string;
  countryCode: string;
  systemName: string;
  description: string;
  flag: string;
  phoneCode: string;
  levels: EducationLevel[];
  features: EducationSystemFeatures;
  calendar: EducationSystemCalendar;
}

export interface EducationLevel {
  id: string;
  name: string;
  description: string;
  ageRange: [number, number];
  classLevels: ClassLevel[];
  subjects: string[];
  nationalExam?: string;
}

export interface ClassLevel {
  id: string;
  name: string;
  ageRange: [number, number];
  description: string;
  subjects: string[];
}

export interface SystemSuggestion {
  systemId: string;
  confidence: number;
  customizations: string[];
  reasoning: string;
}

export interface SubjectDefinition {
  id: string;
  name: string;
  category: "core" | "science" | "social" | "arts" | "language" | "vocational";
  isRequired: boolean;
  applicableLevels: string[];
  description?: string;
  credits?: number;
}

export interface GradingScale {
  id: string;
  name: string;
  type: "letter" | "percentage" | "gpa";
  passingGrade: number;
  maxScore: number;
  ranges: GradeRange[];
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
  gpa: number;
  description: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
  startMonth: number;
  endMonth: number;
  isExamTerm: boolean;
  description?: string;
}

export interface VacationPeriod {
  name: string;
  startMonth: number;
  endMonth: number;
  description?: string;
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
