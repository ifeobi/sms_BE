export declare enum UserType {
    TEACHER = "TEACHER",
    SCHOOL_ADMIN = "SCHOOL_ADMIN"
}
export declare class CreateStaffDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: UserType;
    role: string;
    department?: string;
    employeeNumber: string;
    subjects?: string[];
    assignedClasses?: string[];
    isActive?: boolean;
    schoolId: string;
}
