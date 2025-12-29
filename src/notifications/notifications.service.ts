import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Check and send assignment reminders daily at 8 AM
   * Sends reminders for assignments due in the next 24-48 hours
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendAssignmentReminders() {
    this.logger.log('Starting assignment reminders check...');

    try {
      // Get all active assignments due in the next 24-48 hours
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(23, 59, 59, 999);

      const upcomingAssignments = await this.prisma.assignment.findMany({
        where: {
          isActive: true,
          dueDate: {
            gte: tomorrow,
            lte: dayAfterTomorrow,
          },
        },
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
          class: true,
          subject: true,
        },
      });

      this.logger.log(`Found ${upcomingAssignments.length} assignments due soon`);

      for (const assignment of upcomingAssignments) {
        const teacher = assignment.teacher;
        if (!teacher?.user) continue;

        // Check teacher's notification preferences
        const settings = await this.prisma.userSettings.findUnique({
          where: { userId: teacher.user.id },
        });

        const notifications = settings?.notifications as any;
        if (
          !notifications?.emailNotifications ||
          !notifications?.assignmentReminders
        ) {
          this.logger.debug(
            `Skipping assignment reminder for teacher ${teacher.user.id} - preferences disabled`,
          );
          continue;
        }

        // Send email reminder
        await this.emailService.sendAssignmentReminderEmail({
          to: teacher.user.email,
          teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description,
          dueDate: assignment.dueDate,
          className: assignment.class.name,
          subjectName: assignment.subject.name,
        });

        this.logger.log(
          `Assignment reminder sent to ${teacher.user.email} for "${assignment.title}"`,
        );
      }

      this.logger.log('Assignment reminders check completed');
    } catch (error) {
      this.logger.error('Error sending assignment reminders:', error);
    }
  }

  /**
   * Send weekly summary every Monday at 9 AM
   */
  @Cron('0 9 * * 1') // Every Monday at 9 AM
  async sendWeeklySummaries() {
    this.logger.log('Starting weekly summaries...');

    try {
      const teachers = await this.prisma.teacher.findMany({
        where: { isActive: true },
        include: {
          user: true,
          teacherAssignments: {
            where: { isActive: true },
            include: {
              class: true,
              subject: true,
            },
          },
        },
      });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const teacher of teachers) {
        if (!teacher.user) continue;

        // Check teacher's notification preferences
        const settings = await this.prisma.userSettings.findUnique({
          where: { userId: teacher.user.id },
        });

        const notifications = settings?.notifications as any;
        if (!notifications?.emailNotifications || !notifications?.weeklySummary) {
          this.logger.debug(
            `Skipping weekly summary for teacher ${teacher.user.id} - preferences disabled`,
          );
          continue;
        }

        // Get weekly statistics
        const assignmentsCreated = await this.prisma.assignment.count({
          where: {
            teacherId: teacher.id,
            createdAt: { gte: oneWeekAgo },
          },
        });

        const assignmentsGraded = await this.prisma.assignmentGrade.count({
          where: {
            teacherId: teacher.id,
            gradedAt: { gte: oneWeekAgo },
          },
        });

        const attendanceRecords = await this.prisma.attendanceRecord.count({
          where: {
            teacherId: teacher.id,
            recordedAt: { gte: oneWeekAgo },
          },
        });

        // Send weekly summary email
        await this.emailService.sendWeeklySummaryEmail({
          to: teacher.user.email,
          teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
          weekStartDate: oneWeekAgo,
          assignmentsCreated,
          assignmentsGraded,
          attendanceRecords,
          classesTaught: teacher.teacherAssignments.length,
        });

        this.logger.log(`Weekly summary sent to ${teacher.user.email}`);
      }

      this.logger.log('Weekly summaries completed');
    } catch (error) {
      this.logger.error('Error sending weekly summaries:', error);
    }
  }

  /**
   * Check for class updates (runs every hour)
   * This would be triggered when class assignments change
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkClassUpdates() {
    this.logger.log('Checking for class updates...');
    // This would be implemented to check for changes in teacher assignments
    // For now, we'll implement it as a manual trigger or event-based
  }

  /**
   * Send notification when a parent sends a message
   * This should be called manually when a message is sent
   */
  async sendParentCommunicationNotification(
    teacherUserId: string,
    parentName: string,
    messagePreview: string,
  ) {
    try {
      const settings = await this.prisma.userSettings.findUnique({
        where: { userId: teacherUserId },
      });

      const notifications = settings?.notifications as any;
      if (
        !notifications?.emailNotifications ||
        !notifications?.parentCommunications
      ) {
        this.logger.debug(
          `Skipping parent communication notification for teacher ${teacherUserId} - preferences disabled`,
        );
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: teacherUserId },
      });

      if (!user) {
        this.logger.error(`User not found: ${teacherUserId}`);
        return;
      }

      await this.emailService.sendParentCommunicationEmail({
        to: user.email,
        teacherName: `${user.firstName} ${user.lastName}`,
        parentName,
        messagePreview,
      });

      this.logger.log(
        `Parent communication notification sent to ${user.email}`,
      );
    } catch (error) {
      this.logger.error('Error sending parent communication notification:', error);
    }
  }
}

