export declare enum UserType {
    PARENT = "PARENT",
    STUDENT = "STUDENT",
    SCHOOL_ADMIN = "SCHOOL_ADMIN",
    TEACHER = "TEACHER",
    CREATOR = "CREATOR"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare enum SchoolType {
    ELEMENTARY = "ELEMENTARY",
    SECONDARY = "SECONDARY",
    TERTIARY = "TERTIARY"
}
export declare class AddressDto {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    landmark?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    role: string;
    userType: UserType;
    schoolName: string;
    phone: string;
    website?: string;
    country: string;
    schoolTypes: string[];
    addresses: AddressDto[];
    profilePicture?: string;
    confirmPassword?: string;
}
