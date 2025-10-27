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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        console.log('=== USER CREATION DEBUG ===');
        console.log('Creating user with data:', JSON.stringify(createUserDto, null, 2));
        console.log('Data keys:', Object.keys(createUserDto));
        console.log('================================');
        try {
            const user = await this.prisma.user.create({
                data: createUserDto,
            });
            console.log('✅ User created successfully:', user.id);
            console.log('================================');
            return user;
        }
        catch (error) {
            console.error('❌ User creation failed:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Error meta:', error.meta);
            console.log('================================');
            throw error;
        }
    }
    async findAll() {
        return this.prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                email: true,
                type: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                phone: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email, type) {
        if (type) {
            return await this.prisma.user.findFirst({
                where: {
                    email: {
                        equals: email,
                        mode: 'insensitive',
                    },
                    type: type,
                },
            });
        }
        else {
            return await this.prisma.user.findFirst({
                where: {
                    email: {
                        equals: email,
                        mode: 'insensitive',
                    },
                },
            });
        }
    }
    async update(id, updateUserDto) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async findByType(type) {
        return this.prisma.user.findMany({
            where: {
                type: type,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                type: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                phone: true,
                createdAt: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map