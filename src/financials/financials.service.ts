import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(schoolId: string, startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.lte = new Date(endDate);
      }
    }

    const [totalRevenue, totalExpenses, outstandingFees, completedPayments] =
      await Promise.all([
        // Total Revenue (completed payments + revenues)
        this.prisma.payment.aggregate({
          where: {
            schoolId,
            status: 'COMPLETED',
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
        this.prisma.revenue.aggregate({
          where: {
            schoolId,
            status: 'RECEIVED',
            ...(startDate || endDate
              ? {
                  date: {
                    ...(startDate ? { gte: new Date(startDate) } : {}),
                    ...(endDate ? { lte: new Date(endDate) } : {}),
                  },
                }
              : {}),
          },
          _sum: { amount: true },
        }),
        // Total Expenses
        this.prisma.expense.aggregate({
          where: {
            schoolId,
            status: 'APPROVED',
            ...(startDate || endDate
              ? {
                  date: {
                    ...(startDate ? { gte: new Date(startDate) } : {}),
                    ...(endDate ? { lte: new Date(endDate) } : {}),
                  },
                }
              : {}),
          },
          _sum: { amount: true },
        }),
        // Outstanding Fees (pending payments)
        this.prisma.payment.aggregate({
          where: {
            schoolId,
            status: 'PENDING',
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
      ]);

    const revenue = (totalRevenue._sum.amount || 0) + (completedPayments._sum.amount || 0);
    const expenses = totalExpenses._sum.amount || 0;
    const outstanding = outstandingFees._sum.amount || 0;
    const profit = revenue - expenses;

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit: profit,
      outstandingFees: outstanding,
    };
  }

  async getAnalytics(schoolId: string, startDate: string, endDate: string) {
    // Revenue by category
    const revenueByCategory = await this.prisma.revenue.groupBy({
      by: ['category'],
      where: {
        schoolId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: { amount: true },
    });

    // Expenses by category
    const expensesByCategory = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        schoolId,
        status: 'APPROVED',
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: { amount: true },
    });

    // Monthly trends
    const monthlyRevenue = await this.prisma.revenue.findMany({
      where: {
        schoolId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        date: true,
        amount: true,
      },
    });

    const monthlyExpenses = await this.prisma.expense.findMany({
      where: {
        schoolId,
        status: 'APPROVED',
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        date: true,
        amount: true,
      },
    });

    return {
      revenueByCategory,
      expensesByCategory,
      monthlyRevenue,
      monthlyExpenses,
    };
  }
}

