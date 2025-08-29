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

    try {
      for (let i = 0; i < importData.students.length; i++) {
        const studentData = importData.students[i];

        try {
          await this.processStudentRecord(
            bulkImportId,
            schoolId,
            studentData,
            importData,
            i + 1,
          );
          successfulRecords++;
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

      // Final update
      await this.updateBulkImportProgress(
        bulkImportId,
        successfulRecords,
        failedRecords,
        errorLog,
      );
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

    // Create or get parent user
    const parentUser = await this.createOrGetParentUser(studentData);

    // Create student user
    const studentUser = await this.createStudentUser(studentData, schoolId);

    // Create student record
    const student = await this.prisma.student.create({
      data: {
        userId: studentUser.id,
        schoolId,
        studentNumber,
        currentLevelId:
          importData.levelId || (await this.getDefaultLevelId(schoolId)),
        currentClassId:
          importData.classId || (await this.getDefaultClassId(schoolId)),
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
    const parentRelationship =
      await this.prisma.parentSchoolRelationship.create({
        data: {
          parentUserId: parentUser.id,
          schoolId,
          relationshipType: ParentRelationshipType.FATHER, // Default, can be updated
          verificationCode: this.generateVerificationCode(),
          verificationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        },
      });

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

    // Send emails
    await this.sendStudentWelcomeEmail(studentUser, studentData);
    await this.sendParentInvitationEmail(
      parentUser,
      studentData,
      parentRelationship.verificationCode!,
    );

    this.logger.log(
      `Successfully processed student ${studentData.fullName} (Row ${rowNumber})`,
    );
  }

  private async createOrGetParentUser(studentData: BulkStudentDataDto) {
    // Check if parent user already exists
    let parentUser = await this.prisma.user.findFirst({
      where: {
        email: studentData.parentEmail,
        type: UserType.PARENT,
      },
    });

    if (!parentUser) {
      // Create new parent user
      const parentPassword = this.generateParentPassword();

      const hashedParentPassword = await bcrypt.hash(parentPassword, 10);
      parentUser = await this.prisma.user.create({
        data: {
          email: studentData.parentEmail,
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

      // Create parent record
      await this.prisma.parent.create({
        data: {
          userId: parentUser.id,
        },
      });

      // Send parent welcome email
      await this.sendParentWelcomeEmail(parentUser, parentPassword);
    }

    return parentUser;
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

    return studentUser;
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
    errorLog?: any[],
  ) {
    const status =
      failedRecords === 0
        ? BulkImportStatus.COMPLETED
        : BulkImportStatus.COMPLETED;

    await this.prisma.bulkImport.update({
      where: { id: bulkImportId },
      data: {
        successfulRecords,
        failedRecords,
        status,
        errorLog: errorLog ? JSON.stringify(errorLog) : undefined,
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
  ) {
    const password = await this.generateStudentPassword(user.schoolId);

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
