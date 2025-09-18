"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const education_system_init_service_1 = require("./education-system/education-system-init.service");
async function bootstrap() {
    const logger = new common_1.Logger('Main');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    logger.log('='.repeat(60));
    logger.log('🎓 EDUCATION SYSTEM INITIALIZATION');
    logger.log('='.repeat(60));
    try {
        logger.log('🔄 Starting education systems initialization...');
        const educationSystemInitService = app.get(education_system_init_service_1.EducationSystemInitService);
        logger.log('✅ EducationSystemInitService retrieved successfully');
        await educationSystemInitService.initializeEducationSystems();
        logger.log('✅ Education systems initialization completed');
    }
    catch (error) {
        logger.error('❌ Failed to initialize education systems:', error);
        logger.error('Error details:', error.message);
        logger.error('Stack trace:', error.stack);
    }
    logger.log('='.repeat(60));
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('SMS API')
        .setDescription('School Management System API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
    console.log(`Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}`);
    console.log('✅ Application startup completed successfully');
}
bootstrap();
//# sourceMappingURL=main.js.map