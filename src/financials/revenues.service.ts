import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { QueryFinancialsDto } from './dto/query-financials.dto';

@Injectable()
export class RevenuesService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, userId: string, createRevenueDto: CreateRevenueDto) {
    return this.prisma.revenue.create({
      data: {
        ...createRevenueDto,
        schoolId,
        createdBy: userId,
        currency: createRevenueDto.currency || 'NGN',
        date: new Date(createRevenueDto.date),
      },
      include: {
        creator: {
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

  async findAll(schoolId: string, query: QueryFinancialsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = { schoolId };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { source: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.revenue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.revenue.count({ where }),
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
    const revenue = await this.prisma.revenue.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!revenue) {
      throw new NotFoundException(`Revenue with ID ${id} not found`);
    }

    return revenue;
  }
}

