import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables manually
dotenv.config();
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

async function bootstrap() {
  const logger = new Logger('Main');

  // // Set default DATABASE_URL if not found in environment
  // if (!process.env.DATABASE_URL) {
  //   logger.warn(
  //     'No DATABASE_URL found in environment, using default PostgreSQL connection',
  //   );
  //   process.env.DATABASE_URL =
  //     'postgresql://postgres:AtlasisgoingLive@localhost:5432/sms_db?schema=public';
  // }

  // Add BigInt serializer to handle JSON serialization
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/images/',
  });

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
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints || {};
          return `${error.property}: ${Object.values(constraints).join(', ')}`;
        });
        const message = messages.join('; ');
        logger.error(`Validation failed: ${message}`);
        logger.error(`Validation errors: ${JSON.stringify(errors, null, 2)}`);
        return new BadRequestException({
          message: `Validation failed: ${message}`,
          errors: errors,
        });
      },
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

  logger.log(`🚀 Application is running`);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(
    `Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'Not set'}`,
  );
  logger.log('✅ Application startup completed successfully');
}
bootstrap();
