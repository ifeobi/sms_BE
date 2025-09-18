import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateAcademicStructureDto {
  @ApiProperty({
    description: 'Selected education level IDs as an array of strings',
    example: ['primary', 'jss', 'sss'],
  })
  @IsArray()
  @IsString({ each: true })
  selectedLevels: string[];

  @ApiProperty({
    description: 'Common subjects across all levels',
    example: [
      { id: 'pe', name: 'Physical Education' },
      { id: 'art', name: 'Art and Craft' },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  commonSubjects?: any[];

  @ApiProperty({
    description: 'Common grading scales across all levels',
    example: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  commonGradingScales?: any[];

  @ApiProperty({
    description: 'Common academic terms across all levels',
    example: ['First Term', 'Second Term', 'Third Term'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  commonAcademicTerms?: any[];

  // New granular customization fields
  @ApiProperty({
    description: 'Custom class levels per education level',
    example: [
      {
        educationLevelId: 'primary',
        classLevels: [
          { id: 'primary1', name: 'Primary 1', ageRange: [6, 7], isGraduationLevel: false }
        ]
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  customClassLevels?: any[];

  @ApiProperty({
    description: 'Custom subjects per education level',
    example: [
      {
        educationLevelId: 'primary',
        subjects: [
          { id: 'math', name: 'Mathematics', category: 'core', isRequired: true }
        ]
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  customSubjects?: any[];

  @ApiProperty({
    description: 'Custom grading scales per education level',
    example: [
      {
        educationLevelId: 'primary',
        gradingScales: [
          { id: 'primary-grading', name: 'Primary Grading', type: 'letter', ranges: [] }
        ]
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  customGradingScales?: any[];

  @ApiProperty({
    description: 'Custom academic terms per education level',
    example: [
      {
        educationLevelId: 'primary',
        academicTerms: [
          { id: 'term1', name: 'First Term', startMonth: 9, endMonth: 12 }
        ]
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  customAcademicTerms?: any[];

  @ApiProperty({
    description: 'Custom curriculum structure per education level',
    example: [
      {
        educationLevelId: 'primary',
        curriculumStructure: {
          coreSubjects: ['math', 'english'],
          electiveSubjects: ['art', 'music'],
          assessmentMethods: ['exams', 'projects']
        }
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  customCurriculumStructure?: any[];

  @ApiProperty({
    description: 'Custom assessment methods per education level',
    example: [
      {
        educationLevelId: 'primary',
        assessmentMethods: [
          { id: 'exam', name: 'Examination', weight: 70, type: 'summative' },
          { id: 'project', name: 'Project Work', weight: 30, type: 'formative' }
        ]
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  customAssessmentMethods?: any[];
}

