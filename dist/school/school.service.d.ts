import { PrismaService } from '../prisma/prisma.service';
export declare class SchoolService {
    private prisma;
    constructor(prisma: PrismaService);
    getSchoolAdminRole(userId: string): Promise<{
        role: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
        };
        school: {
            id: string;
            name: string;
            type: string;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            formattedAddress: string | null;
            logo: string | null;
        };
    }>;
    getDashboardStats(userId: string): Promise<{
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        monthlyRevenue: number;
        attendanceRate: number;
        recentEnrollments: number;
        pendingPayments: number;
    }>;
    getSchoolProfile(userId: string): Promise<{
        id: string;
        name: string;
        type: string;
        country: string;
        address: {
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            formattedAddress: string | null;
        };
        logo: string | null;
    }>;
    getRecentActivity(userId: string): Promise<({
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: string;
        severity: "info";
    } | {
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: string;
        severity: "success";
    } | {
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: string;
        severity: "warning";
    })[]>;
    getUpcomingEvents(userId: string): Promise<{
        id: string;
        title: string;
        date: string;
        description: string;
        type: string;
    }[]>;
}
