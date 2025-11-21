import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createRefundDto: CreateRefundDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: createRefundDto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (createRefundDto.amount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    return this.prisma.refund.create({
      data: {
        ...createRefundDto,
        currency: createRefundDto.currency || payment.currency,
        requestedBy: userId,
      },
      include: {
        payment: true,
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(schoolId: string, status?: string) {
    const where: any = {
      payment: { schoolId },
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.refund.findMany({
      where,
      include: {
        payment: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, userId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.status !== 'PENDING') {
      throw new BadRequestException('Refund is not pending');
    }

    return this.prisma.refund.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
      },
      include: {
        payment: true,
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async process(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.status !== 'APPROVED') {
      throw new BadRequestException('Refund must be approved before processing');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: refund.paymentId },
      data: { status: 'REFUNDED' },
    });

    return this.prisma.refund.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
      include: {
        payment: true,
      },
    });
  }
}

