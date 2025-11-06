import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, ParentInfoDto, RelationshipType } from './dto/create-student.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async createStudent(dto: CreateStudentDto, schoolId: string) {
    console.log('🔵 [DEBUG] createStudent called', { 
      studentEmail: dto.email, 
      schoolId,
      hasParentInfo: !!dto.parentInfo,
      existingParentId: dto.existingParentId 
    });

    try {
      // 1. Check if student user exists (using compound unique key)
      console.log('🔵 [DEBUG] Step 1: Checking for existing student user...');
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          type: 'STUDENT',
        },
      });
      if (existingUser) {
        console.log('❌ [DEBUG] Student user already exists:', existingUser.id);
        throw new BadRequestException('A user with this student email already exists');
      }
      console.log('✅ [DEBUG] No existing student user found - proceeding');

      // 2. Create student user with random password
      console.log('🔵 [DEBUG] Step 2: Creating student user...');
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const studentUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          type: 'STUDENT',
          phone: dto.phone,
        },
      });
      console.log('✅ [DEBUG] Student user created:', studentUser.id);

      // 3. Map classLevel (string) to classId
      console.log('🔵 [DEBUG] Step 3: Finding class for classLevel:', dto.classLevel);
      const classObj = await this.prisma.class.findFirst({ where: { name: dto.classLevel, schoolId } });
      if (!classObj) {
        console.log('❌ [DEBUG] Class level not found:', dto.classLevel);
        throw new BadRequestException('Class level not found');
      }
      console.log('✅ [DEBUG] Class found:', classObj.id, classObj.name);

      // 4. Convert gender string to Gender enum (uppercase)
      const genderMap: Record<string, 'MALE' | 'FEMALE' | 'OTHER'> = {
        'male': 'MALE',
        'female': 'FEMALE',
        'other': 'OTHER',
      };
      const gender = genderMap[dto.gender.toLowerCase()] || 'OTHER';
      console.log('🔵 [DEBUG] Gender mapped:', dto.gender, '->', gender);

      // 5. Create student record
      console.log('🔵 [DEBUG] Step 5: Creating student record...');
      const student = await this.prisma.student.create({
        data: {
          userId: studentUser.id,
          schoolId,
          studentNumber: uuidv4(),
          currentClassId: classObj.id,
          currentLevelId: classObj.levelId,
          academicYear: dto.academicYear,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: gender as any,
          allergies: dto.allergies ?? [],
          medications: dto.medications ?? [],
          specialNeeds: dto.specialNeeds,
          nationality: 'Nigerian', // Default, can be updated later
          // TODO: Save address/other info as appropriate
          modifiedBy: 'school_admin',
        },
      });
      console.log('✅ [DEBUG] Student record created:', student.id);

      // 6. Parent: link to existing or create
      console.log('🔵 [DEBUG] Step 6: Processing parent...');
      let parentUser;
      let parentRecord;
      if (dto.existingParentId) {
        console.log('🔵 [DEBUG] Using existing parent ID:', dto.existingParentId);
        parentUser = await this.prisma.user.findUnique({ where: { id: dto.existingParentId } });
        if (!parentUser) {
          console.log('❌ [DEBUG] Parent not found with ID:', dto.existingParentId);
          throw new BadRequestException('Parent not found');
        }
        console.log('✅ [DEBUG] Existing parent user found:', parentUser.id, parentUser.email);
        
        // Ensure Parent record exists for existing parent user
        console.log('🔵 [DEBUG] Upserting Parent record for existing parent user...');
        parentRecord = await this.prisma.parent.upsert({
          where: { userId: parentUser.id },
          create: { userId: parentUser.id },
          update: {},
        });
        console.log('✅ [DEBUG] Parent record upserted (found or created):', parentRecord.id);
      } else {
        // Search by email (case-insensitive)
        const normalizedEmail = dto.parentInfo.email.trim().toLowerCase();
        console.log('🔵 [DEBUG] Searching for parent by email:', dto.parentInfo.email, '(normalized:', normalizedEmail + ')');
        
        // Try case-insensitive search first
        parentUser = await this.prisma.user.findFirst({ 
          where: { 
            email: {
              equals: normalizedEmail,
              mode: 'insensitive',
            },
            type: 'PARENT' 
          } 
        });
        
        // Fallback to exact match if case-insensitive didn't work
        if (!parentUser) {
          parentUser = await this.prisma.user.findFirst({ 
            where: { 
              email: dto.parentInfo.email.trim(), 
              type: 'PARENT' 
            } 
          });
        }
        
        if (!parentUser) {
          console.log('🔵 [DEBUG] Parent user not found - creating new parent user...');
          // New parent: create user
          const parentPassword = Math.random().toString(36).slice(-8);
          const hashedParentPassword = await bcrypt.hash(parentPassword, 10);
          parentUser = await this.prisma.user.create({
            data: {
              email: dto.parentInfo.email.trim(), // Normalize email
              password: hashedParentPassword,
              firstName: dto.parentInfo.firstName,
              lastName: dto.parentInfo.lastName,
              type: 'PARENT',
              phone: dto.parentInfo.phone,
            },
          });
          console.log('✅ [DEBUG] New parent user created:', parentUser.id, parentUser.email);
          
          // Create Parent record if it doesn't exist
          console.log('🔵 [DEBUG] Upserting Parent record for new parent user...');
          parentRecord = await this.prisma.parent.upsert({
            where: { userId: parentUser.id },
            create: { userId: parentUser.id },
            update: {},
          });
          console.log('✅ [DEBUG] Parent record upserted (created):', parentRecord.id);
          // TODO: Send parent verification code (email)
        } else {
          console.log('✅ [DEBUG] Existing parent user found:', parentUser.id, parentUser.email);
          // Ensure Parent record exists for existing user
          console.log('🔵 [DEBUG] Upserting Parent record for existing parent user...');
          parentRecord = await this.prisma.parent.upsert({
            where: { userId: parentUser.id },
            create: { userId: parentUser.id },
            update: {},
          });
          console.log('✅ [DEBUG] Parent record upserted (found or created):', parentRecord.id);
        }
      }
      
      // 7. Convert relationship to ParentRelationshipType enum (uppercase)
      const relationshipMap: Record<string, 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER'> = {
        'father': 'FATHER',
        'mother': 'MOTHER',
        'guardian': 'GUARDIAN',
        'other': 'OTHER',
      };
      const relationshipType = relationshipMap[dto.relationship.toLowerCase()] || 'OTHER';
      console.log('🔵 [DEBUG] Relationship type mapped:', dto.relationship, '->', relationshipType);

      // 8. Create parent-school relationship first
      console.log('🔵 [DEBUG] Step 8: Creating parent-school relationship...');
      console.log('🔵 [DEBUG] Using parentRecord.id:', parentRecord.id, '(not parentUser.id:', parentUser.id + ')');
      const verificationCode = uuidv4();
      const parentRelationship = await this.prisma.parentSchoolRelationship.create({
        data: {
          parentUserId: parentRecord.id, // Use Parent.id, not User.id
          schoolId,
          relationshipType: relationshipType as any,
          verificationCode,
          verificationExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
      });
      console.log('✅ [DEBUG] Parent-school relationship created:', parentRelationship.id);

      // 9. Link student to parent relationship
      console.log('🔵 [DEBUG] Step 9: Linking student to parent relationship...');
      await this.prisma.student.update({
        where: { id: student.id },
        data: {
          parentRelationships: {
            connect: { id: parentRelationship.id },
          },
        },
      });
      console.log('✅ [DEBUG] Student linked to parent relationship successfully');
      
      // Optionally: send email to parent with verificationCode
      console.log('🎉 [DEBUG] Student creation completed successfully!');
      console.log('📊 [DEBUG] Summary:', {
        studentId: student.id,
        studentUserId: studentUser.id,
        parentUserId: parentUser.id,
        parentRecordId: parentRecord.id,
        parentRelationshipId: parentRelationship.id,
      });
      
      return { student, studentUser, parentUser };
    } catch (error) {
      console.error('❌ [DEBUG] ERROR in createStudent:', error);
      console.error('❌ [DEBUG] Error details:', {
        message: error.message,
        stack: error.stack,
        dto: {
          studentEmail: dto.email,
          parentEmail: dto.parentInfo?.email,
          schoolId,
        },
      });
      throw error; // Re-throw to let NestJS handle it properly
    }
  }

  async getChildrenForParent(parentUserId: string) {
    // Find Parent record by userId
    const parent = await this.prisma.parent.findUnique({ where: { userId: parentUserId } });
    if (!parent) {
      return [];
    }

    // Get relationships and include children with basic details
    const relationships = await this.prisma.parentSchoolRelationship.findMany({
      where: { parentUserId: parent.id, isActive: true },
      include: {
        children: {
          include: {
            user: true,
            currentClass: { include: { level: true } },
          },
        },
      },
    });

    // Flatten and map children
    const children = relationships.flatMap((rel) => rel.children);
    return children.map((child) => ({
      id: child.id,
      userId: child.userId,
      email: child.user?.email,
      firstName: child.user?.firstName,
      lastName: child.user?.lastName,
      profilePicture: child.user?.profilePicture,
      currentClass: child.currentClass?.name,
      currentLevel: child.currentClass?.level?.name,
      schoolId: child.schoolId,
      academicYear: child.academicYear,
    }));
  }
}
