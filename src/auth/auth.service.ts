import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AcademicStructureService } from '../academic-structure/academic-structure.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
    private academicStructureService: AcademicStructureService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async validateUser(
    email: string,
    password: string,
    userType?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Validating user: ${email} (type: ${userType})`);
      
      // First try to find user with the specified type
      let user = await this.usersService.findByEmail(email, userType);
      
      // If not found and a userType was specified, check if it's a MASTER account
      // Master accounts can login with any userType
      if (!user && userType) {
        this.logger.log(`User not found with type ${userType}, checking for MASTER account...`);
        user = await this.usersService.findByEmail(email, 'MASTER');
        
        if (user && user.type === 'MASTER') {
          this.logger.log(`Found MASTER account, allowing login with any userType`);
        }
      }
      
      if (!user) {
        this.logger.warn(`User not found: ${email} (type: ${userType})`);
        return null;
      }

      this.logger.log(`User found, checking password...`);
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (passwordMatch) {
        this.logger.log(`Password match successful for: ${email}`);
        const { password, ...result } = user;
        return result;
      }
      
      this.logger.warn(`Password mismatch for: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`Error in validateUser for ${email}:`, error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      this.logger.log(`Login attempt: ${loginDto.email} (${loginDto.userType})`);
      
      const user = await this.validateUser(
        loginDto.email,
        loginDto.password,
        loginDto.userType,
      );
      
      if (!user) {
        this.logger.warn(`Failed login attempt: ${loginDto.email} - Invalid credentials`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Successful login: ${loginDto.email}`);

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
    } catch (error) {
      this.logger.error(`Login error for ${loginDto.email}:`, error);
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
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
        console.log(
          '❌ User already exists for this type:',
          registerDto.email,
          registerDto.userType,
        );
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
        return await this.registerSchoolAdmin(registerDto, hashedPassword);
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

      // If parent self-registration, send verification code to their email
      let parentVerificationCode: string | undefined;
      if (registerDto.userType === UserType.PARENT) {
        try {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          parentVerificationCode = code;
          // Log the code explicitly so you can see it in your terminal during development
          console.log(`Parent verification code for ${user.email}: ${code}`);
          this.logger.log(`Parent verification code for ${user.email}: ${code}`);
          await this.emailService.sendVerificationEmail(
            user.email,
            code,
            `${user.firstName} ${user.lastName}`,
            'PARENT',
          );
          console.log(`✅ Sent parent verification code to ${user.email}`);
          this.logger.log(`✅ Sent parent verification code to ${user.email}`);
        } catch (emailError) {
          console.error('❌ Failed to send parent verification email:', emailError);
          this.logger.error('❌ Failed to send parent verification email:', emailError as any);
        }
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
        // Expose the code only in non-production for quick testing
        devVerificationCode:
          process.env.NODE_ENV !== 'production' &&
          registerDto.userType === UserType.PARENT
            ? parentVerificationCode
            : undefined,
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.log('================================');
      throw error;
    }
  }

  private async registerSchoolAdmin(
    registerDto: RegisterDto,
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
      if (!registerDto.schoolName) {
        throw new ConflictException('School name is required for school admins');
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
        type: registerDto.schoolTypes[0] as string, // Use the frontend value directly
        country: registerDto.country as string,
        street: primaryAddress?.street,
        city: primaryAddress?.city,
        state: primaryAddress?.state,
        postalCode: primaryAddress?.postalCode,
        landmark: primaryAddress?.landmark,
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
        role: (registerDto.role ?? 'admin') as string, // principal, vice_principal, admin, etc.
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

      // 4. Generate academic structure for the school
      console.log('Generating academic structure...');
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
      );
      console.log('✅ Academic structure generated');

      const payload = {
        email: user.email,
        sub: user.id,
        type: user.type.toLowerCase(), // Store lowercase in JWT for consistency
        firstName: user.firstName,
        lastName: user.lastName,
        schoolId: school.id, // Include schoolId in JWT payload
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
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Log server-side for visibility
      this.logger.log(
        `Preparing verification email | email=${email} userType=${userType} code=${code}`,
      );

      // Send the verification email
      const emailSent = await this.emailService.sendVerificationEmail(
        email,
        code,
        userName || 'User',
        userType,
      );

      if (emailSent) {
        // In production, store the code in database with expiration
        console.log(`Verification code for ${email}: ${code}`);
        this.logger.log(`Verification code for ${email}: ${code}`);

        return {
          success: true,
          message: 'Verification email sent successfully',
          email,
          userType,
        };
      } else {
        this.logger.error(
          `Failed to send verification email to ${email} (userType=${userType})`,
        );
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      this.logger.error('Email sending error', error as any);
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
    // Get basic user data with lowercase type for frontend consistency
    const userData = {
      ...user,
      type: user.type.toLowerCase(),
    };

    // If user is a school admin, fetch the role information
    if (user.type === 'school_admin') {
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
