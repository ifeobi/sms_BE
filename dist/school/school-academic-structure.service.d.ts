import { PrismaService } from '../prisma/prisma.service';
import { UpdateAcademicStructureDto } from './dto/update-academic-structure.dto';
export declare class SchoolAcademicStructureService {
    private prisma;
    constructor(prisma: PrismaService);
    getAcademicStructureByUserId(userId: string): Promise<any>;
    updateAcademicStructure(userId: string, updateDto: UpdateAcademicStructureDto): Promise<any>;
}
