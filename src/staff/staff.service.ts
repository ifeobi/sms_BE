import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto) {
    const { schoolId, userType, subjects, ...userData } = createStaffDto;

    // Check if email already exists for this user type
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: userData.email,
        type: userType,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists for this user type');
    }

    // Check if employee number already exists
    if (userType === 'TEACHER') {
      const existingTeacher = await this.prisma.teacher.findUnique({
        where: { employeeNumber: userData.employeeNumber },
      });
      if (existingTeacher) {
        throw new ConflictException('Employee number already exists');
      }
    }

    // Generate a default password (staff will reset it on first login)
    const defaultPassword = 'changeme123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create user first
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        type: userType,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        isActive: userData.isActive ?? true,
      },
    });

    // Create staff record based on type
    if (userType === 'TEACHER') {
      const teacher = await this.prisma.teacher.create({
        data: {
          userId: user.id,
          schoolId,
          employeeNumber: userData.employeeNumber,
          department: userData.department,
        },
        include: {
          user: true,
          school: true,
        },
      });

      // Create subject assignments if subjects are provided
      if (subjects && subjects.length > 0) {
        // This would need to be implemented based on your subject structure
        // For now, we'll just store the subjects in a note or separate table
        console.log('Subjects to assign:', subjects);
      }

      return teacher;
    } else if (userType === 'SCHOOL_ADMIN') {
      const schoolAdmin = await this.prisma.schoolAdmin.create({
        data: {
          userId: user.id,
          schoolId,
          role: userData.role,
        },
        include: {
          user: true,
          school: true,
        },
      });

      return schoolAdmin;
    }

    throw new Error('Invalid user type');
  }

  async findAll(schoolId: string) {
    const teachers = await this.prisma.teacher.findMany({
      where: { schoolId },
      include: {
        user: true,
        school: true,
        teacherAssignments: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    const schoolAdmins = await this.prisma.schoolAdmin.findMany({
      where: { schoolId },
      include: {
        user: true,
        school: true,
      },
    });

    return {
      teachers,
      schoolAdmins,
    };
  }

  async findOne(id: string) {
    // Try to find as teacher first
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        school: true,
        teacherAssignments: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    if (teacher) {
      return teacher;
    }

    // Try to find as school admin
    const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
      where: { id },
      include: {
        user: true,
        school: true,
      },
    });

    if (schoolAdmin) {
      return schoolAdmin;
    }

    throw new NotFoundException('Staff member not found');
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const { userType, subjects, ...updateData } = updateStaffDto;

    // Find the staff member first
    const staff = await this.findOne(id);

    // Update user data
    if (
      updateData.firstName ||
      updateData.lastName ||
      updateData.email ||
      updateData.phone
    ) {
      await this.prisma.user.update({
        where: { id: staff.userId },
        data: {
          ...(updateData.firstName && { firstName: updateData.firstName }),
          ...(updateData.lastName && { lastName: updateData.lastName }),
          ...(updateData.firstName &&
            updateData.lastName && {
              fullName: `${updateData.firstName} ${updateData.lastName}`,
            }),
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.phone && { phone: updateData.phone }),
        },
      });
    }

    // Update staff-specific data
    if ('employeeNumber' in staff) {
      // This is a teacher
      await this.prisma.teacher.update({
        where: { id },
        data: {
          ...(updateData.employeeNumber && {
            employeeNumber: updateData.employeeNumber,
          }),
          ...(updateData.department && { department: updateData.department }),
        },
      });
    } else {
      // This is a school admin
      await this.prisma.schoolAdmin.update({
        where: { id },
        data: {
          ...(updateData.role && { role: updateData.role }),
        },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const staff = await this.findOne(id);

    // Delete the user (this will cascade to the staff record)
    await this.prisma.user.delete({
      where: { id: staff.userId },
    });

    return { message: 'Staff member deleted successfully' };
  }

  async findBySchool(schoolId: string) {
    return this.findAll(schoolId);
  }
}
