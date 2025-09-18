import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SchoolTypeMappingService } from '../education-system/school-type-mapping.service';
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
    private schoolTypeMappingService: SchoolTypeMappingService,
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

      // 4. Create the school academic structure if provided
      if (registerDto.academicStructure || registerDto.educationSystemTemplateId || registerDto.schoolTypes) {
        if (registerDto.educationSystemTemplateId && registerDto.selectedEducationLevels) {
          // Direct template-based approach
          console.log('=== TEMPLATE-BASED ACADEMIC STRUCTURE ===');
          console.log('Template ID:', registerDto.educationSystemTemplateId);
          console.log('Selected Levels:', registerDto.selectedEducationLevels);
          
          const academicStructure = await prisma.schoolAcademicStructure.create({
            data: {
              schoolId: school.id,
              countryCode: registerDto.country,
              countryName: registerDto.country, // Will be updated from template
              systemName: 'Template-based System', // Will be updated from template
              selectedLevels: registerDto.selectedEducationLevels,
              commonSubjects: [],
              commonGradingScales: [],
              commonAcademicTerms: [],
            },
          });
          console.log('✅ Template-based academic structure created:', academicStructure.id);
        } else if (registerDto.schoolTypes && registerDto.schoolTypes.length > 0) {
          // Hybrid approach: Map static school types to template
          console.log('=== HYBRID APPROACH: STATIC TO TEMPLATE MAPPING ===');
          console.log('Static School Types:', registerDto.schoolTypes);
          console.log('Country:', registerDto.country);
          
          try {
            const mapping = await this.schoolTypeMappingService.mapStaticSchoolTypesToTemplate(
              registerDto.country,
              registerDto.schoolTypes
            );
            
            if (mapping) {
              console.log('✅ Mapping successful:', mapping);
              
              const academicStructure = await prisma.schoolAcademicStructure.create({
                data: {
                  schoolId: school.id,
                  countryCode: mapping.countryCode,
                  countryName: registerDto.country, // Will be updated from template
                  systemName: 'Template-based System', // Will be updated from template
                  selectedLevels: mapping.selectedLevels,
                  commonSubjects: [],
                  commonGradingScales: [],
                  commonAcademicTerms: [],
                },
              });
              console.log('✅ Hybrid academic structure created:', academicStructure.id);
            } else {
              console.log('⚠️ Mapping failed, skipping academic structure creation');
            }
          } catch (error) {
            console.error('❌ Error in hybrid mapping:', error);
            // Don't fail registration if mapping fails
          }
        } else if (registerDto.academicStructure) {
          // Legacy full structure approach (backward compatibility)
          console.log('=== LEGACY ACADEMIC STRUCTURE ===');
          const academicStructureData = {
            schoolId: school.id,
            countryCode: registerDto.academicStructure.countryCode,
            countryName: registerDto.academicStructure.countryName,
            systemName: registerDto.academicStructure.systemName,
            selectedLevels: registerDto.academicStructure.selectedLevels,
            commonSubjects: registerDto.academicStructure.commonSubjects,
            commonGradingScales: registerDto.academicStructure.commonGradingScales,
            commonAcademicTerms: registerDto.academicStructure.commonAcademicTerms,
          };

          console.log(
            'Creating academic structure with data:',
            JSON.stringify(academicStructureData, null, 2),
          );
          const academicStructure = await prisma.schoolAcademicStructure.create({
            data: academicStructureData,
          });
          console.log('✅ Legacy academic structure created:', academicStructure.id);
        }
      }

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
      console.error('Email sending error:', error);
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
        };
      }
    }

    return userData;
  }
}
