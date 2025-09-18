import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { MessageResponseDto, AnnouncementResponseDto } from './dto/communication-response.dto';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  // ==================== MESSAGE OPERATIONS ====================

  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<MessageResponseDto> {
    const { recipientId, subject, content, type, priority, parentMessageId, attachments, metadata } = createMessageDto;

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // If this is a reply, verify parent message exists
    if (parentMessageId) {
      const parentMessage = await this.prisma.message.findUnique({
        where: { id: parentMessageId },
      });

      if (!parentMessage) {
        throw new NotFoundException('Parent message not found');
      }
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        subject,
        content,
        type: type || 'MESSAGE',
        priority: priority || 'NORMAL',
        parentMessageId,
        attachments: attachments || [],
        metadata: metadata || {},
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapMessageToResponse(message);
  }

  async getUserMessages(userId: string, page: number = 1, limit: number = 20): Promise<MessageResponseDto[]> {
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return messages.map(message => this.mapMessageToResponse(message));
  }

  async getInboxMessages(userId: string, page: number = 1, limit: number = 20): Promise<MessageResponseDto[]> {
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        recipientId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return messages.map(message => this.mapMessageToResponse(message));
  }

  async getSentMessages(userId: string, page: number = 1, limit: number = 20): Promise<MessageResponseDto[]> {
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return messages.map(message => this.mapMessageToResponse(message));
  }

  async markMessageAsRead(userId: string, messageId: string): Promise<MessageResponseDto> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.recipientId !== userId) {
      throw new ForbiddenException('You can only mark your own messages as read');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapMessageToResponse(updatedMessage);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  // ==================== ANNOUNCEMENT OPERATIONS ====================

  async createAnnouncement(schoolId: string, createAnnouncementDto: CreateAnnouncementDto): Promise<AnnouncementResponseDto> {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      targetClassIds,
      targetStudentIds,
      scheduledAt,
      expiresAt,
      attachments,
      metadata,
    } = createAnnouncementDto;

    const announcement = await this.prisma.announcement.create({
      data: {
        schoolId,
        title,
        content,
        type: type || 'GENERAL',
        priority: priority || 'NORMAL',
        targetAudience: targetAudience || 'ALL_PARENTS',
        targetClassIds: targetClassIds || [],
        targetStudentIds: targetStudentIds || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        attachments: attachments || [],
        metadata: metadata || {},
        isPublished: !scheduledAt, // Auto-publish if not scheduled
        publishedAt: !scheduledAt ? new Date() : null,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return this.mapAnnouncementToResponse(announcement);
  }

  async getSchoolAnnouncements(schoolId: string, page: number = 1, limit: number = 20): Promise<AnnouncementResponseDto[]> {
    const skip = (page - 1) * limit;

    const announcements = await this.prisma.announcement.findMany({
      where: {
        schoolId,
        isPublished: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    return announcements.map(announcement => this.mapAnnouncementToResponse(announcement));
  }

  async getParentAnnouncements(parentId: string, page: number = 1, limit: number = 20): Promise<AnnouncementResponseDto[]> {
    const skip = (page - 1) * limit;

    // Get parent's school relationships
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentId },
      include: {
        schoolRelationships: {
          include: {
            children: {
              select: {
                schoolId: true,
                currentClassId: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    // Get unique school IDs
    const schoolIds = new Set<string>();
    parent.schoolRelationships.forEach(relationship => {
      relationship.children.forEach(child => {
        schoolIds.add(child.schoolId);
      });
    });

    if (schoolIds.size === 0) {
      return [];
    }

    const announcements = await this.prisma.announcement.findMany({
      where: {
        schoolId: { in: Array.from(schoolIds) },
        isPublished: true,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          {
            OR: [
              { targetAudience: 'ALL_PARENTS' },
              { targetAudience: 'SCHOOL_WIDE' },
            ],
          },
        ],
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    return announcements.map(announcement => this.mapAnnouncementToResponse(announcement));
  }

  // ==================== RECIPIENTS METHODS ====================

  async getParentRecipients(parentId: string): Promise<any[]> {
    // Get parent's school relationships
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentId },
      include: {
        schoolRelationships: {
          include: {
            school: {
              include: {
                schoolAdmins: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        type: true,
                        profilePicture: true,
                      },
                    },
                  },
                },
                teachers: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        type: true,
                        profilePicture: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return [];
    }

    const recipients = new Map();

    // Add teachers and school admins from all schools the parent is connected to
    parent.schoolRelationships.forEach(relationship => {
      const school = relationship.school;

      // Add school admins
      school.schoolAdmins.forEach(admin => {
        if (admin.user) {
          recipients.set(admin.user.id, {
            id: admin.user.id,
            name: `${admin.user.firstName} ${admin.user.lastName}`,
            email: admin.user.email,
            type: admin.user.type,
            role: 'School Admin',
            subject: 'Administration',
            school: school.name,
            profilePicture: admin.user.profilePicture,
          });
        }
      });

      // Add teachers
      school.teachers.forEach(teacher => {
        if (teacher.user) {
          recipients.set(teacher.user.id, {
            id: teacher.user.id,
            name: `${teacher.user.firstName} ${teacher.user.lastName}`,
            email: teacher.user.email,
            type: teacher.user.type,
            role: 'Teacher',
            subject: 'General',
            school: school.name,
            profilePicture: teacher.user.profilePicture,
          });
        }
      });
    });

    return Array.from(recipients.values());
  }

  async getTeacherRecipients(teacherId: string): Promise<any[]> {
    // Get teacher's school and all parents in that school
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: {
        school: {
          include: {
            parents: {
              include: {
                parent: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        type: true,
                        profilePicture: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return [];
    }

    const recipients = new Map();

    // Add parents from the teacher's school
    teacher.school.parents.forEach(parentRelationship => {
      if (parentRelationship.parent?.user) {
        recipients.set(parentRelationship.parent.user.id, {
          id: parentRelationship.parent.user.id,
          name: `${parentRelationship.parent.user.firstName} ${parentRelationship.parent.user.lastName}`,
          email: parentRelationship.parent.user.email,
          type: parentRelationship.parent.user.type,
          role: 'Parent',
          subject: 'Parent Communication',
          school: teacher.school.name,
          profilePicture: parentRelationship.parent.user.profilePicture,
        });
      }
    });

    return Array.from(recipients.values());
  }

  async getSchoolAdminRecipients(adminId: string): Promise<any[]> {
    // Get school admin's school and all parents/teachers
    const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
      where: { userId: adminId },
      include: {
        school: {
          include: {
            parents: {
              include: {
                parent: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        type: true,
                        profilePicture: true,
                      },
                    },
                  },
                },
              },
            },
            teachers: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    type: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!schoolAdmin) {
      return [];
    }

    const recipients: any[] = [];

    // Add parents
    schoolAdmin.school.parents.forEach(parentRelationship => {
      if (parentRelationship.parent?.user) {
        recipients.push({
          id: parentRelationship.parent.user.id,
          name: `${parentRelationship.parent.user.firstName} ${parentRelationship.parent.user.lastName}`,
          email: parentRelationship.parent.user.email,
          type: parentRelationship.parent.user.type,
          role: 'Parent',
          subject: 'Parent Communication',
          school: schoolAdmin.school.name,
          profilePicture: parentRelationship.parent.user.profilePicture,
        });
      }
    });

    // Add teachers
    schoolAdmin.school.teachers.forEach(teacher => {
      if (teacher.user) {
        recipients.push({
          id: teacher.user.id,
          name: `${teacher.user.firstName} ${teacher.user.lastName}`,
          email: teacher.user.email,
          type: teacher.user.type,
          role: 'Teacher',
          subject: 'General',
          school: schoolAdmin.school.name,
          profilePicture: teacher.user.profilePicture,
        });
      }
    });

    return recipients;
  }

  // ==================== HELPER METHODS ====================

  private mapMessageToResponse(message: any): MessageResponseDto {
    return {
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      subject: message.subject,
      content: message.content,
      type: message.type,
      priority: message.priority,
      isRead: message.isRead,
      readAt: message.readAt,
      parentMessageId: message.parentMessageId,
      attachments: message.attachments,
      metadata: message.metadata,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: message.sender,
      recipient: message.recipient,
    };
  }

  private mapAnnouncementToResponse(announcement: any): AnnouncementResponseDto {
    return {
      id: announcement.id,
      schoolId: announcement.schoolId,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      targetClassIds: announcement.targetClassIds,
      targetStudentIds: announcement.targetStudentIds,
      isPublished: announcement.isPublished,
      scheduledAt: announcement.scheduledAt,
      publishedAt: announcement.publishedAt,
      expiresAt: announcement.expiresAt,
      attachments: announcement.attachments,
      metadata: announcement.metadata,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      school: announcement.school,
    };
  }
}
