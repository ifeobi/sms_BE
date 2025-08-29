"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let StaffService = class StaffService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createStaffDto) {
        const { schoolId, userType, subjects, ...userData } = createStaffDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: userData.email,
                type: userType,
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists for this user type');
        }
        if (userType === 'TEACHER') {
            const existingTeacher = await this.prisma.teacher.findUnique({
                where: { employeeNumber: userData.employeeNumber },
            });
            if (existingTeacher) {
                throw new common_1.ConflictException('Employee number already exists');
            }
        }
        const defaultPassword = 'changeme123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const user = await this.prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                type: userType,
                firstName: userData.firstName,
                lastName: userData.lastName,
                fullName: `${userData.firstName} ${userData.lastName}`,
                phone: userData.phone,
                isActive: userData.isActive ?? true,
            },
        });
        if (userType === 'TEACHER') {
            const teacher = await this.prisma.teacher.create({
                data: {
                    userId: user.id,
                    schoolId,
                    employeeNumber: userData.employeeNumber,
                    department: userData.department,
                },
                include: {
                    user: true,
                    school: true,
                },
            });
            if (subjects && subjects.length > 0) {
                console.log('Subjects to assign:', subjects);
            }
            return teacher;
        }
        else if (userType === 'SCHOOL_ADMIN') {
            const schoolAdmin = await this.prisma.schoolAdmin.create({
                data: {
                    userId: user.id,
                    schoolId,
                    role: userData.role,
                },
                include: {
                    user: true,
                    school: true,
                },
            });
            return schoolAdmin;
        }
        throw new Error('Invalid user type');
    }
    async findAll(schoolId) {
        const teachers = await this.prisma.teacher.findMany({
            where: { schoolId },
            include: {
                user: true,
                school: true,
                teacherAssignments: {
                    include: {
                        subject: true,
                        class: true,
                    },
                },
            },
        });
        const schoolAdmins = await this.prisma.schoolAdmin.findMany({
            where: { schoolId },
            include: {
                user: true,
                school: true,
            },
        });
        return {
            teachers,
            schoolAdmins,
        };
    }
    async findOne(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: true,
                school: true,
                teacherAssignments: {
                    include: {
                        subject: true,
                        class: true,
                    },
                },
            },
        });
        if (teacher) {
            return teacher;
        }
        const schoolAdmin = await this.prisma.schoolAdmin.findUnique({
            where: { id },
            include: {
                user: true,
                school: true,
            },
        });
        if (schoolAdmin) {
            return schoolAdmin;
        }
        throw new common_1.NotFoundException('Staff member not found');
    }
    async update(id, updateStaffDto) {
        const { userType, subjects, ...updateData } = updateStaffDto;
        const staff = await this.findOne(id);
        if (updateData.firstName ||
            updateData.lastName ||
            updateData.email ||
            updateData.phone) {
            await this.prisma.user.update({
                where: { id: staff.userId },
                data: {
                    ...(updateData.firstName && { firstName: updateData.firstName }),
                    ...(updateData.lastName && { lastName: updateData.lastName }),
                    ...(updateData.firstName &&
                        updateData.lastName && {
                        fullName: `${updateData.firstName} ${updateData.lastName}`,
                    }),
                    ...(updateData.email && { email: updateData.email }),
                    ...(updateData.phone && { phone: updateData.phone }),
                },
            });
        }
        if ('employeeNumber' in staff) {
            await this.prisma.teacher.update({
                where: { id },
                data: {
                    ...(updateData.employeeNumber && {
                        employeeNumber: updateData.employeeNumber,
                    }),
                    ...(updateData.department && { department: updateData.department }),
                },
            });
        }
        else {
            await this.prisma.schoolAdmin.update({
                where: { id },
                data: {
                    ...(updateData.role && { role: updateData.role }),
                },
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        const staff = await this.findOne(id);
        await this.prisma.user.delete({
            where: { id: staff.userId },
        });
        return { message: 'Staff member deleted successfully' };
    }
    async findBySchool(schoolId) {
        return this.findAll(schoolId);
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map