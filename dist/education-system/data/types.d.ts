export interface ClassLevel {
    id: string;
    displayName: string;
    shortName: string;
    numericValue: number;
    ageRange: [number, number];
    isGraduationLevel: boolean;
}
export interface SubjectDefinition {
    id: string;
    name: string;
    shortName: string;
    category: "core" | "elective" | "vocational" | "language" | "arts" | "science" | "social";
    isRequired: boolean;
    applicableLevels: string[];
    description?: string;
}
export interface GradingScale {
    id: string;
    name: string;
    type: "letter" | "numeric" | "descriptive" | "percentage";
    ranges: GradeRange[];
    passingGrade: string | number;
    maxScore: number;
}
export interface GradeRange {
    min: number;
    max: number;
    grade: string;
    gpa?: number;
    description?: string;
}
export interface AcademicTerm {
    id: string;
    name: string;
    shortName: string;
    startMonth: number;
    endMonth: number;
    isExamTerm: boolean;
}
export interface EducationLevel {
    id: string;
    name: string;
    description: string;
    classLevels: ClassLevel[];
    subjects: SubjectDefinition[];
    gradingScale: GradingScale;
    terms: AcademicTerm[];
}
export interface EducationSystem {
    id: string;
    country: string;
    countryCode: string;
    systemName: string;
    description: string;
    levels: EducationLevel[];
    features: {
        hasNationalExams: boolean;
        nationalExamNames?: string[];
        hasGPA: boolean;
        usesTerms: boolean;
        allowsGradeRepeat: boolean;
        hasVocationalTracks: boolean;
    };
    calendar: {
        academicYearStart: number;
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
export interface SchoolAcademicConfig {
    id: string;
    schoolId: string;
    baseSystemId: string;
    customizations: {
        modifiedLevels: Partial<EducationLevel>[];
        additionalSubjects: SubjectDefinition[];
        customGradingScale?: GradingScale;
        customTerms?: AcademicTerm[];
        schoolSpecificRules: SchoolRule[];
    };
    isActive: boolean;
    lastModified: Date;
    modifiedBy: string;
}
export interface SchoolRule {
    id: string;
    type: "promotion" | "grading" | "attendance" | "discipline" | "custom";
    name: string;
    description: string;
    parameters: Record<string, any>;
    isActive: boolean;
}
export interface SystemSuggestion {
    systemId: string;
    confidence: number;
    customizations: string[];
    reasoning: string;
}
