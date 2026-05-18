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
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SchoolAdminRegisterDto } from './dto/school-admin-register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ParentActivateDto } from './dto/parent-activate.dto';
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
  constructor(
    private authService: AuthService,
    private refreshTokens: RefreshTokenService,
  ) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
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
  @Throttle({ short: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or passwords' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('parent/activate')
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Activate a parent account (verify code + set password + login)',
  })
  @ApiResponse({ status: 200, description: 'Activated; returns token pair' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async parentActivate(
    @Body() dto: ParentActivateDto,
    @Request() req: any,
  ) {
    return this.authService.parentActivate(
      dto.email,
      dto.code,
      dto.newPassword,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
    );
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

  @Post('refresh')
  @Throttle({ short: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Rotate access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'New token pair issued' })
  @ApiResponse({ status: 401, description: 'Invalid/expired/reused refresh token' })
  async refresh(
    @Body() body: { refresh_token: string },
    @Request() req: any,
  ) {
    return this.refreshTokens.rotate(
      body.refresh_token,
      (userId) => this.authService.buildJwtPayloadForUser(userId),
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a refresh token (single device)' })
  async logout(@Body() body: { refresh_token: string }) {
    await this.refreshTokens.revoke(body.refresh_token);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens (all devices)' })
  async logoutAll(@Request() req: any) {
    await this.refreshTokens.revokeAllForUser(req.user.id);
    return { success: true };
  }
}
