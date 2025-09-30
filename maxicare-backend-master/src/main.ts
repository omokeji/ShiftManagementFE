import * as dotenv from 'dotenv';
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('db', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USERNAME, process.env.DB_DATABASE);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Current working directory:', process.cwd());
console.log('Env file path:', require('path').resolve('.env'));

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all endpoints
  app.enableCors();
  // Enable global validation pipe (optional but recommended for DTO validation)
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Maxicare API')
    .setDescription('API documentation for NestJS backend with authentication and user management')
    .setVersion('1.0')
    .addBearerAuth() 
    .setContact('Your Name', 'yourwebsite.com', 'youremail@example.com')
    .setTermsOfService('http://yourwebsite.com/terms')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Sets up Swagger at /docs
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT}/docs`);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();