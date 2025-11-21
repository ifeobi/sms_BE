import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryFinancialsDto } from './dto/query-financials.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, createPaymentDto: CreatePaymentDto) {
    // Check if reference already exists
    const existing = await this.prisma.payment.findUnique({
      where: { reference: createPaymentDto.reference },
    });

    if (existing) {
      throw new BadRequestException('Payment reference already exists');
    }

    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        schoolId,
        currency: createPaymentDto.currency || 'NGN',
        status: createPaymentDto.paidAt ? 'COMPLETED' : 'PENDING',
      },
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
        payer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        invoice: true,
      },
    });
  }

  async findAll(schoolId: string, query: QueryFinancialsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentMethod,
      type,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      schoolId,
    };

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { student: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { student: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
        { payer: { firstName: { contains: search, mode: 'insensitive' } } },
        { payer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
          payer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          invoice: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
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
        payer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        invoice: true,
        refunds: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const payment = await this.findOne(id);

    const updateData: any = {
      status,
    };

    if (status === 'COMPLETED' && !payment.paidAt) {
      updateData.paidAt = new Date();
    }

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
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
        payer: {
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

  async getStats(schoolId: string, startDate?: string, endDate?: string) {
    const where: any = { schoolId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [total, completed, pending, failed, totalAmount, completedAmount] =
      await Promise.all([
        this.prisma.payment.count({ where }),
        this.prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.payment.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.payment.count({ where: { ...where, status: 'FAILED' } }),
        this.prisma.payment.aggregate({
          where,
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ]);

    return {
      total,
      completed,
      pending,
      failed,
      totalAmount: totalAmount._sum.amount || 0,
      completedAmount: completedAmount._sum.amount || 0,
    };
  }
}

