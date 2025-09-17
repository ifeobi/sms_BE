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
var StudentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentsService = StudentsService_1 = class StudentsService {
    prisma;
    logger = new common_1.Logger(StudentsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getParentChildren(parentUserId) {
        try {
            const parentRelationships = await this.prisma.parentSchoolRelationship.findMany({
                where: {
                    parentUserId,
                    isActive: true,
                },
                include: {
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            if (parentRelationships.length === 0) {
                return {
                    children: [],
                    total: 0,
                };
            }
            const schoolIds = parentRelationships.map(rel => rel.schoolId);
            const students = await this.prisma.student.findMany({
                where: {
                    schoolId: {
                        in: schoolIds,
                    },
                    status: 'ACTIVE',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            profilePicture: true,
                        },
                    },
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    currentClass: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    currentLevel: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            const children = students.map(student => ({
                id: student.id,
                studentNumber: student.studentNumber,
                name: `${student.user.firstName} ${student.user.lastName}`,
                email: student.user.email,
                phone: student.user.phone,
                avatar: student.user.profilePicture,
                status: student.status,
                currentClass: student.currentClass.name,
                currentLevel: student.currentLevel.name,
                academicYear: student.academicYear,
                enrollmentDate: student.enrollmentDate,
                school: student.school,
            }));
            return {
                children,
                total: children.length,
            };
        }
        catch (error) {
            this.logger.error('Error getting parent children:', error);
            throw new common_1.HttpException('Failed to get parent children', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getParentChildrenGrades(parentUserId, schoolId, termId, academicYear) {
        try {
            const parentChildren = await this.getParentChildren(parentUserId);
            if (parentChildren.children.length === 0) {
                return {
                    students: [],
                    total: 0,
                };
            }
            const studentIds = parentChildren.children.map(child => child.id);
            const whereClause = {
                studentId: {
                    in: studentIds,
                },
                isPublished: true,
            };
            if (schoolId) {
                whereClause.student = {
                    schoolId: schoolId,
                };
            }
            if (termId) {
                whereClause.termId = termId;
            }
            if (academicYear) {
                whereClause.term = {
                    academicYear: academicYear,
                };
            }
            const academicRecords = await this.prisma.academicRecord.findMany({
                where: whereClause,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    profilePicture: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentClass: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentLevel: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    subject: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    term: {
                        select: {
                            id: true,
                            name: true,
                            academicYear: true,
                        },
                    },
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    assignment: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                orderBy: [
                    { studentId: 'asc' },
                    { gradedAt: 'desc' },
                ],
            });
            const studentsMap = new Map();
            academicRecords.forEach(record => {
                const studentId = record.studentId;
                if (!studentsMap.has(studentId)) {
                    studentsMap.set(studentId, {
                        student: {
                            id: record.student.id,
                            studentNumber: record.student.studentNumber,
                            name: `${record.student.user.firstName} ${record.student.user.lastName}`,
                            email: record.student.user.email,
                            phone: record.student.user.phone,
                            avatar: record.student.user.profilePicture,
                            status: record.student.status,
                            currentClass: record.student.currentClass.name,
                            currentLevel: record.student.currentLevel.name,
                            academicYear: record.student.academicYear,
                            enrollmentDate: record.student.enrollmentDate,
                            school: record.student.school,
                        },
                        academicRecords: [],
                        total: 0,
                        averageGpa: 0,
                        overallGrade: '',
                    });
                }
                const studentData = studentsMap.get(studentId);
                studentData.academicRecords.push({
                    id: record.id,
                    subject: record.subject.name,
                    assignment: record.assignment?.title,
                    score: record.score,
                    maxScore: record.maxScore,
                    grade: record.grade,
                    percentage: record.percentage,
                    gpa: record.gpa,
                    comments: record.comments,
                    feedback: record.feedback,
                    gradedAt: record.gradedAt,
                    term: record.term,
                    teacher: {
                        id: record.teacher.id,
                        name: `${record.teacher.user.firstName} ${record.teacher.user.lastName}`,
                    },
                });
                studentData.total++;
            });
            const students = Array.from(studentsMap.values()).map(studentData => {
                if (studentData.academicRecords.length > 0) {
                    const totalGpa = studentData.academicRecords.reduce((sum, record) => sum + record.gpa, 0);
                    studentData.averageGpa = Math.round((totalGpa / studentData.academicRecords.length) * 100) / 100;
                    if (studentData.averageGpa >= 4.0) {
                        studentData.overallGrade = 'A';
                    }
                    else if (studentData.averageGpa >= 3.0) {
                        studentData.overallGrade = 'B';
                    }
                    else if (studentData.averageGpa >= 2.0) {
                        studentData.overallGrade = 'C';
                    }
                    else if (studentData.averageGpa >= 1.0) {
                        studentData.overallGrade = 'D';
                    }
                    else {
                        studentData.overallGrade = 'F';
                    }
                }
                return studentData;
            });
            return {
                students,
                total: students.length,
            };
        }
        catch (error) {
            this.logger.error('Error getting parent children grades:', error);
            throw new common_1.HttpException('Failed to get children grades', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getParentChildrenAttendance(parentUserId, schoolId, startDate, endDate) {
        try {
            const parentChildren = await this.getParentChildren(parentUserId);
            if (parentChildren.children.length === 0) {
                return {
                    students: [],
                    total: 0,
                };
            }
            const studentIds = parentChildren.children.map(child => child.id);
            const whereClause = {
                studentId: {
                    in: studentIds,
                },
            };
            if (schoolId) {
                whereClause.student = {
                    schoolId: schoolId,
                };
            }
            if (startDate) {
                whereClause.date = {
                    gte: new Date(startDate),
                };
            }
            if (endDate) {
                whereClause.date = {
                    ...whereClause.date,
                    lte: new Date(endDate),
                };
            }
            const attendanceRecords = await this.prisma.attendanceRecord.findMany({
                where: whereClause,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    profilePicture: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentClass: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentLevel: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: [
                    { studentId: 'asc' },
                    { date: 'desc' },
                ],
            });
            const studentsMap = new Map();
            attendanceRecords.forEach(record => {
                const studentId = record.studentId;
                if (!studentsMap.has(studentId)) {
                    studentsMap.set(studentId, {
                        student: {
                            id: record.student.id,
                            studentNumber: record.student.studentNumber,
                            name: `${record.student.user.firstName} ${record.student.user.lastName}`,
                            email: record.student.user.email,
                            phone: record.student.user.phone,
                            avatar: record.student.user.profilePicture,
                            status: record.student.status,
                            currentClass: record.student.currentClass.name,
                            currentLevel: record.student.currentLevel.name,
                            academicYear: record.student.academicYear,
                            enrollmentDate: record.student.enrollmentDate,
                            school: record.student.school,
                        },
                        attendanceRecords: [],
                        total: 0,
                        attendancePercentage: 0,
                        presentDays: 0,
                        absentDays: 0,
                        lateDays: 0,
                    });
                }
                const studentData = studentsMap.get(studentId);
                studentData.attendanceRecords.push({
                    id: record.id,
                    date: record.date,
                    status: record.status,
                    checkInTime: null,
                    checkOutTime: null,
                    notes: record.reason,
                    class: record.class,
                    subject: null,
                });
                studentData.total++;
            });
            const students = Array.from(studentsMap.values()).map(studentData => {
                if (studentData.attendanceRecords.length > 0) {
                    const presentDays = studentData.attendanceRecords.filter(record => record.status === 'PRESENT').length;
                    const absentDays = studentData.attendanceRecords.filter(record => record.status === 'ABSENT').length;
                    const lateDays = studentData.attendanceRecords.filter(record => record.status === 'LATE').length;
                    studentData.presentDays = presentDays;
                    studentData.absentDays = absentDays;
                    studentData.lateDays = lateDays;
                    studentData.attendancePercentage = Math.round((presentDays / studentData.total) * 100);
                }
                return studentData;
            });
            return {
                students,
                total: students.length,
            };
        }
        catch (error) {
            this.logger.error('Error getting parent children attendance:', error);
            throw new common_1.HttpException('Failed to get children attendance', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStudentAcademicRecords(parentUserId, studentId, termId, subjectId) {
        try {
            const parentChildren = await this.getParentChildren(parentUserId);
            const hasAccess = parentChildren.children.some(child => child.id === studentId);
            if (!hasAccess) {
                throw new common_1.HttpException('Access denied - not authorized to view this student', common_1.HttpStatus.FORBIDDEN);
            }
            const whereClause = {
                studentId: studentId,
                isPublished: true,
            };
            if (termId) {
                whereClause.termId = termId;
            }
            if (subjectId) {
                whereClause.subjectId = subjectId;
            }
            const academicRecords = await this.prisma.academicRecord.findMany({
                where: whereClause,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    profilePicture: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentClass: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentLevel: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    subject: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    term: {
                        select: {
                            id: true,
                            name: true,
                            academicYear: true,
                        },
                    },
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    assignment: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                orderBy: { gradedAt: 'desc' },
            });
            if (academicRecords.length === 0) {
                throw new common_1.HttpException('No academic records found for this student', common_1.HttpStatus.NOT_FOUND);
            }
            const student = academicRecords[0].student;
            const studentData = {
                id: student.id,
                studentNumber: student.studentNumber,
                name: `${student.user.firstName} ${student.user.lastName}`,
                email: student.user.email,
                phone: student.user.phone,
                avatar: student.user.profilePicture,
                status: student.status,
                currentClass: student.currentClass.name,
                currentLevel: student.currentLevel.name,
                academicYear: student.academicYear,
                enrollmentDate: student.enrollmentDate,
                school: student.school,
            };
            const records = academicRecords.map(record => ({
                id: record.id,
                subject: record.subject.name,
                assignment: record.assignment?.title,
                score: record.score,
                maxScore: record.maxScore,
                grade: record.grade,
                percentage: record.percentage,
                gpa: record.gpa,
                comments: record.comments,
                feedback: record.feedback,
                gradedAt: record.gradedAt,
                term: record.term,
                teacher: {
                    id: record.teacher.id,
                    name: `${record.teacher.user.firstName} ${record.teacher.user.lastName}`,
                },
            }));
            const totalGpa = records.reduce((sum, record) => sum + record.gpa, 0);
            const averageGpa = Math.round((totalGpa / records.length) * 100) / 100;
            let overallGrade = 'F';
            if (averageGpa >= 4.0) {
                overallGrade = 'A';
            }
            else if (averageGpa >= 3.0) {
                overallGrade = 'B';
            }
            else if (averageGpa >= 2.0) {
                overallGrade = 'C';
            }
            else if (averageGpa >= 1.0) {
                overallGrade = 'D';
            }
            return {
                student: studentData,
                academicRecords: records,
                total: records.length,
                averageGpa,
                overallGrade,
            };
        }
        catch (error) {
            this.logger.error('Error getting student academic records:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to get student academic records', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStudentAttendance(parentUserId, studentId, startDate, endDate) {
        try {
            const parentChildren = await this.getParentChildren(parentUserId);
            const hasAccess = parentChildren.children.some(child => child.id === studentId);
            if (!hasAccess) {
                throw new common_1.HttpException('Access denied - not authorized to view this student', common_1.HttpStatus.FORBIDDEN);
            }
            const whereClause = {
                studentId: studentId,
            };
            if (startDate) {
                whereClause.date = {
                    gte: new Date(startDate),
                };
            }
            if (endDate) {
                whereClause.date = {
                    ...whereClause.date,
                    lte: new Date(endDate),
                };
            }
            const attendanceRecords = await this.prisma.attendanceRecord.findMany({
                where: whereClause,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    profilePicture: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentClass: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            currentLevel: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
            });
            if (attendanceRecords.length === 0) {
                throw new common_1.HttpException('No attendance records found for this student', common_1.HttpStatus.NOT_FOUND);
            }
            const student = attendanceRecords[0].student;
            const studentData = {
                id: student.id,
                studentNumber: student.studentNumber,
                name: `${student.user.firstName} ${student.user.lastName}`,
                email: student.user.email,
                phone: student.user.phone,
                avatar: student.user.profilePicture,
                status: student.status,
                currentClass: student.currentClass.name,
                currentLevel: student.currentLevel.name,
                academicYear: student.academicYear,
                enrollmentDate: student.enrollmentDate,
                school: student.school,
            };
            const records = attendanceRecords.map(record => ({
                id: record.id,
                date: record.date,
                status: record.status,
                checkInTime: null,
                checkOutTime: null,
                notes: record.reason,
                class: record.class,
                subject: null,
            }));
            const presentDays = records.filter(record => record.status === 'PRESENT').length;
            const absentDays = records.filter(record => record.status === 'ABSENT').length;
            const lateDays = records.filter(record => record.status === 'LATE').length;
            const attendancePercentage = Math.round((presentDays / records.length) * 100);
            return {
                student: studentData,
                attendanceRecords: records,
                total: records.length,
                attendancePercentage,
                presentDays,
                absentDays,
                lateDays,
            };
        }
        catch (error) {
            this.logger.error('Error getting student attendance:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to get student attendance', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = StudentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map