import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaService) {}

  async getSchoolAdminRole(userId: string) {
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
            // type field removed - using academic config instead
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
      throw new NotFoundException('School admin not found');
    }

    return {
      role: schoolAdmin.role,
      user: schoolAdmin.user,
      school: schoolAdmin.school,
    };
  }

  async getDashboardStats(userId: string) {
    // Get school admin to find school ID
    const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
      where: { userId },
      select: { schoolId: true },
    });

    if (!schoolAdmin) {
      throw new NotFoundException('School admin not found');
    }

    const schoolId = schoolAdmin.schoolId;

    // Get counts
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

    // Calculate attendance rate (mock for now)
    const attendanceRate = 94.2;

    // Calculate monthly revenue (mock for now)
    const monthlyRevenue = 2400000;

    // Get recent enrollments (last 30 days)
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

    // Get pending payments (mock for now)
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

  async getSchoolProfile(userId: string) {
    const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
      where: { userId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            // type field removed - using academic config instead
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
      throw new NotFoundException('School admin not found');
    }

    return {
      id: schoolAdmin.school.id,
      name: schoolAdmin.school.name,
      // type field removed - using academic config instead
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

  async getRecentActivity(userId: string) {
    const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
      where: { userId },
      select: { schoolId: true },
    });

    if (!schoolAdmin) {
      throw new NotFoundException('School admin not found');
    }

    const schoolId = schoolAdmin.schoolId;

    // Get recent student enrollments
    const recentEnrollments = await this.prisma.student.count({
      where: {
        schoolId,
        enrollmentDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    // Mock activity data for now
    const activities = [
      {
        id: '1',
        type: 'enrollment',
        title: `${recentEnrollments} new student enrollments this week`,
        description: 'New students joined various classes',
        timestamp: new Date().toISOString(),
        severity: 'info' as const,
      },
      {
        id: '2',
        type: 'payment',
        title: '₦450,000 in fee payments received today',
        description: 'Multiple parents made payments',
        timestamp: new Date().toISOString(),
        severity: 'success' as const,
      },
      {
        id: '3',
        type: 'documentation',
        title: '3 staff members have pending documentation',
        description: 'Required documents need to be submitted',
        timestamp: new Date().toISOString(),
        severity: 'warning' as const,
      },
    ];

    return activities;
  }

  async getUpcomingEvents(userId: string) {
    // Mock events for now - in real app, you'd have an events table
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
}
