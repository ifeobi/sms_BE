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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            email: user.email,
            sub: user.id,
            type: user.type,
            firstName: user.firstName,
            lastName: user.lastName
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                type: user.type,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });
        const payload = {
            email: user.email,
            sub: user.id,
            type: user.type,
            firstName: user.firstName,
            lastName: user.lastName
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                type: user.type,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
            },
        };
    }
    async createMasterAccount() {
        const masterEmail = 'master@sms.com';
        const existingMaster = await this.usersService.findByEmail(masterEmail);
        if (existingMaster) {
            return { message: 'Master account already exists' };
        }
        const hashedPassword = await bcrypt.hash('master123', 10);
        const masterUser = await this.usersService.create({
            email: masterEmail,
            password: hashedPassword,
            firstName: 'Master',
            lastName: 'Admin',
            type: create_user_dto_1.UserType.MASTER,
            isActive: true,
        });
        return {
            message: 'Master account created successfully',
            credentials: {
                email: masterEmail,
                password: 'master123',
            },
            user: {
                id: masterUser.id,
                email: masterUser.email,
                type: masterUser.type,
                firstName: masterUser.firstName,
                lastName: masterUser.lastName,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map