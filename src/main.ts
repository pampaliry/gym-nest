import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from './all-exceptions.filter';
import basicAuth from 'express-basic-auth';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  // 1️⃣ Inicializácia NestJS aplikácie
  const app = await NestFactory.create(AppModule);

  // Prisma shutdown hooks
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // 2️⃣ Middleware – Basic Auth pre Swagger (aktivuje sa len ak je ENABLE_SWAGGER=true)
  if (process.env.ENABLE_SWAGGER === 'true') {
    app.use(
      ['/api', '/docs', '/'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER || 'admin']:
            process.env.SWAGGER_PASS || 'changeme123',
        },
      }),
    );
  }

  // 3️⃣ Globálny error filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4️⃣ Globálna validácia DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 5️⃣ Prefix pre API
  app.setGlobalPrefix('api');

  // 6️⃣ Povolenie CORS
  app.enableCors();

  // 7️⃣ Swagger konfigurácia (len ak ENABLE_SWAGGER=true)
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Gym API')
      .setDescription('REST API pre tréningový systém')
      .setVersion('1.0')
      .addTag('training')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/', app, document);
  }

  // 8️⃣ Spustenie servera
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`🚀 Gym API bezi na: http://localhost:${port}`);
  if (process.env.ENABLE_SWAGGER === 'true') {
    console.log(`📘 Swagger UI: http://localhost:${port}/`);
  } else {
    console.log('⚠️ Swagger je vypnuty (ENABLE_SWAGGER != true)');
  }
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
