export declare enum UserType {
    PARENT = "PARENT",
    STUDENT = "STUDENT",
    SCHOOL_ADMIN = "SCHOOL_ADMIN",
    TEACHER = "TEACHER",
    CREATOR = "CREATOR",
    MASTER = "MASTER"
}
export declare class CreateUserDto {
    email: string;
    password: string;
    type: UserType;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    phone?: string;
    isActive?: boolean;
}
