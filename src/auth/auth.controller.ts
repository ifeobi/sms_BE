import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Patch,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SchoolAdminRegisterDto } from './dto/school-admin-register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: any) {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Received registration request');
    console.log('Request body:', JSON.stringify(registerDto, null, 2));
    console.log('Request body type:', typeof registerDto);
    console.log('Request body keys:', Object.keys(registerDto));
    console.log('================================');

    // Pre-sanitize payload: normalize casing, drop school-only fields for non-school admins, coerce empty strings
    const payload: any = { ...registerDto } as any;
    if (typeof payload.userType === 'string') {
      payload.userType = payload.userType.toUpperCase();
    }
    if (payload.gender === '') {
      payload.gender = undefined;
    }
    if (payload.userType !== 'SCHOOL_ADMIN') {
      delete payload.role;
      delete payload.schoolName;
      delete payload.country;
      delete payload.schoolTypes;
      delete payload.addresses;
    }

    // Transform and exclude unwanted fields
    const cleanRegisterDto = plainToClass(RegisterDto, payload, {
      excludeExtraneousValues: true,
    });

    console.log('=== CLEANED DATA ===');
    console.log('Cleaned data:', JSON.stringify(cleanRegisterDto, null, 2));
    console.log('Cleaned data keys:', Object.keys(cleanRegisterDto));
    console.log('================================');

    return this.authService.register(cleanRegisterDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  @ApiOperation({ summary: 'Local authentication (for testing)' })
  async loginLocal(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user, updateDto);
  }

  @Post('create-master')
  @ApiOperation({ summary: 'Create master account for testing' })
  @ApiResponse({ status: 201, description: 'Master account created' })
  async createMasterAccount() {
    return this.authService.createMasterAccount();
  }

  @Post('send-verification')
  @ApiOperation({ summary: 'Send verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerificationEmail(
    @Body() data: { email: string; userType: string; userName?: string },
  ) {
    return this.authService.sendVerificationEmail(
      data.email,
      data.userType,
      data.userName,
    );
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() data: { email: string; code: string }) {
    return this.authService.verifyEmail(data.email, data.code);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent' })
  async resendVerificationEmail(
    @Body() data: { email: string; userType: string; userName?: string },
  ) {
    this.logger.log(
      `Resend verification requested | email=${data.email} userType=${data.userType}`,
    );
    return this.authService.sendVerificationEmail(
      data.email,
      data.userType,
      data.userName,
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or passwords' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-creator-email')
  @ApiOperation({ summary: 'Verify creator email with code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired verification code',
  })
  async verifyCreatorEmail(@Body() data: { email: string; code: string }) {
    return this.authService.verifyCreatorEmail(data.email, data.code);
  }
}
