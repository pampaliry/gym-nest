import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './all-exceptions.filter';
import basicAuth from 'express-basic-auth';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  // 🟢 1️⃣ Inicializácia NestJS aplikácie
  const app = await NestFactory.create(AppModule);

  // Prisma shutdown hooks (volá sa pri ukončení appky)
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // 🟠 2️⃣ Middleware – základná HTTP autentifikácia pre Swagger
  // (iba na root / — teda Swagger UI)
  app.use(
    '/',
    basicAuth({
      users: { admin: 'tvojeHeslo123' },
      challenge: true,
    }),
  );

  // 🔵 3️⃣ Globálny error filter – zachytáva výnimky
  app.useGlobalFilters(new AllExceptionsFilter());

  // 🟣 4️⃣ Globálna validácia DTO objektov
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 🟤 5️⃣ Prefix pre všetky API endpointy (napr. /api/users)
  app.setGlobalPrefix('api');

  // ⚪ 6️⃣ Povolenie CORS (frontend → backend)
  app.enableCors();

  // 🧩 7️⃣ Swagger konfigurácia
  const config = new DocumentBuilder()
    .setTitle('Gym API')
    .setDescription('REST API pre tréningový systém')
    .setVersion('1.0')
    .addTag('training')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 🧭 8️⃣ Swagger UI priamo na root "/"
  SwaggerModule.setup('/', app, document);

  // 🚀 9️⃣ Spustenie servera
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`🚀 Gym API beží na: http://localhost:${port}`);
  console.log(`📘 Swagger UI dostupný na: http://localhost:${port}/`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
