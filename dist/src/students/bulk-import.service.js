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
var BulkImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
let BulkImportService = BulkImportService_1 = class BulkImportService {
    prisma;
    emailService;
    logger = new common_1.Logger(BulkImportService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async startBulkImport(schoolId, importedBy, importData) {
        const bulkImport = await this.prisma.bulkImport.create({
            data: {
                schoolId,
                importedBy,
                totalRecords: importData.students.length,
                status: client_1.BulkImportStatus.PROCESSING,
            },
        });
        this.processBulkImport(bulkImport.id, schoolId, importData).catch((error) => {
            this.logger.error(`Bulk import ${bulkImport.id} failed:`, error);
        });
        return {
            id: bulkImport.id,
            totalRecords: bulkImport.totalRecords,
            status: bulkImport.status,
            message: 'Bulk import started successfully',
        };
    }
    async processBulkImport(bulkImportId, schoolId, importData) {
        let successfulRecords = 0;
        let failedRecords = 0;
        const errorLog = [];
        try {
            for (let i = 0; i < importData.students.length; i++) {
                const studentData = importData.students[i];
                try {
                    await this.processStudentRecord(bulkImportId, schoolId, studentData, importData, i + 1);
                    successfulRecords++;
                }
                catch (error) {
                    failedRecords++;
                    errorLog.push({
                        row: i + 1,
                        student: studentData.fullName,
                        error: error.message,
                    });
                    this.logger.error(`Failed to process student ${studentData.fullName}:`, error);
                }
                if ((i + 1) % 10 === 0) {
                    await this.updateBulkImportProgress(bulkImportId, successfulRecords, failedRecords);
                }
            }
            await this.updateBulkImportProgress(bulkImportId, successfulRecords, failedRecords, errorLog);
        }
        catch (error) {
            this.logger.error(`Bulk import ${bulkImportId} failed:`, error);
            await this.updateBulkImportStatus(bulkImportId, client_1.BulkImportStatus.FAILED);
        }
    }
    async processStudentRecord(bulkImportId, schoolId, studentData, importData, rowNumber) {
        const studentNumber = await this.generateStudentNumber(schoolId);
        const parentUser = await this.createOrGetParentUser(studentData);
        const studentUser = await this.createStudentUser(studentData, schoolId);
        const student = await this.prisma.student.create({
            data: {
                userId: studentUser.id,
                schoolId,
                studentNumber,
                currentLevelId: importData.levelId || (await this.getDefaultLevelId(schoolId)),
                currentClassId: importData.classId || (await this.getDefaultClassId(schoolId)),
                academicYear: importData.academicYear || new Date().getFullYear().toString(),
                dateOfBirth: new Date(studentData.dateOfBirth),
                gender: studentData.sex,
                nationality: 'Nigerian',
                fatherName: studentData.parentFullName,
                fatherPhone: studentData.parentPhone,
                fatherEmail: studentData.parentEmail,
                modifiedBy: 'bulk_import',
            },
        });
        const parentRelationship = await this.prisma.parentSchoolRelationship.create({
            data: {
                parentUserId: parentUser.id,
                schoolId,
                relationshipType: client_1.ParentRelationshipType.FATHER,
                verificationCode: this.generateVerificationCode(),
                verificationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
        });
        await this.prisma.student.update({
            where: { id: student.id },
            data: {
                parentRelationships: {
                    connect: { id: parentRelationship.id },
                },
            },
        });
        await this.prisma.bulkImportRecord.create({
            data: {
                bulkImportId,
                studentId: student.id,
                status: client_1.BulkImportRecordStatus.SUCCESS,
            },
        });
        await this.sendStudentWelcomeEmail(studentUser, studentData);
        await this.sendParentInvitationEmail(parentUser, studentData, parentRelationship.verificationCode);
        this.logger.log(`Successfully processed student ${studentData.fullName} (Row ${rowNumber})`);
    }
    async createOrGetParentUser(studentData) {
        let parentUser = await this.prisma.user.findFirst({
            where: {
                email: studentData.parentEmail,
                type: client_1.UserType.PARENT,
            },
        });
        if (!parentUser) {
            const parentPassword = this.generateParentPassword();
            const hashedParentPassword = await bcrypt.hash(parentPassword, 10);
            parentUser = await this.prisma.user.create({
                data: {
                    email: studentData.parentEmail,
                    password: hashedParentPassword,
                    type: client_1.UserType.PARENT,
                    firstName: studentData.parentFullName.split(' ')[0] ||
                        studentData.parentFullName,
                    lastName: studentData.parentFullName.split(' ').slice(1).join(' ') || '',
                    fullName: studentData.parentFullName,
                    phone: studentData.parentPhone,
                },
            });
            await this.prisma.parent.create({
                data: {
                    userId: parentUser.id,
                },
            });
            await this.sendParentWelcomeEmail(parentUser, parentPassword);
        }
        return parentUser;
    }
    async createStudentUser(studentData, schoolId) {
        const studentPassword = await this.generateStudentPassword(schoolId);
        const [firstName, ...lastNameParts] = studentData.fullName.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
        const studentUser = await this.prisma.user.create({
            data: {
                email: studentData.email,
                password: hashedStudentPassword,
                type: client_1.UserType.STUDENT,
                firstName,
                lastName,
                fullName: studentData.fullName,
                phone: studentData.phone,
            },
        });
        return studentUser;
    }
    async generateStudentNumber(schoolId) {
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
    generateVerificationCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    async generateStudentPassword(schoolId) {
        const school = await this.prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true },
        });
        const schoolPrefix = school?.name.substring(0, 3).toUpperCase() || 'SCH';
        const year = new Date().getFullYear();
        return `Student@${schoolPrefix}${year}`;
    }
    generateParentPassword() {
        const year = new Date().getFullYear();
        return `Parent@${year}`;
    }
    async getDefaultLevelId(schoolId) {
        const level = await this.prisma.level.findFirst({
            where: { schoolId, isActive: true },
            orderBy: { order: 'asc' },
        });
        if (!level) {
            throw new Error('No active levels found for school');
        }
        return level.id;
    }
    async getDefaultClassId(schoolId) {
        const class_ = await this.prisma.class.findFirst({
            where: { schoolId, isActive: true },
            orderBy: { order: 'asc' },
        });
        if (!class_) {
            throw new Error('No active classes found for school');
        }
        return class_.id;
    }
    async updateBulkImportProgress(bulkImportId, successfulRecords, failedRecords, errorLog) {
        const status = failedRecords === 0
            ? client_1.BulkImportStatus.COMPLETED
            : client_1.BulkImportStatus.COMPLETED;
        await this.prisma.bulkImport.update({
            where: { id: bulkImportId },
            data: {
                successfulRecords,
                failedRecords,
                status,
                errorLog: errorLog ? JSON.stringify(errorLog) : undefined,
                completedAt: status === client_1.BulkImportStatus.COMPLETED ? new Date() : undefined,
            },
        });
    }
    async updateBulkImportStatus(bulkImportId, status) {
        await this.prisma.bulkImport.update({
            where: { id: bulkImportId },
            data: { status },
        });
    }
    async sendStudentWelcomeEmail(user, studentData) {
        const password = await this.generateStudentPassword(user.schoolId);
        await this.emailService.sendStudentWelcomeEmail({
            to: studentData.email,
            studentName: studentData.fullName,
            email: studentData.email,
            password,
            schoolName: 'Your School',
        });
    }
    async sendParentWelcomeEmail(user, password) {
        await this.emailService.sendParentWelcomeEmail({
            to: user.email,
            parentName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            password,
        });
    }
    async sendParentInvitationEmail(user, studentData, verificationCode) {
        await this.emailService.sendParentInvitationEmail({
            to: user.email,
            parentName: `${user.firstName} ${user.lastName}`,
            studentName: studentData.fullName,
            verificationCode,
        });
    }
    async getBulkImportProgress(bulkImportId) {
        const bulkImport = await this.prisma.bulkImport.findUnique({
            where: { id: bulkImportId },
        });
        if (!bulkImport) {
            throw new Error('Bulk import not found');
        }
        const progress = bulkImport.totalRecords > 0
            ? Math.round(((bulkImport.successfulRecords + bulkImport.failedRecords) /
                bulkImport.totalRecords) *
                100)
            : 0;
        return {
            id: bulkImport.id,
            status: bulkImport.status,
            totalRecords: bulkImport.totalRecords,
            successfulRecords: bulkImport.successfulRecords,
            failedRecords: bulkImport.failedRecords,
            progress,
            errorLog: bulkImport.errorLog
                ? JSON.parse(bulkImport.errorLog)
                : null,
            createdAt: bulkImport.createdAt,
            completedAt: bulkImport.completedAt,
        };
    }
    async verifyParentCode(email, code) {
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
};
exports.BulkImportService = BulkImportService;
exports.BulkImportService = BulkImportService = BulkImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], BulkImportService);
//# sourceMappingURL=bulk-import.service.js.map