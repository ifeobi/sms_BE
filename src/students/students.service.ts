import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private prisma: PrismaService) {}

  async getParentChildren(parentUserId: string) {
    try {
      // Get parent-school relationships to find which schools the parent has children in
      const parentRelationships = await this.prisma.parentSchoolRelationship.findMany({
        where: {
          parentUserId,
          isActive: true,
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });

      if (parentRelationships.length === 0) {
        return {
          children: [],
          total: 0,
        };
      }

      // Get all students from the schools where parent has relationships
      const schoolIds = parentRelationships.map(rel => rel.schoolId);
      
      const students = await this.prisma.student.findMany({
        where: {
          schoolId: {
            in: schoolIds,
          },
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profilePicture: true,
            },
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          currentClass: {
            select: {
              id: true,
              name: true,
            },
          },
          currentLevel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const children = students.map(student => ({
        id: student.id,
        studentNumber: student.studentNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        phone: student.user.phone,
        avatar: student.user.profilePicture,
        status: student.status,
        currentClass: student.currentClass.name,
        currentLevel: student.currentLevel.name,
        academicYear: student.academicYear,
        enrollmentDate: student.enrollmentDate,
        school: student.school,
      }));

      return {
        children,
        total: children.length,
      };
    } catch (error) {
      this.logger.error('Error getting parent children:', error);
      throw new HttpException(
        'Failed to get parent children',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getParentChildrenGrades(
    parentUserId: string,
    schoolId?: string,
    termId?: string,
    academicYear?: string,
  ) {
    try {
      // First get the parent's children
      const parentChildren = await this.getParentChildren(parentUserId);
      
      if (parentChildren.children.length === 0) {
        return {
          students: [],
          total: 0,
        };
      }

      const studentIds = parentChildren.children.map(child => child.id);
      
      // Build where clause for academic records
      const whereClause: any = {
        studentId: {
          in: studentIds,
        },
        isPublished: true, // Only show published grades
      };

      if (schoolId) {
        whereClause.student = {
          schoolId: schoolId,
        };
      }

      if (termId) {
        whereClause.termId = termId;
      }

      if (academicYear) {
        whereClause.term = {
          academicYear: academicYear,
        };
      }

      // Get academic records for all children
      const academicRecords = await this.prisma.academicRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  profilePicture: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
              currentClass: {
                select: {
                  id: true,
                  name: true,
                },
              },
              currentLevel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          term: {
            select: {
              id: true,
              name: true,
              academicYear: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: [
          { studentId: 'asc' },
          { gradedAt: 'desc' },
        ],
      });

      // Group records by student
      const studentsMap = new Map();
      
      academicRecords.forEach(record => {
        const studentId = record.studentId;
        
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            student: {
              id: record.student.id,
              studentNumber: record.student.studentNumber,
              name: `${record.student.user.firstName} ${record.student.user.lastName}`,
              email: record.student.user.email,
              phone: record.student.user.phone,
              avatar: record.student.user.profilePicture,
              status: record.student.status,
              currentClass: record.student.currentClass.name,
              currentLevel: record.student.currentLevel.name,
              academicYear: record.student.academicYear,
              enrollmentDate: record.student.enrollmentDate,
              school: record.student.school,
            },
            academicRecords: [],
            total: 0,
            averageGpa: 0,
            overallGrade: '',
          });
        }

        const studentData = studentsMap.get(studentId);
        studentData.academicRecords.push({
          id: record.id,
          subject: record.subject.name,
          assignment: record.assignment?.title,
          score: record.score,
          maxScore: record.maxScore,
          grade: record.grade,
          percentage: record.percentage,
          gpa: record.gpa,
          comments: record.comments,
          feedback: record.feedback,
          gradedAt: record.gradedAt,
          term: record.term,
          teacher: {
            id: record.teacher.id,
            name: `${record.teacher.user.firstName} ${record.teacher.user.lastName}`,
          },
        });
        studentData.total++;
      });

      // Calculate averages for each student
      const students = Array.from(studentsMap.values()).map(studentData => {
        if (studentData.academicRecords.length > 0) {
          const totalGpa = studentData.academicRecords.reduce((sum, record) => sum + record.gpa, 0);
          studentData.averageGpa = Math.round((totalGpa / studentData.academicRecords.length) * 100) / 100;
          
          // Calculate overall grade based on average GPA
          if (studentData.averageGpa >= 4.0) {
            studentData.overallGrade = 'A';
          } else if (studentData.averageGpa >= 3.0) {
            studentData.overallGrade = 'B';
          } else if (studentData.averageGpa >= 2.0) {
            studentData.overallGrade = 'C';
          } else if (studentData.averageGpa >= 1.0) {
            studentData.overallGrade = 'D';
          } else {
            studentData.overallGrade = 'F';
          }
        }

        return studentData;
      });

      return {
        students,
        total: students.length,
      };
    } catch (error) {
      this.logger.error('Error getting parent children grades:', error);
      throw new HttpException(
        'Failed to get children grades',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getParentChildrenAttendance(
    parentUserId: string,
    schoolId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      // First get the parent's children
      const parentChildren = await this.getParentChildren(parentUserId);
      
      if (parentChildren.children.length === 0) {
        return {
          students: [],
          total: 0,
        };
      }

      const studentIds = parentChildren.children.map(child => child.id);
      
      // Build where clause for attendance records
      const whereClause: any = {
        studentId: {
          in: studentIds,
        },
      };

      if (schoolId) {
        whereClause.student = {
          schoolId: schoolId,
        };
      }

      if (startDate) {
        whereClause.date = {
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        whereClause.date = {
          ...whereClause.date,
          lte: new Date(endDate),
        };
      }

      // Get attendance records for all children
      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  profilePicture: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
              currentClass: {
                select: {
                  id: true,
                  name: true,
                },
              },
              currentLevel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { studentId: 'asc' },
          { date: 'desc' },
        ],
      });

      // Group records by student
      const studentsMap = new Map();
      
      attendanceRecords.forEach(record => {
        const studentId = record.studentId;
        
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            student: {
              id: record.student.id,
              studentNumber: record.student.studentNumber,
              name: `${record.student.user.firstName} ${record.student.user.lastName}`,
              email: record.student.user.email,
              phone: record.student.user.phone,
              avatar: record.student.user.profilePicture,
              status: record.student.status,
              currentClass: record.student.currentClass.name,
              currentLevel: record.student.currentLevel.name,
              academicYear: record.student.academicYear,
              enrollmentDate: record.student.enrollmentDate,
              school: record.student.school,
            },
            attendanceRecords: [],
            total: 0,
            attendancePercentage: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
          });
        }

        const studentData = studentsMap.get(studentId);
        studentData.attendanceRecords.push({
          id: record.id,
          date: record.date,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          notes: record.notes,
          class: record.class,
          subject: record.subject,
        });
        studentData.total++;
      });

      // Calculate attendance statistics for each student
      const students = Array.from(studentsMap.values()).map(studentData => {
        if (studentData.attendanceRecords.length > 0) {
          const presentDays = studentData.attendanceRecords.filter(record => record.status === 'PRESENT').length;
          const absentDays = studentData.attendanceRecords.filter(record => record.status === 'ABSENT').length;
          const lateDays = studentData.attendanceRecords.filter(record => record.status === 'LATE').length;
          
          studentData.presentDays = presentDays;
          studentData.absentDays = absentDays;
          studentData.lateDays = lateDays;
          studentData.attendancePercentage = Math.round((presentDays / studentData.total) * 100);
        }

        return studentData;
      });

      return {
        students,
        total: students.length,
      };
    } catch (error) {
      this.logger.error('Error getting parent children attendance:', error);
      throw new HttpException(
        'Failed to get children attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStudentAcademicRecords(
    parentUserId: string,
    studentId: string,
    termId?: string,
    subjectId?: string,
  ) {
    try {
      // First verify that the parent has access to this student
      const parentChildren = await this.getParentChildren(parentUserId);
      const hasAccess = parentChildren.children.some(child => child.id === studentId);
      
      if (!hasAccess) {
        throw new HttpException(
          'Access denied - not authorized to view this student',
          HttpStatus.FORBIDDEN,
        );
      }

      // Build where clause for academic records
      const whereClause: any = {
        studentId: studentId,
        isPublished: true,
      };

      if (termId) {
        whereClause.termId = termId;
      }

      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Get academic records for the specific student
      const academicRecords = await this.prisma.academicRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  profilePicture: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
              currentClass: {
                select: {
                  id: true,
                  name: true,
                },
              },
              currentLevel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          term: {
            select: {
              id: true,
              name: true,
              academicYear: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { gradedAt: 'desc' },
      });

      if (academicRecords.length === 0) {
        throw new HttpException(
          'No academic records found for this student',
          HttpStatus.NOT_FOUND,
        );
      }

      const student = academicRecords[0].student;
      const studentData = {
        id: student.id,
        studentNumber: student.studentNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        phone: student.user.phone,
        avatar: student.user.profilePicture,
        status: student.status,
        currentClass: student.currentClass.name,
        currentLevel: student.currentLevel.name,
        academicYear: student.academicYear,
        enrollmentDate: student.enrollmentDate,
        school: student.school,
      };

      const records = academicRecords.map(record => ({
        id: record.id,
        subject: record.subject.name,
        assignment: record.assignment?.title,
        score: record.score,
        maxScore: record.maxScore,
        grade: record.grade,
        percentage: record.percentage,
        gpa: record.gpa,
        comments: record.comments,
        feedback: record.feedback,
        gradedAt: record.gradedAt,
        term: record.term,
        teacher: {
          id: record.teacher.id,
          name: `${record.teacher.user.firstName} ${record.teacher.user.lastName}`,
        },
      }));

      // Calculate averages
      const totalGpa = records.reduce((sum, record) => sum + record.gpa, 0);
      const averageGpa = Math.round((totalGpa / records.length) * 100) / 100;
      
      let overallGrade = 'F';
      if (averageGpa >= 4.0) {
        overallGrade = 'A';
      } else if (averageGpa >= 3.0) {
        overallGrade = 'B';
      } else if (averageGpa >= 2.0) {
        overallGrade = 'C';
      } else if (averageGpa >= 1.0) {
        overallGrade = 'D';
      }

      return {
        student: studentData,
        academicRecords: records,
        total: records.length,
        averageGpa,
        overallGrade,
      };
    } catch (error) {
      this.logger.error('Error getting student academic records:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get student academic records',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStudentAttendance(
    parentUserId: string,
    studentId: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      // First verify that the parent has access to this student
      const parentChildren = await this.getParentChildren(parentUserId);
      const hasAccess = parentChildren.children.some(child => child.id === studentId);
      
      if (!hasAccess) {
        throw new HttpException(
          'Access denied - not authorized to view this student',
          HttpStatus.FORBIDDEN,
        );
      }

      // Build where clause for attendance records
      const whereClause: any = {
        studentId: studentId,
      };

      if (startDate) {
        whereClause.date = {
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        whereClause.date = {
          ...whereClause.date,
          lte: new Date(endDate),
        };
      }

      // Get attendance records for the specific student
      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  profilePicture: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
              currentClass: {
                select: {
                  id: true,
                  name: true,
                },
              },
              currentLevel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      if (attendanceRecords.length === 0) {
        throw new HttpException(
          'No attendance records found for this student',
          HttpStatus.NOT_FOUND,
        );
      }

      const student = attendanceRecords[0].student;
      const studentData = {
        id: student.id,
        studentNumber: student.studentNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        phone: student.user.phone,
        avatar: student.user.profilePicture,
        status: student.status,
        currentClass: student.currentClass.name,
        currentLevel: student.currentLevel.name,
        academicYear: student.academicYear,
        enrollmentDate: student.enrollmentDate,
        school: student.school,
      };

      const records = attendanceRecords.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        notes: record.notes,
        class: record.class,
        subject: record.subject,
      }));

      // Calculate attendance statistics
      const presentDays = records.filter(record => record.status === 'PRESENT').length;
      const absentDays = records.filter(record => record.status === 'ABSENT').length;
      const lateDays = records.filter(record => record.status === 'LATE').length;
      const attendancePercentage = Math.round((presentDays / records.length) * 100);

      return {
        student: studentData,
        attendanceRecords: records,
        total: records.length,
        attendancePercentage,
        presentDays,
        absentDays,
        lateDays,
      };
    } catch (error) {
      this.logger.error('Error getting student attendance:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get student attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
