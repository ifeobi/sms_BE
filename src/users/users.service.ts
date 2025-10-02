import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    console.log('=== USER CREATION DEBUG ===');
    console.log(
      'Creating user with data:',
      JSON.stringify(createUserDto, null, 2),
    );
    console.log('Data keys:', Object.keys(createUserDto));
    console.log('================================');

    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });
      console.log('✅ User created successfully:', user.id);
      console.log('================================');
      return user;
    } catch (error) {
      console.error('❌ User creation failed:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error meta:', error.meta);
      console.log('================================');
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        type: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string, type?: string) {
    if (type) {
      // Use exact match with case insensitive search
      return await this.prisma.user.findFirst({
        where: { 
          email: {
            equals: email,
            mode: 'insensitive'
          },
          type: type as any
        },
      });
    } else {
      // Find by email only (returns first match)
      return await this.prisma.user.findFirst({
        where: { 
          email: {
            equals: email,
            mode: 'insensitive'
          }
        },
      });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByType(type: string) {
    return this.prisma.user.findMany({
      where: {
        type: type as any,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        type: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        phone: true,
        createdAt: true,
      },
    });
  }
}
