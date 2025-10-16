import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SchoolAdminRegisterDto } from './dto/school-admin-register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserType } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    userType?: string,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(email, userType);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.userType,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      type: user.type.toLowerCase(), // Store lowercase in JWT for consistency
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        type: user.type.toLowerCase(), // Return lowercase for frontend consistency
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
    };
  }

  async register(registerDto: RegisterDto | SchoolAdminRegisterDto) {
    console.log('=== REGISTRATION DEBUG ===');
    console.log(
      'Received registration data:',
      JSON.stringify(registerDto, null, 2),
    );
    console.log('Data type:', typeof registerDto);
    console.log('Data keys:', Object.keys(registerDto));
    console.log('================================');

    try {
      // Check if user already exists for this user type
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
        registerDto.userType,
      );

      if (existingUser) {
        throw new ConflictException(
          'User with this email already exists for this account type',
        );
      }

      console.log('✅ User does not exist, proceeding with registration');

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      console.log('✅ Password hashed successfully');

      // Handle school registration
      if (registerDto.userType === UserType.SCHOOL_ADMIN) {
        return await this.registerSchoolAdmin(
          registerDto as SchoolAdminRegisterDto,
          hashedPassword,
        );
      }

      // Handle creator registration
      if (registerDto.userType === UserType.CREATOR) {
        return await this.registerCreator(registerDto, hashedPassword);
      }

      // Handle other user types (existing logic)
      const userData = {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        type: registerDto.userType,
        phone: registerDto.phone,
        profilePicture: registerDto.profilePicture,
      };

      console.log('User data to create:', JSON.stringify(userData, null, 2));

      // Create user
      const user = await this.usersService.create(userData);
      console.log('✅ User created successfully:', user.id);

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
    } catch (error) {
      throw error;
    }
  }

  private async registerSchoolAdmin(
    registerDto: SchoolAdminRegisterDto,
    hashedPassword: string,
  ) {
    console.log('=== SCHOOL ADMIN REGISTRATION ===');

    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Create the user
      const userData = {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        type: UserType.SCHOOL_ADMIN,
        phone: registerDto.phone,
        profilePicture: registerDto.profilePicture,
      };

      console.log(
        'Creating user with data:',
        JSON.stringify(userData, null, 2),
      );
      const user = await prisma.user.create({
        data: userData,
      });
      console.log('✅ User created:', user.id);

      // 2. Create the school
      const primaryAddress = registerDto.addresses[0];

      const schoolData = {
        name: registerDto.schoolName,
        type: registerDto.schoolTypes[0], // Use the frontend value directly
        country: registerDto.country,
        street: primaryAddress.street,
        city: primaryAddress.city,
        state: primaryAddress.state,
        postalCode: primaryAddress.postalCode,
        landmark: primaryAddress.landmark,
        logo: registerDto.profilePicture,
      };

      console.log(
        'Creating school with data:',
        JSON.stringify(schoolData, null, 2),
      );
      const school = await prisma.school.create({
        data: schoolData,
      });
      console.log('✅ School created:', school.id);

      // 3. Create the school admin relationship
      const schoolAdminData = {
        userId: user.id,
        schoolId: school.id,
        role: registerDto.role, // principal, vice_principal, admin, etc.
      };

      console.log('=== ROLE MAPPING ===');
      console.log('User Type (for database):', registerDto.userType); // SCHOOL_ADMIN
      console.log('User Role (for SchoolAdmin):', registerDto.role); // principal
      console.log(
        'School Admin Data:',
        JSON.stringify(schoolAdminData, null, 2),
      );
      console.log('================================');

      const schoolAdmin = await prisma.schoolAdmin.create({
        data: schoolAdminData,
      });
      console.log('✅ School admin created:', schoolAdmin.id);

      const payload = {
        email: user.email,
        sub: user.id,
        type: user.type.toLowerCase(), // Store lowercase in JWT for consistency
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
          type: user.type.toLowerCase(), // Return lowercase for frontend consistency
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

  private async registerCreator(
    registerDto: RegisterDto,
    hashedPassword: string,
  ) {
    console.log('=== CREATOR REGISTRATION ===');

    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (prisma) => {
      // Create the creator user (inactive until email verification)
      const userData = {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        type: UserType.CREATOR,
        phone: registerDto.phone,
        website: registerDto.website,
        bio: registerDto.bio,
        country: registerDto.country,
        profilePicture: registerDto.profilePicture,
        isActive: false, // Inactive until email verification
        isEmailVerified: false,
      };

      console.log(
        'Creating creator user with data:',
        JSON.stringify(userData, null, 2),
      );
      const user = await prisma.user.create({
        data: userData,
      });
      console.log('✅ Creator user created:', user.id);

      // Create creator profile with categories and plan
      const creatorData = {
        userId: user.id,
        categories: registerDto.categories || [],
        plan: registerDto.plan || 'free',
      };

      console.log(
        'Creating creator profile with data:',
        JSON.stringify(creatorData, null, 2),
      );
      const creator = await prisma.creator.create({
        data: creatorData,
      });
      console.log('✅ Creator profile created:', creator.id);

      // Generate verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code
      await prisma.verificationCode.create({
        data: {
          email: user.email,
          code: verificationCode,
          type: 'EMAIL_VERIFICATION',
          expiresAt,
        },
      });

      // Send verification email
      const emailSent = await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        `${user.firstName} ${user.lastName}`,
        'CREATOR',
      );

      if (!emailSent) {
        throw new Error('Failed to send verification email');
      }

      console.log(
        '✅ Creator registration completed - verification email sent',
      );
      console.log('================================');

      return {
        success: true,
        message:
          'Creator account created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        requiresEmailVerification: true,
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
      type: UserType.MASTER,
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
        type: masterUser.type.toLowerCase(), // Return lowercase for frontend consistency
        firstName: masterUser.firstName,
        lastName: masterUser.lastName,
      },
    };
  }

  async sendVerificationEmail(
    email: string,
    userType: string,
    userName?: string,
  ) {
    try {
      console.log('=== SEND VERIFICATION EMAIL ===');
      console.log('Email:', email);
      console.log('UserType:', userType);
      console.log('UserName:', userName);

      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // For creator verification, store the code in database
      if (userType === 'CREATOR') {
        // Check if user exists and is a creator
        const user = await this.prisma.user.findFirst({
          where: {
            email,
            type: UserType.CREATOR,
          },
        });

        if (!user) {
          throw new Error('Creator account not found');
        }

        // Delete any existing verification codes for this email
        await this.prisma.verificationCode.deleteMany({
          where: {
            email,
            type: 'EMAIL_VERIFICATION',
          },
        });

        // Store the new verification code
        await this.prisma.verificationCode.create({
          data: {
            email,
            code,
            type: 'EMAIL_VERIFICATION',
            expiresAt,
          },
        });

        console.log('✅ Verification code stored in database');
      }

      // Send the verification email
      const emailSent = await this.emailService.sendVerificationEmail(
        email,
        code,
        userName || 'User',
        userType,
      );

      if (emailSent) {
        console.log(`✅ Verification email sent to ${email}: ${code}`);
        console.log('================================');

        return {
          success: true,
          message: 'Verification email sent successfully',
          email,
          userType,
        };
      } else {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('❌ Email sending error:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async verifyEmail(email: string, code: string) {
    // For now, accept any 6-digit code for development
    // In production, this would validate against stored codes
    if (code.length === 6 && /^\d+$/.test(code)) {
      return {
        success: true,
        message: 'Email verified successfully',
        email,
      };
    } else {
      throw new UnauthorizedException('Invalid verification code');
    }
  }

  async verifyCreatorEmail(email: string, code: string) {
    try {
      console.log('=== CREATOR EMAIL VERIFICATION ===');
      console.log('Email:', email);
      console.log('Code:', code);

      // Find the verification code
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
        throw new UnauthorizedException('Invalid or expired verification code');
      }

      // Find the user
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          type: UserType.CREATOR,
        },
        include: {
          creator: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Activate the user and mark email as verified
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          // isEmailVerified: true, // TODO: Fix Prisma client generation
        },
      });

      // Mark verification code as used
      await this.prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { usedAt: new Date() },
      });

      console.log('✅ Creator email verified and account activated');

      // Generate JWT token
      const payload = {
        email: user.email,
        sub: user.id,
        type: user.type.toLowerCase(),
        firstName: user.firstName,
        lastName: user.lastName,
      };

      return {
        success: true,
        message:
          'Email verified successfully. Your creator account is now active.',
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          type: user.type.toLowerCase(),
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
        creator: {
          id: user.creator?.id,
          categories: user.creator?.categories,
          plan: user.creator?.plan,
        },
      };
    } catch (error) {
      console.error('❌ Creator email verification failed:', error);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      console.log('=== FORGOT PASSWORD DEBUG ===');
      console.log('Request data:', JSON.stringify(forgotPasswordDto, null, 2));

      // Check if user exists
      const user = await this.usersService.findByEmail(
        forgotPasswordDto.email,
        forgotPasswordDto.userType,
      );

      if (!user) {
        console.log('❌ User not found:', forgotPasswordDto.email);
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message:
            'If an account with this email exists, a password reset link has been sent.',
        };
      }

      console.log('✅ User found:', user.id);

      // Generate a secure reset token
      const resetToken = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the reset token in database
      await this.prisma.passwordReset.create({
        data: {
          email: forgotPasswordDto.email,
          token: resetToken,
          userType: forgotPasswordDto.userType as UserType,
          expiresAt,
        },
      });

      console.log('✅ Reset token stored in database');

      // Send password reset email
      const emailSent = await this.emailService.sendPasswordResetEmail(
        forgotPasswordDto.email,
        resetToken,
        `${user.firstName} ${user.lastName}`,
        forgotPasswordDto.userType,
      );

      if (emailSent) {
        console.log('✅ Password reset email sent successfully');
        return {
          success: true,
          message:
            'If an account with this email exists, a password reset link has been sent.',
        };
      } else {
        throw new Error('Failed to send password reset email');
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw new Error('Failed to process password reset request');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      console.log('=== RESET PASSWORD DEBUG ===');
      console.log('Token:', resetPasswordDto.token);

      // Validate passwords match
      if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Find the reset token
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

      // Find the user
      const user = await this.usersService.findByEmail(
        passwordReset.email,
        passwordReset.userType,
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        10,
      );

      // Update user password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Mark reset token as used
      await this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      });

      console.log('✅ Password reset completed successfully');

      return {
        success: true,
        message:
          'Password reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  private generateResetToken(): string {
    // Generate a secure random token
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getSchoolAdminProfile(userId: string) {
    return this.prisma.schoolAdmin.findUnique({
      where: { userId },
      select: {
        role: true,
        schoolId: true,
        isActive: true,
      },
    });
  }

  async getUserProfile(user: any) {
    // Fetch complete user data from database
    const completeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        creator: true, // Include creator-specific data
      },
    });

    if (!completeUser) {
      throw new Error('User not found');
    }

    // Get basic user data with lowercase type for frontend consistency
    const userData = {
      id: completeUser.id,
      email: completeUser.email,
      type: completeUser.type.toLowerCase(),
      firstName: completeUser.firstName,
      lastName: completeUser.lastName,
      phone: completeUser.phone,
      website: completeUser.website,
      bio: completeUser.bio,
      country: completeUser.country,
      profilePicture: completeUser.profilePicture,
      isActive: completeUser.isActive,
      isEmailVerified: completeUser.isEmailVerified,
      createdAt: completeUser.createdAt,
      updatedAt: completeUser.updatedAt,
    };

    // If user is a school admin, fetch the role information
    if (completeUser.type === 'SCHOOL_ADMIN') {
      const schoolAdmin = await this.getSchoolAdminProfile(completeUser.id);

      if (schoolAdmin) {
        return {
          ...userData,
          role: schoolAdmin.role,
        };
      }
    }

    // If user is a creator, include creator-specific data
    if (completeUser.type === 'CREATOR' && completeUser.creator) {
      return {
        ...userData,
        categories: completeUser.creator.categories,
        plan: completeUser.creator.plan,
        verified: completeUser.creator.verified,
        rating: completeUser.creator.rating,
        totalProducts: completeUser.creator.totalProducts,
        totalSales: completeUser.creator.totalSales,
        totalRevenue: completeUser.creator.totalRevenue,
        joinDate: completeUser.creator.joinDate,
        specialties: completeUser.creator.specialties,
      };
    }

    return userData;
  }

  async updateProfile(user: any, updateDto: UpdateProfileDto) {
    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (prisma) => {
      // Prepare user data for update
      const userUpdateData: any = {};

      if (updateDto.firstName !== undefined)
        userUpdateData.firstName = updateDto.firstName;
      if (updateDto.lastName !== undefined)
        userUpdateData.lastName = updateDto.lastName;
      if (updateDto.email !== undefined) userUpdateData.email = updateDto.email;
      if (updateDto.phone !== undefined) userUpdateData.phone = updateDto.phone;
      if (updateDto.website !== undefined)
        userUpdateData.website = updateDto.website;
      if (updateDto.country !== undefined)
        userUpdateData.country = updateDto.country;
      if (updateDto.bio !== undefined) userUpdateData.bio = updateDto.bio;
      if (updateDto.profilePicture !== undefined)
        userUpdateData.profilePicture = updateDto.profilePicture;

      // Update user data if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });
      }

      // Handle creator-specific updates
      if (user.type === 'CREATOR') {
        const creatorUpdateData: any = {};

        if (updateDto.categories !== undefined)
          creatorUpdateData.categories = updateDto.categories;
        if (updateDto.plan !== undefined)
          creatorUpdateData.plan = updateDto.plan;

        // Update creator data if there are changes
        if (Object.keys(creatorUpdateData).length > 0) {
          await prisma.creator.update({
            where: { userId: user.id },
            data: creatorUpdateData,
          });
        }
      }

      // Return updated user profile
      return this.getUserProfile(user);
    });
  }
}
