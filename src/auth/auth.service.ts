import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AcademicStructureService } from '../academic-structure/academic-structure.service';
import { ImageKitService } from '../imagekit/imagekit.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserType } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private prisma: PrismaService,
    private academicStructureService: AcademicStructureService,
    private imageKitService: ImageKitService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async validateUser(
    email: string,
    password: string,
    userType?: string,
  ): Promise<any> {
    try {
      // Trim email and password to handle any whitespace issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      this.logger.log(
        `Validating user: ${trimmedEmail} (type: ${userType || 'NOT SPECIFIED'})`,
      );
      console.log(
        `🔍 [AUTH DEBUG] Email: ${trimmedEmail}, UserType: ${userType || 'NOT SPECIFIED'}, Password length: ${trimmedPassword.length}`,
      );

      // First try to find user with the specified type
      let user = await this.usersService.findByEmail(trimmedEmail, userType);

      if (!user && userType) {
        this.logger.log(
          `User not found with type ${userType}, checking without type filter...`,
        );
        console.log(
          `⚠️ [AUTH DEBUG] User not found with type ${userType}, checking all users...`,
        );
        // Check if user exists with any type
        user = await this.usersService.findByEmail(trimmedEmail);
        if (user) {
          console.log(
            `⚠️ [AUTH DEBUG] User found but with type: ${user.type}, expected: ${userType}`,
          );
          this.logger.warn(
            `User found but with different type: ${user.type} (expected: ${userType})`,
          );
        }
      }

      // If not found and a userType was specified, check if it's a MASTER account
      // Master accounts can login with any userType
      if (!user && userType) {
        this.logger.log(
          `User not found with type ${userType}, checking for MASTER account...`,
        );
        user = await this.usersService.findByEmail(trimmedEmail, 'MASTER');

        if (user && user.type === 'MASTER') {
          this.logger.log(
            `Found MASTER account, allowing login with any userType`,
          );
        }
      }

      if (!user) {
        this.logger.warn(
          `User not found: ${trimmedEmail} (type: ${userType || 'any'})`,
        );
        console.error(`❌ [AUTH DEBUG] User not found in database`);
        return null;
      }

      this.logger.log(`User found, checking password...`);
      console.log(
        `✅ [AUTH DEBUG] User found: ${user.email}, Type: ${user.type}`,
      );
      console.log(`🔑 [AUTH DEBUG] Comparing password...`);

      const passwordMatch = await bcrypt.compare(
        trimmedPassword,
        user.password,
      );

      if (passwordMatch) {
        this.logger.log(`Password match successful for: ${trimmedEmail}`);
        console.log(`✅ [AUTH DEBUG] Password match successful!`);
        const { password, ...result } = user;
        return result;
      }

      this.logger.warn(`Password mismatch for: ${trimmedEmail}`);
      console.error(`❌ [AUTH DEBUG] Password mismatch!`);
      console.log(
        `🔍 [AUTH DEBUG] Provided password (trimmed): "${trimmedPassword}"`,
      );
      console.log(`🔍 [AUTH DEBUG] Password length: ${trimmedPassword.length}`);
      return null;
    } catch (error) {
      this.logger.error(`Error in validateUser for ${email}:`, error);
      console.error(`❌ [AUTH DEBUG] Error:`, error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      this.logger.log(
        `Login attempt: ${loginDto.email} (${loginDto.userType})`,
      );

      const user = await this.validateUser(
        loginDto.email,
        loginDto.password,
        loginDto.userType,
      );

      if (!user) {
        this.logger.warn(
          `Failed login attempt: ${loginDto.email} - Invalid credentials`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Successful login: ${loginDto.email}`);
      console.log('🟢 [LOGIN DEBUG] User type:', user.type);
      console.log('🟢 [LOGIN DEBUG] User ID:', user.id);

      // Fetch schoolId for school admin users
      let schoolId: string | undefined;
      if (user.type === 'SCHOOL_ADMIN') {
        console.log(
          '🟢 [LOGIN DEBUG] User is SCHOOL_ADMIN, fetching schoolId...',
        );
        const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
          where: { userId: user.id },
          select: { schoolId: true },
        });

        console.log('🟢 [LOGIN DEBUG] SchoolAdmin lookup result:', schoolAdmin);

        if (schoolAdmin) {
          schoolId = schoolAdmin.schoolId;
          this.logger.log(`Found schoolId for school admin: ${schoolId}`);
          console.log('✅ [LOGIN DEBUG] Found schoolId:', schoolId);
        } else {
          this.logger.warn(
            `School admin ${user.id} does not have a school assigned`,
          );
          console.warn(
            '⚠️ [LOGIN DEBUG] No SchoolAdmin record found for user:',
            user.id,
          );
        }
      } else {
        console.log(
          '🟢 [LOGIN DEBUG] User is NOT SCHOOL_ADMIN, type:',
          user.type,
        );
      }

      const payload: any = {
        email: user.email,
        sub: user.id,
        type: user.type.toLowerCase(), // Store lowercase in JWT for consistency
        firstName: user.firstName,
        lastName: user.lastName,
      };

      // Include schoolId in JWT payload if user is a school admin
      if (schoolId) {
        payload.schoolId = schoolId;
        console.log(
          '✅ [LOGIN DEBUG] Added schoolId to JWT payload:',
          schoolId,
        );
      } else {
        console.warn(
          '⚠️ [LOGIN DEBUG] schoolId is undefined, NOT adding to payload',
        );
      }

      console.log(
        '🟢 [LOGIN DEBUG] Final JWT payload:',
        JSON.stringify(payload, null, 2),
      );

      const userResponse: any = {
        id: user.id,
        email: user.email,
        type: user.type.toLowerCase(), // Return lowercase for frontend consistency
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
      };

      // Include schoolId in user response if user is a school admin
      if (schoolId) {
        userResponse.schoolId = schoolId;
      }

      return {
        access_token: this.jwtService.sign(payload),
        user: userResponse,
      };
    } catch (error) {
      this.logger.error(`Login error for ${loginDto.email}:`, error);
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(
      `Registration attempt: ${registerDto.email} (${registerDto.userType})`,
    );

    try {
      // Check if user already exists for this user type
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
        registerDto.userType,
      );
      if (existingUser) {
        this.logger.warn(
          `User already exists: ${registerDto.email} (${registerDto.userType})`,
        );
        throw new ConflictException(
          'User with this email already exists for this account type',
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Handle school registration
      if (registerDto.userType === UserType.SCHOOL_ADMIN) {
        return await this.registerSchoolAdmin(registerDto, hashedPassword);
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

      // Create user
      const user = await this.usersService.create(userData);
      this.logger.log(`User created: ${user.id} (${user.email})`);

      // If parent self-registration, send verification code to their email
      if (registerDto.userType === UserType.PARENT) {
        try {
          // Use the proper sendVerificationEmail method that stores codes in DB
          await this.sendVerificationEmail(
            user.email,
            'PARENT',
            `${user.firstName} ${user.lastName}`,
          );
        } catch (emailError) {
          this.logger.error(
            `Failed to send parent verification email to ${user.email}`,
            emailError as any,
          );
        }
      }

      const payload = {
        email: user.email,
        sub: user.id,
        type: user.type.toLowerCase(), // Store lowercase in JWT for consistency
        firstName: user.firstName,
        lastName: user.lastName,
      };

      this.logger.log(`Registration completed: ${user.email}`);

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          type: user.type.toLowerCase(), // Return lowercase for frontend consistency
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}:`, error);
      throw error;
    }
  }

  private async registerSchoolAdmin(
    registerDto: RegisterDto,
    hashedPassword: string,
  ) {
    this.logger.log(`School admin registration: ${registerDto.email}`);

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

      const user = await prisma.user.create({
        data: userData,
      });
      this.logger.log(`School admin user created: ${user.id}`);

      // 2. Create the school
      if (!registerDto.schoolName) {
        throw new ConflictException(
          'School name is required for school admins',
        );
      }
      if (!registerDto.country) {
        throw new ConflictException('Country is required for school admins');
      }
      if (!registerDto.schoolTypes || registerDto.schoolTypes.length === 0) {
        throw new ConflictException('At least one school type is required');
      }

      const primaryAddress =
        registerDto.addresses && registerDto.addresses.length > 0
          ? registerDto.addresses[0]
          : undefined;

      const schoolData = {
        name: registerDto.schoolName as string,
        country: registerDto.country as string,
        street: primaryAddress?.street,
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        postalCode: primaryAddress?.postalCode,
        landmark: primaryAddress?.landmark,
        logo: registerDto.profilePicture,
      };

      const school = await prisma.school.create({
        data: schoolData,
      });
      this.logger.log(`School created: ${school.id}`);

      // 3. Create the school admin relationship
      const schoolAdminData = {
        userId: user.id,
        schoolId: school.id,
        role: (registerDto.role ?? 'admin') as string, // principal, vice_principal, admin, etc.
      };

      const schoolAdmin = await prisma.schoolAdmin.create({
        data: schoolAdminData,
      });
      this.logger.log(`School admin relationship created: ${schoolAdmin.id}`);

      // 4. Generate academic structure for the school
      const educationSystemId = this.getEducationSystemIdByCountry(
        registerDto.country,
      );
      const availableLevels = this.getAvailableLevelsForCountry(
        registerDto.country,
      );

      await this.academicStructureService.generateAcademicStructureForSchool(
        school.id,
        educationSystemId,
        registerDto.schoolTypes, // All selected school types
        availableLevels, // All available levels for future expansion
        prisma, // Pass the transaction Prisma client
      );
      this.logger.log(`Academic structure generated for school ${school.id}`);

      const payload = {
        email: user.email,
        sub: user.id,
        type: user.type.toLowerCase(), // Store lowercase in JWT for consistency
        firstName: user.firstName,
        lastName: user.lastName,
        schoolId: school.id, // Include schoolId in JWT payload
      };

      this.logger.log(`School admin registration completed: ${user.email}`);

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          type: user.type.toLowerCase(), // Return lowercase for frontend consistency
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          schoolId: school.id, // Include schoolId for school admin users
        },
        school: {
          id: school.id,
          name: school.name,
          // type field removed - using academic config instead
        },
      };
    });
  }

  private async registerCreator(
    registerDto: RegisterDto,
    hashedPassword: string,
  ) {
    this.logger.log(`Creator registration: ${registerDto.email}`);

    try {
      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Create the user with additional fields
        const userData = {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          type: UserType.CREATOR,
          phone: registerDto.phone,
          profilePicture: registerDto.profilePicture,
          bio: registerDto.bio,
          website: registerDto.website,
          country: registerDto.country,
        };

        const user = await prisma.user.create({
          data: userData,
        });
        this.logger.log(`Creator user created: ${user.id}`);

        // 2. Create the creator profile
        const creatorData = {
          userId: user.id,
          plan: registerDto.plan || 'free',
          categories: registerDto.categories || [],
          specialties: [],
        };

        const creator = await prisma.creator.create({
          data: creatorData,
        });
        this.logger.log(`Creator profile created: ${creator.id}`);

        return { user, creator };
      });

      // 3. Send verification email
      try {
        await this.sendVerificationEmail(
          result.user.email,
          'CREATOR',
          `${result.user.firstName} ${result.user.lastName}`,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send creator verification email to ${result.user.email}`,
          emailError as any,
        );
      }

      // 4. Generate JWT token
      const payload = {
        email: result.user.email,
        sub: result.user.id,
        type: result.user.type.toLowerCase(),
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      };

      this.logger.log(`Creator registration completed: ${result.user.email}`);

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: result.user.id,
          email: result.user.email,
          type: result.user.type.toLowerCase(),
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profilePicture: result.user.profilePicture,
          isEmailVerified: result.user.isEmailVerified,
        },
      };
    } catch (error) {
      this.logger.error(
        `Creator registration failed for ${registerDto.email}:`,
        error,
      );
      throw error;
    }
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
      // Step 1: Invalidate all previous pending codes for this email
      await this.prisma.verificationCode.deleteMany({
        where: {
          email,
          type: 'EMAIL_VERIFICATION',
          usedAt: null, // Only delete unused codes
        },
      });
      this.logger.log(`Invalidated old verification codes for ${email}`);

      // Step 2: Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Step 3: Store code in database
      await this.prisma.verificationCode.create({
        data: {
          email,
          code,
          type: 'EMAIL_VERIFICATION',
          expiresAt,
        },
      });
      this.logger.log(
        `Verification code stored for ${email}, expires at ${expiresAt}`,
      );

      // Step 4: Send the verification email
      const emailSent = await this.emailService.sendVerificationEmail(
        email,
        code,
        userName || 'User',
        userType,
      );

      if (emailSent) {
        this.logger.log(`Verification code for ${email}: ${code}`);

        return {
          success: true,
          message: 'Verification email sent successfully',
          email,
          userType,
          // Return code in dev mode for easy testing
          devVerificationCode:
            process.env.NODE_ENV !== 'production' ? code : undefined,
        };
      } else {
        this.logger.error(
          `Failed to send verification email to ${email} (userType=${userType})`,
        );
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      this.logger.error('Email sending error', error as any);
      throw new Error('Failed to send verification email');
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      // Step 1: Find the verification code in database
      const verificationCode = await this.prisma.verificationCode.findFirst({
        where: {
          email,
          code,
          type: 'EMAIL_VERIFICATION',
          usedAt: null, // Not yet used
        },
        orderBy: {
          createdAt: 'desc', // Get the most recent one
        },
      });

      // Step 2: Validate code exists
      if (!verificationCode) {
        this.logger.warn(`Invalid verification code attempted for ${email}`);
        throw new UnauthorizedException('Invalid or expired verification code');
      }

      // Step 3: Check if code is expired
      if (new Date() > verificationCode.expiresAt) {
        this.logger.warn(`Expired verification code used for ${email}`);
        throw new UnauthorizedException(
          'Verification code has expired. Please request a new one.',
        );
      }

      // Step 4: Mark code as used
      await this.prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { usedAt: new Date() },
      });

      // Step 5: Update user's email verification status
      await this.prisma.user.updateMany({
        where: { email },
        data: { isEmailVerified: true },
      });

      this.logger.log(`Email verified successfully for: ${email}`);

      return {
        success: true,
        message: 'Email verified successfully',
        email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Email verification error for ${email}:`, error);
      throw new Error('Failed to verify email');
    }
  }

  async verifyCreatorEmail(email: string, code: string) {
    // Verify creator email with code (similar to verifyEmail but for creators)
    // For now, accept any 6-digit code for development
    // In production, this would validate against stored codes
    if (code.length === 6 && /^\d+$/.test(code)) {
      // Update user's email verification status if needed
      const user = await this.usersService.findByEmail(email, UserType.CREATOR);
      if (user) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        });
      }

      return {
        success: true,
        message: 'Creator email verified successfully',
        email,
      };
    } else {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
  }

  /**
   * Cleanup expired verification codes
   * Can be called by a cron job or manually
   */
  async cleanupExpiredVerificationCodes() {
    try {
      // Delete codes that expired more than 24 hours ago
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await this.prisma.verificationCode.deleteMany({
        where: {
          OR: [
            // Expired and unused codes older than 24 hours
            {
              expiresAt: { lt: cutoffDate },
              usedAt: null,
            },
            // Used codes older than 90 days (for audit trail)
            {
              usedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired verification codes`);
      return {
        success: true,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup verification codes:', error);
      throw new Error('Failed to cleanup verification codes');
    }
  }

  async updateProfile(user: any, updateDto: UpdateProfileDto) {
    try {
      const updateData: any = {};

      if (updateDto.firstName !== undefined) {
        updateData.firstName = updateDto.firstName;
      }
      if (updateDto.lastName !== undefined) {
        updateData.lastName = updateDto.lastName;
      }
      if (updateDto.phone !== undefined) {
        updateData.phone = updateDto.phone;
      }
      if (updateDto.profilePicture !== undefined) {
        updateData.profilePicture = updateDto.profilePicture;
      }
      if (updateDto.bio !== undefined) {
        updateData.bio = updateDto.bio;
      }
      if (updateDto.website !== undefined) {
        updateData.website = updateDto.website;
      }
      if (updateDto.country !== undefined) {
        updateData.country = updateDto.country;
      }
      if (updateDto.email !== undefined) {
        updateData.email = updateDto.email;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Update teacher-specific fields if user is a teacher
      if (user.type === UserType.TEACHER && (updateDto.employeeNumber !== undefined || updateDto.department !== undefined)) {
        const teacher = await this.prisma.teacher.findUnique({
          where: { userId: user.id },
        });

        if (teacher) {
          const teacherUpdateData: any = {};
          if (updateDto.employeeNumber !== undefined) {
            teacherUpdateData.employeeNumber = updateDto.employeeNumber;
          }
          if (updateDto.department !== undefined) {
            teacherUpdateData.department = updateDto.department;
          }

          await this.prisma.teacher.update({
            where: { id: teacher.id },
            data: teacherUpdateData,
          });
        }
      }

      const { password, ...result } = updatedUser;
      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...result,
          type: result.type.toLowerCase(),
        },
      };
    } catch (error) {
      this.logger.error(`Error updating profile for user ${user.id}:`, error);
      throw new Error('Failed to update profile');
    }
  }

  async changePassword(user: any, changePasswordDto: { newPassword: string; confirmPassword: string }) {
    this.logger.log(`[Change Password] Starting password change for user ${user.id}`);
    this.logger.log(`[Change Password] Request data:`, {
      userId: user.id,
      newPasswordLength: changePasswordDto.newPassword?.length || 0,
      confirmPasswordLength: changePasswordDto.confirmPassword?.length || 0,
    });

    try {
      // Validation: Check if passwords are provided
      if (!changePasswordDto.newPassword || !changePasswordDto.confirmPassword) {
        const errorMsg = 'Both password fields are required';
        this.logger.warn(`[Change Password] Validation failed: ${errorMsg}`);
        throw new BadRequestException(errorMsg);
      }

      // Validation: Check if passwords match
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        const errorMsg = 'New passwords do not match';
        this.logger.warn(`[Change Password] Validation failed: ${errorMsg}`);
        throw new BadRequestException(errorMsg);
      }

      // Validation: Check password length (minimum)
      if (changePasswordDto.newPassword.length < 6) {
        const errorMsg = 'Password must be at least 6 characters';
        this.logger.warn(`[Change Password] Validation failed: ${errorMsg}`);
        throw new BadRequestException(errorMsg);
      }

      // Validation: Check password length (maximum)
      if (changePasswordDto.newPassword.length > 128) {
        const errorMsg = 'Password is too long. Maximum length is 128 characters';
        this.logger.warn(`[Change Password] Validation failed: ${errorMsg}`);
        throw new BadRequestException(errorMsg);
      }

      this.logger.log(`[Change Password] Validation passed, hashing password`);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
      this.logger.log(`[Change Password] Password hashed successfully`);

      // Update user password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      this.logger.log(`[Change Password] Password updated successfully for user ${user.id}`);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      this.logger.error(`[Change Password] Error changing password for user ${user.id}:`, {
        error: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      if (error instanceof BadRequestException) {
        this.logger.warn(`[Change Password] BadRequestException thrown: ${error.message}`);
        throw error;
      }
      
      const errorMsg = error?.message || 'Failed to change password';
      this.logger.error(`[Change Password] Unexpected error: ${errorMsg}`);
      throw new BadRequestException(errorMsg);
    }
  }

  async uploadProfilePicture(user: any, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image size must be less than 5MB');
    }

    try {
      // Upload to ImageKit
      const uploadResult = await this.imageKitService.uploadFile({
        file: file.buffer,
        fileName: file.originalname,
        folder: `profiles/${user.id}`,
        useUniqueFileName: true,
        tags: ['profile-picture', `user-${user.id}`],
      });

      // Update user profile with the new picture URL
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          profilePicture: uploadResult.url,
        },
      });

      return {
        success: true,
        message: 'Profile picture uploaded successfully',
        url: uploadResult.url,
        fileId: uploadResult.fileId,
        user: {
          ...updatedUser,
          password: undefined,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error uploading profile picture for user ${user.id}:`, error);
      throw new BadRequestException(
        error.message || 'Failed to upload profile picture',
      );
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
        // Log the reset token for development when email fails
        if (process.env.NODE_ENV !== 'production') {
          console.log('⚠️ Email sending failed, but reset token generated:');
          console.log('Reset Token:', resetToken);
          console.log('This token is valid for 15 minutes');
          console.log(
            'You can use this token directly in the reset password endpoint',
          );
        }

        const errorMessage =
          process.env.NODE_ENV === 'production'
            ? 'Failed to send password reset email. Please check your email configuration or contact support.'
            : 'Failed to send password reset email. Check console for SMTP configuration details.';

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Re-throw with original error message if it's already formatted
      if (error.message && error.message.includes('Failed to send')) {
        throw error;
      }

      throw new Error(
        error.message || 'Failed to process password reset request',
      );
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
    // Fetch full user data from database to get isEmailVerified and other fields
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        type: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePicture: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!fullUser) {
      throw new Error('User not found');
    }

    // Get basic user data with lowercase type for frontend consistency
    const userData = {
      ...fullUser,
      type: fullUser.type.toLowerCase(),
    };

    // If user is a school admin, fetch the role information
    if (fullUser.type === 'SCHOOL_ADMIN') {
      const schoolAdmin = await this.getSchoolAdminProfile(user.id);

      if (schoolAdmin) {
        return {
          ...userData,
          role: schoolAdmin.role,
          schoolId: schoolAdmin.schoolId,
        };
      }
    }

    return userData;
  }

  private getEducationSystemIdByCountry(country: string): string {
    // Map country codes to education system IDs
    const countryToSystemMap: Record<string, string> = {
      NG: 'nigeria-6334',
      GH: 'ghana-6334', // Add when available
      KE: 'kenya-844', // Add when available
      // Add more mappings as needed
    };

    return countryToSystemMap[country] || 'nigeria-6334'; // Default to Nigeria
  }

  private getAvailableLevelsForCountry(country: string): string[] {
    // Get all available levels for the country's education system
    const educationSystemId = this.getEducationSystemIdByCountry(country);
    const system =
      this.academicStructureService.getEducationSystemById(educationSystemId);

    if (!system) return [];

    return system.levels.map((level) => level.id);
  }
}
