import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserType } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      type: user.type,
      firstName: user.firstName,
      lastName: user.lastName
    };

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

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { 
      email: user.email, 
      sub: user.id, 
      type: user.type,
      firstName: user.firstName,
      lastName: user.lastName
    };

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
        type: masterUser.type,
        firstName: masterUser.firstName,
        lastName: masterUser.lastName,
      },
    };
  }
} 