import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService – zodpovedá za pripojenie a bezpečné
 * uzatváranie spojenia s PostgreSQL pomocou Prisma ORM.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /** Inicializuje pripojenie k databáze */
  async onModuleInit(): Promise<void> {
    await super.$connect();
    console.log('✅ Prisma successfully connected to PostgreSQL');
  }

  /** Odpojí klienta pri vypnutí aplikácie */
  async onModuleDestroy(): Promise<void> {
    await super.$disconnect();
    console.log('🛑 Prisma disconnected from PostgreSQL');
  }

  /**
   * Elegantné ukončenie aplikácie (graceful shutdown)
   * pre Prisma ≥ v5 — používa sa Node.js event „beforeExit“.
   */
  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      console.log('⚙️ Shutting down gracefully...');
      void app
        .close()
        .then(() => console.log('✅ NestJS closed.'))
        .catch((err) => console.error('❌ Error during shutdown:', err));
    });
  }
}
