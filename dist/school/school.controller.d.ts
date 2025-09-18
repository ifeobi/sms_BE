import { SchoolService } from './school.service';
export declare class SchoolController {
    private readonly schoolService;
    constructor(schoolService: SchoolService);
    getSchoolProfile(req: any): Promise<{
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
    getSchoolAdminRole(req: any): Promise<{
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
            type: string;
            name: string;
            country: string;
            street: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            formattedAddress: string | null;
            logo: string | null;
        };
    }>;
    getDashboardStats(req: any): Promise<{
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        monthlyRevenue: number;
        attendanceRate: number;
        recentEnrollments: number;
        pendingPayments: number;
    }>;
    getRecentActivity(req: any): Promise<({
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
    getUpcomingEvents(req: any): Promise<{
        id: string;
        title: string;
        date: string;
        description: string;
        type: string;
    }[]>;
    getParentSchools(req: any): Promise<{
        id: any;
        name: any;
        type: any;
        country: any;
        city: any;
        state: any;
        logo: any;
        address: {
            street: any;
            city: any;
            state: any;
            postalCode: any;
            formattedAddress: any;
        };
    }[]>;
}
