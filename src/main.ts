import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EducationSystemInitService } from './education-system/education-system-init.service';

async function bootstrap() {
  const logger = new Logger('Main');

  // // Set default DATABASE_URL if not found in environment
  // if (!process.env.DATABASE_URL) {
  //   logger.warn(
  //     'No DATABASE_URL found in environment, using default PostgreSQL connection',
  //   );
  //   process.env.DATABASE_URL =
  //     'postgresql://postgres:CHRISTLike0043@localhost:5432/sms_db?schema=public';
  // }

  const app = await NestFactory.create(AppModule);

  // Initialize education systems on startup
  logger.log('='.repeat(60));
  logger.log('🎓 EDUCATION SYSTEM INITIALIZATION');
  logger.log('='.repeat(60));
  try {
    logger.log('🔄 Starting education systems initialization...');
    const educationSystemInitService = app.get(EducationSystemInitService);
    logger.log('✅ EducationSystemInitService retrieved successfully');
    await educationSystemInitService.initializeEducationSystems();
    logger.log('✅ Education systems initialization completed');
  } catch (error) {
    logger.error('❌ Failed to initialize education systems:', error);
    logger.error('Error details:', error.message);
    logger.error('Stack trace:', error.stack);
  }
  logger.log('='.repeat(60));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SMS API')
    .setDescription('School Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(
    `Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}`,
  );
  console.log('✅ Application startup completed successfully');
}
bootstrap();
