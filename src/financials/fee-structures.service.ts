import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';

@Injectable()
export class FeeStructuresService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, createFeeStructureDto: CreateFeeStructureDto) {
    return this.prisma.feeStructure.create({
      data: {
        ...createFeeStructureDto,
        schoolId,
        currency: createFeeStructureDto.currency || 'NGN',
        dueDate: createFeeStructureDto.dueDate ? new Date(createFeeStructureDto.dueDate) : null,
      },
    });
  }

  async findAll(schoolId: string, academicYear?: string, isActive?: boolean) {
    const where: any = { schoolId };
    
    if (academicYear) {
      where.academicYear = academicYear;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.feeStructure.findMany({
      where,
      orderBy: [
        { academicYear: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id },
      include: {
        invoices: true,
      },
    });

    if (!feeStructure) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }

    return feeStructure;
  }

  async update(id: string, updateData: Partial<CreateFeeStructureDto>) {
    await this.findOne(id);

    const data: any = { ...updateData };
    if (updateData.dueDate) {
      data.dueDate = new Date(updateData.dueDate);
    }

    return this.prisma.feeStructure.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.feeStructure.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

