// Education System Configuration Types

export interface ClassLevel {
  id: string;
  displayName: string; // "Primary 1", "Grade 1", "Year 1"
  shortName: string; // "P1", "G1", "Y1"
  numericValue: number; // For sorting/comparison
  ageRange: [number, number]; // [min_age, max_age]
  isGraduationLevel: boolean; // True for final levels (P6, SS3, 12th Grade)
}

export interface SubjectDefinition {
  id: string;
  name: string;
  shortName: string;
  category:
    | "core"
    | "elective"
    | "vocational"
    | "language"
    | "arts"
    | "science"
    | "social";
  isRequired: boolean;
  applicableLevels: string[]; // Class level IDs where this subject is taught
  description?: string;
}

export interface GradingScale {
  id: string;
  name: string; // "Letter Grades", "Percentage", "Points"
  type: "letter" | "numeric" | "descriptive" | "percentage";
  ranges: GradeRange[];
  passingGrade: string | number;
  maxScore: number;
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string; // "A", "90-100", "Excellent"
  gpa?: number; // For GPA calculation
  description?: string;
}

export interface AcademicTerm {
  id: string;
  name: string; // "First Term", "Fall Semester", "Autumn Term"
  shortName: string; // "1st", "Fall", "Aut"
  startMonth: number; // 1-12
  endMonth: number;
  isExamTerm: boolean; // True if major exams are conducted
}

export interface EducationLevel {
  id: string;
  name: string; // "Primary", "Secondary", "Elementary"
  description: string;
  classLevels: ClassLevel[];
  subjects: SubjectDefinition[];
  gradingScale: GradingScale;
  terms: AcademicTerm[];
}

export interface EducationSystem {
  id: string;
  country: string;
  countryCode: string; // ISO country code
  systemName: string; // "Nigerian Education System", "US K-12 System"
  description: string;
  levels: EducationLevel[];
  features: {
    hasNationalExams: boolean;
    nationalExamNames?: string[]; // ["WAEC", "NECO"], ["SAT", "ACT"]
    hasGPA: boolean;
    usesTerms: boolean; // vs semesters
    allowsGradeRepeat: boolean;
    hasVocationalTracks: boolean;
  };
  calendar: {
    academicYearStart: number; // Month (1-12)
    academicYearEnd: number;
    vacationPeriods: VacationPeriod[];
  };
}

export interface VacationPeriod {
  name: string;
  startMonth: number;
  endMonth: number;
  description?: string;
}

// School's customized version of an education system
export interface SchoolAcademicConfig {
  id: string;
  schoolId: string;
  baseSystemId: string; // Reference to EducationSystem
  customizations: {
    modifiedLevels: Partial<EducationLevel>[];
    additionalSubjects: SubjectDefinition[];
    customGradingScale?: GradingScale;
    customTerms?: AcademicTerm[];
    schoolSpecificRules: SchoolRule[];
  };
  isActive: boolean;
  lastModified: Date;
  modifiedBy: string; // Admin user ID
}

export interface SchoolRule {
  id: string;
  type: "promotion" | "grading" | "attendance" | "discipline" | "custom";
  name: string;
  description: string;
  parameters: Record<string, any>;
  isActive: boolean;
}

// For the school registration process
export interface SystemSuggestion {
  systemId: string;
  confidence: number; // 0-1 based on country match
  customizations: string[]; // Suggested modifications
  reasoning: string; // Why this system was suggested
}
