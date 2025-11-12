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

  /**
   * Generate a random secure password for new staff members
   * Format: 8-12 characters with uppercase, lowercase, numbers
   */
  private generateRandomPassword(): string {
    const length = 10; // Password length
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to randomize character positions
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async create(createStaffDto: CreateStaffDto) {
    const {
      schoolId,
      userType,
      subjects,
      assignedClasses,
      teacherAssignments,
      ...userData
    } = createStaffDto;

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

    // Use default password for now (can be changed later)
    const temporaryPassword = 'changeme123';
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    console.log('========================================');
    console.log('🔐 NEW STAFF MEMBER CREATED');
    console.log('========================================');
    console.log('Name:', `${userData.firstName} ${userData.lastName}`);
    console.log('Email:', userData.email);
    console.log('Type:', userType);
    console.log('Employee Number:', userData.employeeNumber);
    console.log('Default Password:', temporaryPassword);
    console.log('========================================');
    console.log('⚠️  IMPORTANT: Share this password with the staff member');
    console.log('⚠️  They should change it on first login');
    console.log('========================================');

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
      if (teacherAssignments && teacherAssignments.length > 0) {
        const validAssignments = teacherAssignments.filter(
          (assignment) =>
            assignment.classId &&
            assignment.subjectId &&
            assignment.academicYear,
        );

        if (validAssignments.length !== teacherAssignments.length) {
          console.warn(
            '⚠️ Some teacher assignments were skipped due to missing data.',
          );
        }

        if (validAssignments.length > 0) {
          const createdAssignments = await Promise.all(
            validAssignments.map((assignment) =>
              this.prisma.teacherAssignment.create({
                data: {
                  teacherId: teacher.id,
                  schoolId,
                  classId: assignment.classId,
                  subjectId: assignment.subjectId,
                  academicYear: assignment.academicYear,
                  isFormTeacher: assignment.isFormTeacher ?? false,
                },
              }),
            ),
          );

          // Auto-link existing student enrollments to these new teacher assignments
          for (const assignment of createdAssignments) {
            await this.prisma.studentSubjectEnrollment.updateMany({
              where: {
                classId: assignment.classId,
                subjectId: assignment.subjectId,
                teacherAssignmentId: null, // Only update enrollments that aren't already linked
                isActive: true,
              },
              data: {
                teacherAssignmentId: assignment.id,
              },
            });
          }

          console.log(
            `✅ Created ${createdAssignments.length} teacher assignments and linked existing student enrollments`,
          );
        }
      }

      if (assignedClasses && assignedClasses.length > 0) {
        console.log('Assigned classes (deprecated field):', assignedClasses);
      }

      if (subjects && subjects.length > 0) {
        console.log('Subjects selected (deprecated field):', subjects);
      }

      // Return teacher with temporary password
      // Create a simple plain object to ensure password is included
      const response = {
        id: teacher.id,
        userId: teacher.userId,
        schoolId: teacher.schoolId,
        employeeNumber: teacher.employeeNumber,
        department: teacher.department,
        user: teacher.user,
        school: teacher.school,
        teacherAssignments: await this.prisma.teacherAssignment.findMany({
          where: { teacherId: teacher.id },
          include: {
            class: true,
            subject: true,
          },
        }),
        temporaryPassword: temporaryPassword, // Explicitly add password
      };
      
      console.log('📤 Returning teacher response');
      console.log('📤 temporaryPassword:', temporaryPassword);
      console.log('📤 Response has temporaryPassword:', 'temporaryPassword' in response);
      return response;
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

      // Return school admin with temporary password
      // Create a simple plain object to ensure password is included
      const response = {
        id: schoolAdmin.id,
        userId: schoolAdmin.userId,
        schoolId: schoolAdmin.schoolId,
        role: schoolAdmin.role,
        user: schoolAdmin.user,
        school: schoolAdmin.school,
        temporaryPassword: temporaryPassword, // Explicitly add password
      };
      
      console.log('📤 Returning school admin response');
      console.log('📤 temporaryPassword:', temporaryPassword);
      console.log('📤 Response has temporaryPassword:', 'temporaryPassword' in response);
      return response;
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
