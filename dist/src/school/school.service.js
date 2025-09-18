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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchoolService = class SchoolService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSchoolAdminRole(userId) {
        const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
                school: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        street: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        formattedAddress: true,
                        logo: true,
                    },
                },
            },
        });
        if (!schoolAdmin) {
            throw new common_1.NotFoundException('School admin not found');
        }
        return {
            role: schoolAdmin.role,
            user: schoolAdmin.user,
            school: schoolAdmin.school,
        };
    }
    async getDashboardStats(userId) {
        const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
            where: { userId },
            select: { schoolId: true },
        });
        if (!schoolAdmin) {
            throw new common_1.NotFoundException('School admin not found');
        }
        const schoolId = schoolAdmin.schoolId;
        const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
            this.prisma.student.count({
                where: { schoolId, status: 'ACTIVE' },
            }),
            this.prisma.teacher.count({
                where: { schoolId, isActive: true },
            }),
            this.prisma.class.count({
                where: { schoolId, isActive: true },
            }),
        ]);
        const attendanceRate = 94.2;
        const monthlyRevenue = 2400000;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEnrollments = await this.prisma.student.count({
            where: {
                schoolId,
                enrollmentDate: {
                    gte: thirtyDaysAgo,
                },
            },
        });
        const pendingPayments = 8;
        return {
            totalStudents,
            totalTeachers,
            totalClasses,
            monthlyRevenue,
            attendanceRate,
            recentEnrollments,
            pendingPayments,
        };
    }
    async getSchoolProfile(userId) {
        const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
            where: { userId },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        street: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        formattedAddress: true,
                        logo: true,
                    },
                },
            },
        });
        if (!schoolAdmin) {
            throw new common_1.NotFoundException('School admin not found');
        }
        return {
            id: schoolAdmin.school.id,
            name: schoolAdmin.school.name,
            country: schoolAdmin.school.country,
            address: {
                street: schoolAdmin.school.street,
                city: schoolAdmin.school.city,
                state: schoolAdmin.school.state,
                postalCode: schoolAdmin.school.postalCode,
                formattedAddress: schoolAdmin.school.formattedAddress,
            },
            logo: schoolAdmin.school.logo,
        };
    }
    async getRecentActivity(userId) {
        const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
            where: { userId },
            select: { schoolId: true },
        });
        if (!schoolAdmin) {
            throw new common_1.NotFoundException('School admin not found');
        }
        const schoolId = schoolAdmin.schoolId;
        const recentEnrollments = await this.prisma.student.count({
            where: {
                schoolId,
                enrollmentDate: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        });
        const activities = [
            {
                id: '1',
                type: 'enrollment',
                title: `${recentEnrollments} new student enrollments this week`,
                description: 'New students joined various classes',
                timestamp: new Date().toISOString(),
                severity: 'info',
            },
            {
                id: '2',
                type: 'payment',
                title: '₦450,000 in fee payments received today',
                description: 'Multiple parents made payments',
                timestamp: new Date().toISOString(),
                severity: 'success',
            },
            {
                id: '3',
                type: 'documentation',
                title: '3 staff members have pending documentation',
                description: 'Required documents need to be submitted',
                timestamp: new Date().toISOString(),
                severity: 'warning',
            },
        ];
        return activities;
    }
    async getUpcomingEvents(userId) {
        const events = [
            {
                id: '1',
                title: 'Parent-Teacher Conference',
                date: '2024-03-15T09:00:00Z',
                description: 'Annual parent-teacher conference',
                type: 'meeting',
            },
            {
                id: '2',
                title: 'Mid-Term Examinations',
                date: '2024-03-20T08:00:00Z',
                description: 'Mid-term exams for all classes',
                type: 'exam',
            },
            {
                id: '3',
                title: 'Staff Meeting',
                date: '2024-03-12T14:00:00Z',
                description: 'Monthly staff meeting',
                type: 'meeting',
            },
        ];
        return events;
    }
};
exports.SchoolService = SchoolService;
exports.SchoolService = SchoolService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolService);
//# sourceMappingURL=school.service.js.map