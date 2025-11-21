import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async generateInvoice(schoolId: string, studentId: string, feeStructureId: string) {
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
    });

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    if (feeStructure.schoolId !== schoolId) {
      throw new NotFoundException('Fee structure not found for this school');
    }

    // Generate invoice number
    const invoiceNumber = `INV-${schoolId.slice(0, 4)}-${Date.now()}`;

    return this.prisma.invoice.create({
      data: {
        schoolId,
        studentId,
        feeStructureId,
        invoiceNumber,
        amount: feeStructure.amount,
        currency: feeStructure.currency,
        dueDate: feeStructure.dueDate || new Date(),
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
        feeStructure: true,
      },
    });
  }

  async findAll(schoolId: string, studentId?: string, status?: string) {
    const where: any = { schoolId };
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    if (status) {
      where.status = status;
    }

    return this.prisma.invoice.findMany({
      where,
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
        feeStructure: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
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
        feeStructure: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }
}

