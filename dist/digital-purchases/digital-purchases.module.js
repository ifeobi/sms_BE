"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalPurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const digital_purchases_service_1 = require("./digital-purchases.service");
const streaming_service_1 = require("./streaming.service");
const digital_purchases_controller_1 = require("./digital-purchases.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const imagekit_module_1 = require("../imagekit/imagekit.module");
let DigitalPurchasesModule = class DigitalPurchasesModule {
};
exports.DigitalPurchasesModule = DigitalPurchasesModule;
exports.DigitalPurchasesModule = DigitalPurchasesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, imagekit_module_1.ImageKitModule],
        controllers: [digital_purchases_controller_1.DigitalPurchasesController],
        providers: [digital_purchases_service_1.DigitalPurchasesService, streaming_service_1.StreamingService],
        exports: [digital_purchases_service_1.DigitalPurchasesService, streaming_service_1.StreamingService],
    })
], DigitalPurchasesModule);
//# sourceMappingURL=digital-purchases.module.js.map