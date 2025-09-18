import { SchoolAcademicStructureService } from './school-academic-structure.service';
import { UpdateAcademicStructureDto } from './dto/update-academic-structure.dto';
export declare class SchoolAcademicStructureController {
    private readonly academicStructureService;
    constructor(academicStructureService: SchoolAcademicStructureService);
    getAcademicStructure(req: any): Promise<any>;
    updateAcademicStructure(req: any, updateDto: UpdateAcademicStructureDto): Promise<any>;
}
