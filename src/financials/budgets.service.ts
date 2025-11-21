import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, createBudgetDto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        schoolId,
        currency: createBudgetDto.currency || 'NGN',
      },
    });
  }

  async findAll(schoolId: string, academicYear?: string) {
    const where: any = { schoolId };
    
    if (academicYear) {
      where.academicYear = academicYear;
    }

    return this.prisma.budget.findMany({
      where,
      orderBy: [
        { academicYear: 'desc' },
        { category: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async getBudgetVsActual(schoolId: string, academicYear: string) {
    const budgets = await this.findAll(schoolId, academicYear);
    
    const results = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await this.prisma.expense.aggregate({
          where: {
            schoolId,
            category: budget.category,
            status: 'APPROVED',
            date: {
              gte: new Date(`${academicYear.split('/')[0]}-01-01`),
              lte: new Date(`${academicYear.split('/')[1]}-12-31`),
            },
          },
          _sum: { amount: true },
        });

        const actualAmount = expenses._sum.amount || 0;
        const variance = budget.budgetedAmount - actualAmount;
        const variancePercentage = (variance / budget.budgetedAmount) * 100;

        return {
          ...budget,
          actualAmount,
          variance,
          variancePercentage,
          isOverBudget: actualAmount > budget.budgetedAmount,
        };
      })
    );

    return results;
  }
}

