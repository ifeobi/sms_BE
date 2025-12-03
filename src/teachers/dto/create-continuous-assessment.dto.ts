import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';

class ContinuousAssessmentRecordInput {
  @IsString()
  studentId: string;

  // Support dynamic CA fields (ca1, ca2, ca3, ..., ca20, etc.)
  // Using index signature to allow any ca* field
  [key: string]: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  exam?: number;

  @IsOptional()
  @IsString()
  grade?: string;
}

export class CreateContinuousAssessmentDto {
  @IsString()
  classId: string;

  @IsString()
  subjectId: string;

  @IsString()
  termId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    // Preserve all properties including dynamic CA fields
    // class-transformer strips unknown properties, so we need to preserve them manually
    if (!Array.isArray(value)) return value;
    
    return value.map((record: any) => {
      // Use plainToInstance with excludeExtraneousValues: false to preserve all properties
      // This ensures CA fields and studentId are preserved
      const instance = plainToInstance(
        ContinuousAssessmentRecordInput,
        record,
        {
          excludeExtraneousValues: false, // Preserve unknown properties
          enableImplicitConversion: true,
        }
      );
      
      // Manually copy all properties from original record to ensure nothing is lost
      // This is a safety measure in case plainToInstance still strips something
      Object.keys(record).forEach(key => {
        if (!(key in instance) || instance[key] === undefined) {
          (instance as any)[key] = record[key];
        }
      });
      
      return instance;
    });
  })
  records: ContinuousAssessmentRecordInput[];
}

