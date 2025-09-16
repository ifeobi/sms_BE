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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const email_service_1 = require("../email/email.service");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let AuthService = class AuthService {
    usersService;
    jwtService;
    emailService;
    prisma;
    constructor(usersService, jwtService, emailService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.prisma = prisma;
    }
    async validateUser(email, password, userType) {
        const user = await this.usersService.findByEmail(email, userType);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password, loginDto.userType);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            email: user.email,
            sub: user.id,
            type: user.type.toLowerCase(),
            firstName: user.firstName,
            lastName: user.lastName,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                type: user.type.toLowerCase(),
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
            },
        };
    }
    async register(registerDto) {
        console.log('=== REGISTRATION DEBUG ===');
        console.log('Received registration data:', JSON.stringify(registerDto, null, 2));
        console.log('Data type:', typeof registerDto);
        console.log('Data keys:', Object.keys(registerDto));
        console.log('================================');
        try {
            const existingUser = await this.usersService.findByEmail(registerDto.email, registerDto.userType);
            if (existingUser) {
                console.log('❌ User already exists for this type:', registerDto.email, registerDto.userType);
                throw new common_1.ConflictException('User with this email already exists for this account type');
            }
            console.log('✅ User does not exist, proceeding with registration');
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            console.log('✅ Password hashed successfully');
            if (registerDto.userType === create_user_dto_1.UserType.SCHOOL_ADMIN) {
                return await this.registerSchoolAdmin(registerDto, hashedPassword);
            }
            const userData = {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                type: registerDto.userType,
                phone: registerDto.phone || undefined,
                profilePicture: registerDto.profilePicture || undefined,
            };
            console.log('User data to create:', JSON.stringify(userData, null, 2));
            const user = await this.usersService.create(userData);
            console.log('✅ User created successfully:', user.id);
            if (registerDto.userType === create_user_dto_1.UserType.PARENT) {
                await this.prisma.parent.create({
                    data: {
                        userId: user.id,
                        isActive: true,
                    },
                });
                console.log('✅ Parent record created');
            }
            const payload = {
                email: user.email,
                sub: user.id,
                type: user.type,
                firstName: user.firstName,
                lastName: user.lastName,
            };
            console.log('✅ Registration completed successfully');
            console.log('================================');
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    type: user.type,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.profilePicture,
                },
            };
        }
        catch (error) {
            console.error('❌ Registration failed:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.log('================================');
            throw error;
        }
    }
    async registerSchoolAdmin(registerDto, hashedPassword) {
        console.log('=== SCHOOL ADMIN REGISTRATION ===');
        return await this.prisma.$transaction(async (prisma) => {
            const userData = {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                type: create_user_dto_1.UserType.SCHOOL_ADMIN,
                phone: registerDto.phone,
                profilePicture: registerDto.profilePicture,
            };
            console.log('Creating user with data:', JSON.stringify(userData, null, 2));
            const user = await prisma.user.create({
                data: userData,
            });
            console.log('✅ User created:', user.id);
            const primaryAddress = registerDto.addresses?.[0];
            const schoolData = {
                name: registerDto.schoolName || 'Unnamed School',
                type: registerDto.schoolTypes?.[0] || 'ELEMENTARY',
                country: registerDto.country || 'NG',
                street: primaryAddress?.street || '',
                city: primaryAddress?.city || '',
                state: primaryAddress?.state || '',
                postalCode: primaryAddress?.postalCode || undefined,
                landmark: primaryAddress?.landmark || undefined,
                logo: registerDto.profilePicture || undefined,
            };
            console.log('Creating school with data:', JSON.stringify(schoolData, null, 2));
            const school = await prisma.school.create({
                data: schoolData,
            });
            console.log('✅ School created:', school.id);
            const schoolAdminData = {
                userId: user.id,
                schoolId: school.id,
                role: registerDto.role || 'admin',
            };
            console.log('=== ROLE MAPPING ===');
            console.log('User Type (for database):', registerDto.userType);
            console.log('User Role (for SchoolAdmin):', registerDto.role);
            console.log('School Admin Data:', JSON.stringify(schoolAdminData, null, 2));
            console.log('================================');
            const schoolAdmin = await prisma.schoolAdmin.create({
                data: schoolAdminData,
            });
            console.log('✅ School admin created:', schoolAdmin.id);
            const payload = {
                email: user.email,
                sub: user.id,
                type: user.type.toLowerCase(),
                firstName: user.firstName,
                lastName: user.lastName,
            };
            console.log('✅ School admin registration completed successfully');
            console.log('================================');
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    type: user.type.toLowerCase(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.profilePicture,
                },
                school: {
                    id: school.id,
                    name: school.name,
                    type: school.type,
                },
            };
        });
    }
    async createMasterAccount() {
        const masterEmail = 'master@sms.com';
        const existingMaster = await this.usersService.findByEmail(masterEmail);
        if (existingMaster) {
            return { message: 'Master account already exists' };
        }
        const hashedPassword = await bcrypt.hash('master123', 10);
        const masterUser = await this.usersService.create({
            email: masterEmail,
            password: hashedPassword,
            firstName: 'Master',
            lastName: 'Admin',
            type: create_user_dto_1.UserType.MASTER,
            isActive: true,
        });
        return {
            message: 'Master account created successfully',
            credentials: {
                email: masterEmail,
                password: 'master123',
            },
            user: {
                id: masterUser.id,
                email: masterUser.email,
                type: masterUser.type.toLowerCase(),
                firstName: masterUser.firstName,
                lastName: masterUser.lastName,
            },
        };
    }
    async sendVerificationEmail(email, userType, userName) {
        try {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await this.prisma.verificationCode.create({
                data: {
                    email,
                    code,
                    type: 'EMAIL_VERIFICATION',
                    expiresAt,
                },
            });
            const emailSent = await this.emailService.sendVerificationEmail(email, code, userName || 'User', userType);
            if (emailSent) {
                console.log(`✅ Verification email sent to ${email}`);
                return {
                    success: true,
                    message: 'Verification email sent successfully',
                    email,
                    userType,
                };
            }
            else {
                throw new Error('Failed to send verification email');
            }
        }
        catch (error) {
            console.error('❌ Email sending error:', error);
            throw new Error('Failed to send verification email');
        }
    }
    async verifyEmail(email, code) {
        try {
            const verificationCode = await this.prisma.verificationCode.findFirst({
                where: {
                    email,
                    code,
                    type: 'EMAIL_VERIFICATION',
                    usedAt: null,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!verificationCode) {
                throw new common_1.UnauthorizedException('Invalid or expired verification code');
            }
            await this.prisma.verificationCode.update({
                where: { id: verificationCode.id },
                data: { usedAt: new Date() },
            });
            console.log(`✅ Email verified successfully for ${email}`);
            return {
                success: true,
                message: 'Email verified successfully',
                email,
            };
        }
        catch (error) {
            console.error('❌ Email verification error:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Failed to verify email');
        }
    }
    async forgotPassword(forgotPasswordDto) {
        try {
            console.log('=== FORGOT PASSWORD DEBUG ===');
            console.log('Request data:', JSON.stringify(forgotPasswordDto, null, 2));
            const user = await this.usersService.findByEmail(forgotPasswordDto.email, forgotPasswordDto.userType);
            if (!user) {
                console.log('❌ User not found:', forgotPasswordDto.email);
                return {
                    success: true,
                    message: 'If an account with this email exists, a password reset link has been sent.',
                };
            }
            console.log('✅ User found:', user.id);
            const resetToken = this.generateResetToken();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await this.prisma.passwordReset.create({
                data: {
                    email: forgotPasswordDto.email,
                    token: resetToken,
                    userType: forgotPasswordDto.userType,
                    expiresAt,
                },
            });
            console.log('✅ Reset token stored in database');
            const emailSent = await this.emailService.sendPasswordResetEmail(forgotPasswordDto.email, resetToken, `${user.firstName} ${user.lastName}`, forgotPasswordDto.userType);
            if (emailSent) {
                console.log('✅ Password reset email sent successfully');
                return {
                    success: true,
                    message: 'If an account with this email exists, a password reset link has been sent.',
                };
            }
            else {
                throw new Error('Failed to send password reset email');
            }
        }
        catch (error) {
            console.error('❌ Forgot password error:', error);
            throw new Error('Failed to process password reset request');
        }
    }
    async resetPassword(resetPasswordDto) {
        try {
            console.log('=== RESET PASSWORD DEBUG ===');
            console.log('Token:', resetPasswordDto.token);
            if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            const passwordReset = await this.prisma.passwordReset.findFirst({
                where: {
                    token: resetPasswordDto.token,
                    used: false,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!passwordReset) {
                throw new Error('Invalid or expired reset token');
            }
            console.log('✅ Valid reset token found');
            const user = await this.usersService.findByEmail(passwordReset.email, passwordReset.userType);
            if (!user) {
                throw new Error('User not found');
            }
            const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            await this.prisma.passwordReset.update({
                where: { id: passwordReset.id },
                data: { used: true },
            });
            console.log('✅ Password reset completed successfully');
            return {
                success: true,
                message: 'Password reset successfully. You can now login with your new password.',
            };
        }
        catch (error) {
            console.error('❌ Reset password error:', error);
            throw new Error(error.message || 'Failed to reset password');
        }
    }
    generateResetToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async getSchoolAdminProfile(userId) {
        return this.prisma.schoolAdmin.findUnique({
            where: { userId },
            select: {
                role: true,
                schoolId: true,
                isActive: true,
            },
        });
    }
    async getUserProfile(user) {
        const userData = {
            ...user,
            type: user.type.toLowerCase(),
        };
        if (user.type === 'school_admin') {
            const schoolAdmin = await this.getSchoolAdminProfile(user.id);
            if (schoolAdmin) {
                return {
                    ...userData,
                    role: schoolAdmin.role,
                };
            }
        }
        return userData;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map