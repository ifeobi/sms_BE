import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  BulkStudentImportDto,
  BulkStudentDataDto,
} from './dto/bulk-student-import.dto';
import {
  BulkImportStatus,
  BulkImportRecordStatus,
  UserType,
  Gender,
  ParentRelationshipType,
} from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async startBulkImport(
    schoolId: string,
    importedBy: string,
    importData: BulkStudentImportDto,
  ) {
    // Create bulk import record
    const bulkImport = await this.prisma.bulkImport.create({
      data: {
        schoolId,
        importedBy,
        totalRecords: importData.students.length,
        status: BulkImportStatus.PROCESSING,
      },
    });

    // Start processing in background
    this.processBulkImport(bulkImport.id, schoolId, importData).catch(
      (error) => {
        this.logger.error(`Bulk import ${bulkImport.id} failed:`, error);
      },
    );

    return {
      id: bulkImport.id,
      totalRecords: bulkImport.totalRecords,
      status: bulkImport.status,
      message: 'Bulk import started successfully',
    };
  }

  private async processBulkImport(
    bulkImportId: string,
    schoolId: string,
    importData: BulkStudentImportDto,
  ) {
    let successfulRecords = 0;
    let failedRecords = 0;
    const errorLog: any[] = [];
    const credentials: any[] = []; // Store passwords for successful imports

    try {
      for (let i = 0; i < importData.students.length; i++) {
        const studentData = importData.students[i];

        try {
          const result = await this.processStudentRecord(
            bulkImportId,
            schoolId,
            studentData,
            importData,
            i + 1,
          );
          successfulRecords++;
          
          // Store credentials for this student
          if (result && result.password) {
            credentials.push({
              row: i + 1,
              studentName: studentData.fullName,
              email: studentData.email,
              password: result.password,
              parentEmail: studentData.parentEmail,
              parentPassword: result.parentPassword || 'Existing parent account',
            });
          }
        } catch (error) {
          failedRecords++;
          errorLog.push({
            row: i + 1,
            student: studentData.fullName,
            error: error.message,
          });
          this.logger.error(
            `Failed to process student ${studentData.fullName}:`,
            error,
          );
        }

        // Update progress every 10 records
        if ((i + 1) % 10 === 0) {
          await this.updateBulkImportProgress(
            bulkImportId,
            successfulRecords,
            failedRecords,
          );
        }
      }

      // Final update - include credentials in errorLog for frontend access
      await this.updateBulkImportProgress(
        bulkImportId,
        successfulRecords,
        failedRecords,
        { errors: errorLog, credentials },
      );
      
      // Log credentials to console for easy access
      if (credentials.length > 0) {
        console.log('\n========================================');
        console.log('📋 BULK IMPORT CREDENTIALS');
        console.log('========================================');
        credentials.forEach((cred) => {
          console.log(`\n✅ Row ${cred.row}: ${cred.studentName}`);
          console.log(`   Student Email: ${cred.email}`);
          console.log(`   Student Password: ${cred.password}`);
          console.log(`   Parent Email: ${cred.parentEmail}`);
          console.log(`   Parent Password: ${cred.parentPassword}`);
        });
        console.log('========================================\n');
      }
    } catch (error) {
      this.logger.error(`Bulk import ${bulkImportId} failed:`, error);
      await this.updateBulkImportStatus(bulkImportId, BulkImportStatus.FAILED);
    }
  }

  private async processStudentRecord(
    bulkImportId: string,
    schoolId: string,
    studentData: BulkStudentDataDto,
    importData: BulkStudentImportDto,
    rowNumber: number,
  ) {
    // Generate student number
    const studentNumber = await this.generateStudentNumber(schoolId);

    // Create or get parent user and ensure Parent record exists
    const { user: parentUser, password: parentPassword } = await this.createOrGetParentUser(studentData);
    
    this.logger.log(`[BULK IMPORT] Parent user: ${parentUser.id} (${parentUser.email})`);
    
    // Get or create Parent record (required for ParentSchoolRelationship)
    let parentRecord = await this.prisma.parent.findUnique({
      where: { userId: parentUser.id },
    });
    
    if (!parentRecord) {
      this.logger.warn(`[BULK IMPORT] Parent record does NOT exist for user: ${parentUser.id}, creating...`);
      try {
        parentRecord = await this.prisma.parent.create({
          data: {
            userId: parentUser.id,
          },
        });
        this.logger.log(`[BULK IMPORT] Parent record created: ${parentRecord.id}`);
      } catch (error) {
        this.logger.error(`[BULK IMPORT] Failed to create Parent record for user ${parentUser.id}:`, error);
        throw new Error(`Failed to create Parent record: ${error.message}`);
      }
    } else {
      this.logger.log(`[BULK IMPORT] Parent record exists: ${parentRecord.id}`);
    }
    
    // Verify parentRecord is set before proceeding
    if (!parentRecord || !parentRecord.id) {
      throw new Error(`Failed to get or create Parent record for user ${parentUser.id}`);
    }
    
    this.logger.log(`[BULK IMPORT] Using Parent ID for relationship: ${parentRecord.id}`);

    // Create student user
    const { user: studentUser, password: studentPassword } = await this.createStudentUser(studentData, schoolId);

    // Resolve levelId - map string values to actual Level IDs from database
    let resolvedLevelId: string;
    if (importData.levelId) {
      // First check if it's already a valid UUID/ID
      const levelById = await this.prisma.level.findFirst({
        where: {
          id: importData.levelId,
          schoolId,
          isActive: true,
        },
      });

      if (levelById) {
        resolvedLevelId = levelById.id;
        this.logger.log(`Resolved levelId "${importData.levelId}" as direct ID`);
      } else {
        // Try to match by name patterns (case-insensitive)
        const levelPatterns: Record<string, string[]> = {
          'PRIMARY': ['Primary', 'Primary School'],
          'JSS': ['Junior Secondary', 'JSS', 'Junior Secondary School'],
          'SSS': ['Senior Secondary', 'SSS', 'Senior Secondary School'],
          'NURSERY': ['Nursery', 'Nursery School'],
        };

        const matchingPattern = levelPatterns[importData.levelId.toUpperCase()];
        if (matchingPattern) {
          // Try each pattern name
          let foundLevel: { id: string; name: string } | null = null;
          for (const patternName of matchingPattern) {
            foundLevel = await this.prisma.level.findFirst({
              where: {
                schoolId,
                isActive: true,
                name: {
                  contains: patternName,
                },
              },
            });
            if (foundLevel) break;
          }

          if (foundLevel) {
            resolvedLevelId = foundLevel.id;
            this.logger.log(`Resolved levelId "${importData.levelId}" to ${resolvedLevelId} (${foundLevel.name})`);
          } else {
            resolvedLevelId = await this.getDefaultLevelId(schoolId);
            this.logger.warn(`Could not resolve levelId "${importData.levelId}", using default`);
          }
        } else {
          // Try fuzzy match by name
          const fuzzyLevel = await this.prisma.level.findFirst({
            where: {
              schoolId,
              isActive: true,
              name: {
                contains: importData.levelId,
              },
            },
          });

          if (fuzzyLevel) {
            resolvedLevelId = fuzzyLevel.id;
            this.logger.log(`Resolved levelId "${importData.levelId}" via fuzzy match to ${resolvedLevelId}`);
          } else {
            resolvedLevelId = await this.getDefaultLevelId(schoolId);
            this.logger.warn(`Could not resolve levelId "${importData.levelId}", using default`);
          }
        }
      }
    } else {
      resolvedLevelId = await this.getDefaultLevelId(schoolId);
    }

    // Resolve classId - map string values to actual Class IDs from database
    let resolvedClassId: string;
    if (importData.classId) {
      // First check if it's already a valid UUID/ID
      const classById = await this.prisma.class.findFirst({
        where: {
          id: importData.classId,
          schoolId,
          isActive: true,
        },
      });

      if (classById) {
        resolvedClassId = classById.id;
        this.logger.log(`Resolved classId "${importData.classId}" as direct ID`);
      } else {
        // Try to match by name patterns (e.g., "PRIMARY_2" -> "Primary 2")
        const classPattern = importData.classId.replace(/_/g, ' ').replace(/-/g, ' ');
        
        // Try exact match first
        let foundClass = await this.prisma.class.findFirst({
          where: {
            schoolId,
            isActive: true,
            name: classPattern,
          },
        });

        // If not found, try contains match
        if (!foundClass) {
          foundClass = await this.prisma.class.findFirst({
            where: {
              schoolId,
              isActive: true,
              name: {
                contains: classPattern,
              },
            },
          });
        }

        // If still not found, try matching "Primary 2" style
        if (!foundClass) {
          const normalizedPattern = classPattern
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          foundClass = await this.prisma.class.findFirst({
            where: {
              schoolId,
              isActive: true,
              name: {
                contains: normalizedPattern,
              },
            },
          });
        }

        if (foundClass) {
          resolvedClassId = foundClass.id;
          this.logger.log(`Resolved classId "${importData.classId}" to ${resolvedClassId} (${foundClass.name})`);
        } else {
          // Try to find a class within the resolved level
          const classInLevel = await this.prisma.class.findFirst({
            where: {
              schoolId,
              levelId: resolvedLevelId,
              isActive: true,
            },
            orderBy: { order: 'asc' },
          });

          if (classInLevel) {
            resolvedClassId = classInLevel.id;
            this.logger.warn(`Could not resolve classId "${importData.classId}", using first class in level: ${classInLevel.name}`);
          } else {
            resolvedClassId = await this.getDefaultClassId(schoolId);
            this.logger.warn(`Could not resolve classId "${importData.classId}", using default`);
          }
        }
      }
    } else {
      resolvedClassId = await this.getDefaultClassId(schoolId);
    }

    // Create student record
    const student = await this.prisma.student.create({
      data: {
        userId: studentUser.id,
        schoolId,
        studentNumber,
        currentLevelId: resolvedLevelId,
        currentClassId: resolvedClassId,
        academicYear:
          importData.academicYear || new Date().getFullYear().toString(),
        dateOfBirth: new Date(studentData.dateOfBirth),
        gender: studentData.sex,
        nationality: 'Nigerian', // Default, can be updated later
        fatherName: studentData.parentFullName,
        fatherPhone: studentData.parentPhone,
        fatherEmail: studentData.parentEmail,
        modifiedBy: 'bulk_import',
      },
    });

    // Create parent-school relationship
    this.logger.log(`[BULK IMPORT] Creating ParentSchoolRelationship with parentRecord.id: ${parentRecord.id}, schoolId: ${schoolId}`);
    
    // Double-check parentRecord exists in DB before creating relationship
    const verifiedParentRecord = await this.prisma.parent.findUnique({
      where: { id: parentRecord.id },
    });
    
    if (!verifiedParentRecord) {
      this.logger.error(`[BULK IMPORT] Parent record NOT found in DB: ${parentRecord.id}`);
      throw new Error(`Parent record ${parentRecord.id} does not exist in database`);
    }
    
    this.logger.log(`[BULK IMPORT] Verified Parent record exists: ${verifiedParentRecord.id}`);
    
    try {
      const parentRelationship =
        await this.prisma.parentSchoolRelationship.create({
          data: {
            parentUserId: parentRecord.id, // Use Parent.id, not User.id
            schoolId,
            relationshipType: ParentRelationshipType.FATHER, // Default, can be updated
            verificationCode: this.generateVerificationCode(),
            verificationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          },
        });
      
      this.logger.log(`[BULK IMPORT] ParentSchoolRelationship created successfully: ${parentRelationship.id}`);
      
      // Link student to parent relationship
      await this.prisma.student.update({
        where: { id: student.id },
        data: {
          parentRelationships: {
            connect: { id: parentRelationship.id },
          },
        },
      });

      // Create bulk import record
      await this.prisma.bulkImportRecord.create({
        data: {
          bulkImportId,
          studentId: student.id,
          status: BulkImportRecordStatus.SUCCESS,
        },
      });

      // Send emails (non-blocking - don't fail if email fails)
      try {
        await this.sendStudentWelcomeEmail(studentUser, studentData, schoolId);
      } catch (error) {
        this.logger.warn(`Failed to send student welcome email: ${error.message}`);
      }
      
      try {
        await this.sendParentInvitationEmail(
          parentUser,
          studentData,
          parentRelationship.verificationCode!,
        );
      } catch (error) {
        this.logger.warn(`Failed to send parent invitation email: ${error.message}`);
      }

      this.logger.log(
        `✅ Successfully processed student ${studentData.fullName} (Row ${rowNumber})`,
      );
      
      // Log to console for better visibility
      console.log(`\n✅ [BULK IMPORT] Row ${rowNumber}: ${studentData.fullName}`);
      console.log(`   📧 Student: ${studentData.email} | 🔑 Password: ${studentPassword}`);
      if (parentPassword) {
        console.log(`   👨‍👩‍👧 Parent: ${studentData.parentEmail} | 🔑 Password: ${parentPassword}`);
      }
      
      return {
        password: studentPassword,
        parentPassword: parentPassword || undefined,
      };
    } catch (error) {
      this.logger.error(`[BULK IMPORT] Failed to create ParentSchoolRelationship:`, error);
      if (error.code === 'P2003') {
        this.logger.error(`[BULK IMPORT] Foreign key constraint violation - parentRecord.id: ${parentRecord.id}, parentUserId field expected: Parent.id`);
        // Try to get more info about the Parent record
        const debugParent = await this.prisma.parent.findUnique({
          where: { id: parentRecord.id },
        });
        this.logger.error(`[BULK IMPORT] Debug - Parent record lookup result:`, debugParent);
        throw new Error(`Foreign key constraint violation: Parent record ${parentRecord.id} may not exist or parentUserId field is incorrect`);
      }
      throw error;
    }
  }

  private async createOrGetParentUser(studentData: BulkStudentDataDto): Promise<{ user: any; password?: string }> {
    // Normalize email (trim and lowercase for consistent matching)
    const normalizedEmail = studentData.parentEmail.trim().toLowerCase();
    
    this.logger.log(`[BULK IMPORT] Looking up parent user with email: ${studentData.parentEmail} (normalized: ${normalizedEmail})`);
    
    // Check if parent user already exists (case-insensitive search)
    let parentUser = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive', // Case-insensitive match
        },
        type: UserType.PARENT,
      },
    });

    if (!parentUser) {
      // Try one more time with exact match (in case of edge cases)
      parentUser = await this.prisma.user.findFirst({
        where: {
          email: studentData.parentEmail.trim(),
          type: UserType.PARENT,
        },
      });
    }

    if (!parentUser) {
      this.logger.log(`[BULK IMPORT] Creating NEW parent user for: ${studentData.parentEmail}`);
      console.log(`🟢 [BULK IMPORT] No existing parent found, creating new parent user`);
      // Create new parent user
      const parentPassword = this.generateParentPassword();

      const hashedParentPassword = await bcrypt.hash(parentPassword, 10);
      parentUser = await this.prisma.user.create({
        data: {
          email: studentData.parentEmail.trim(), // Store normalized email
          password: hashedParentPassword,
          type: UserType.PARENT,
          firstName:
            studentData.parentFullName.split(' ')[0] ||
            studentData.parentFullName,
          lastName:
            studentData.parentFullName.split(' ').slice(1).join(' ') || '',
          fullName: studentData.parentFullName, // Store the original full name
          phone: studentData.parentPhone,
        },
      });

      console.log(`✅ [BULK IMPORT] PARENT PASSWORD for ${studentData.parentFullName} (${studentData.parentEmail}): ${parentPassword}`);

      // Create parent record for new user
      this.logger.log(`[BULK IMPORT] Creating Parent record for new user: ${parentUser.id}`);
      try {
        const newParentRecord = await this.prisma.parent.create({
          data: {
            userId: parentUser.id,
          },
        });
        this.logger.log(`[BULK IMPORT] Parent record created for new user: ${newParentRecord.id}`);
      } catch (error) {
        this.logger.error(`[BULK IMPORT] Failed to create Parent record for new user ${parentUser.id}:`, error);
        throw new Error(`Failed to create Parent record: ${error.message}`);
      }

      // Send parent welcome email (non-blocking)
      try {
        await this.sendParentWelcomeEmail(parentUser, parentPassword);
      } catch (error) {
        this.logger.warn(`Failed to send parent welcome email: ${error.message}`);
      }
      
      return { user: parentUser, password: parentPassword };
    } else {
      console.log(`✅ [BULK IMPORT] EXISTING parent user found: ${parentUser.id} (${parentUser.email})`);
      this.logger.log(`[BULK IMPORT] EXISTING parent user found: ${parentUser.id} (${parentUser.email})`);
      // For existing parent user, ensure Parent record exists (might have been created elsewhere)
      const existingParentRecord = await this.prisma.parent.findUnique({
        where: { userId: parentUser.id },
      });
      
      if (!existingParentRecord) {
        this.logger.warn(`[BULK IMPORT] Existing parent user does NOT have Parent record, creating...`);
        try {
          const newParentRecord = await this.prisma.parent.create({
            data: {
              userId: parentUser.id,
            },
          });
          this.logger.log(`[BULK IMPORT] Parent record created for existing user: ${newParentRecord.id}`);
        } catch (error) {
          this.logger.error(`[BULK IMPORT] Failed to create Parent record for existing user ${parentUser.id}:`, error);
          throw new Error(`Failed to create Parent record: ${error.message}`);
        }
      } else {
        this.logger.log(`[BULK IMPORT] Existing parent user already has Parent record: ${existingParentRecord.id}`);
      }
      
      return { user: parentUser }; // No password for existing parent
    }
  }

  private async createStudentUser(
    studentData: BulkStudentDataDto,
    schoolId: string,
  ) {
    const studentPassword = await this.generateStudentPassword(schoolId);
    const [firstName, ...lastNameParts] = studentData.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
    const studentUser = await this.prisma.user.create({
      data: {
        email: studentData.email,
        password: hashedStudentPassword,
        type: UserType.STUDENT,
        firstName,
        lastName,
        fullName: studentData.fullName, // Store the original full name
        phone: studentData.phone,
      },
    });

    this.logger.log(`[BULK IMPORT] ✅ STUDENT PASSWORD for ${studentData.fullName} (${studentData.email}): ${studentPassword}`);

    return { user: studentUser, password: studentPassword };
  }

  private async generateStudentNumber(schoolId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.student.count({
      where: {
        schoolId,
        enrollmentDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return `${year}${(count + 1).toString().padStart(4, '0')}`;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async generateStudentPassword(schoolId: string): Promise<string> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true },
    });

    const schoolPrefix = school?.name.substring(0, 3).toUpperCase() || 'SCH';
    const year = new Date().getFullYear();

    return `Student@${schoolPrefix}${year}`;
  }

  private generateParentPassword(): string {
    const year = new Date().getFullYear();
    return `Parent@${year}`;
  }

  private async getDefaultLevelId(schoolId: string): Promise<string> {
    const level = await this.prisma.level.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { order: 'asc' },
    });

    if (!level) {
      throw new Error('No active levels found for school');
    }

    return level.id;
  }

  private async getDefaultClassId(schoolId: string): Promise<string> {
    const class_ = await this.prisma.class.findFirst({
      where: { schoolId, isActive: true },
      orderBy: { order: 'asc' },
    });

    if (!class_) {
      throw new Error('No active classes found for school');
    }

    return class_.id;
  }

  private async updateBulkImportProgress(
    bulkImportId: string,
    successfulRecords: number,
    failedRecords: number,
    errorLog?: any[] | { errors?: any[]; credentials?: any[] },
  ) {
    const status =
      failedRecords === 0
        ? BulkImportStatus.COMPLETED
        : BulkImportStatus.COMPLETED;

    // Handle both array and object formats
    let errorLogData: any;
    if (Array.isArray(errorLog)) {
      errorLogData = errorLog;
    } else if (errorLog && typeof errorLog === 'object') {
      errorLogData = errorLog;
    } else {
      errorLogData = null;
    }

    await this.prisma.bulkImport.update({
      where: { id: bulkImportId },
      data: {
        successfulRecords,
        failedRecords,
        status,
        errorLog: errorLogData ? JSON.stringify(errorLogData) : undefined,
        completedAt:
          status === BulkImportStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }

  private async updateBulkImportStatus(
    bulkImportId: string,
    status: BulkImportStatus,
  ) {
    await this.prisma.bulkImport.update({
      where: { id: bulkImportId },
      data: { status },
    });
  }

  private async sendStudentWelcomeEmail(
    user: any,
    studentData: BulkStudentDataDto,
    schoolId: string,
  ) {
    const password = await this.generateStudentPassword(schoolId);

    await this.emailService.sendStudentWelcomeEmail({
      to: studentData.email,
      studentName: studentData.fullName,
      email: studentData.email,
      password,
      schoolName: 'Your School', // Get from school data
    });
  }

  private async sendParentWelcomeEmail(user: any, password: string) {
    await this.emailService.sendParentWelcomeEmail({
      to: user.email,
      parentName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      password,
    });
  }

  private async sendParentInvitationEmail(
    user: any,
    studentData: BulkStudentDataDto,
    verificationCode: string,
  ) {
    await this.emailService.sendParentInvitationEmail({
      to: user.email,
      parentName: `${user.firstName} ${user.lastName}`,
      studentName: studentData.fullName,
      verificationCode,
    });
  }

  async getBulkImportProgress(bulkImportId: string) {
    const bulkImport = await this.prisma.bulkImport.findUnique({
      where: { id: bulkImportId },
    });

    if (!bulkImport) {
      throw new Error('Bulk import not found');
    }

    const progress =
      bulkImport.totalRecords > 0
        ? Math.round(
            ((bulkImport.successfulRecords + bulkImport.failedRecords) /
              bulkImport.totalRecords) *
              100,
          )
        : 0;

    return {
      id: bulkImport.id,
      status: bulkImport.status,
      totalRecords: bulkImport.totalRecords,
      successfulRecords: bulkImport.successfulRecords,
      failedRecords: bulkImport.failedRecords,
      progress,
      errorLog: bulkImport.errorLog
        ? JSON.parse(bulkImport.errorLog as string)
        : null,
      createdAt: bulkImport.createdAt,
      completedAt: bulkImport.completedAt,
    };
  }

  async verifyParentCode(email: string, code: string) {
    const relationship = await this.prisma.parentSchoolRelationship.findFirst({
      where: {
        verificationCode: code,
        verificationExpiresAt: { gt: new Date() },
        isVerified: false,
      },
      include: {
        parent: {
          include: {
            user: true,
          },
        },
        children: true,
      },
    });

    if (!relationship || relationship.parent.user.email !== email) {
      throw new Error('Invalid or expired verification code');
    }

    // Mark as verified
    await this.prisma.parentSchoolRelationship.update({
      where: { id: relationship.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Parent-child relationship verified successfully',
      parentId: relationship.parent.id,
      studentId: relationship.children[0]?.id,
    };
  }
}
