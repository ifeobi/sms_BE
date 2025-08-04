export declare enum UserType {
    PARENT = "PARENT",
    STUDENT = "STUDENT",
    SCHOOL_ADMIN = "SCHOOL_ADMIN",
    TEACHER = "TEACHER",
    CREATOR = "CREATOR"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    type: UserType;
    phone?: string;
    profilePicture?: string;
}
