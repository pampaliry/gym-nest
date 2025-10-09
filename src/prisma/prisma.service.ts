import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma successfully connected to PostgreSQL');
    } catch (error) {
      console.error('❌ Prisma failed to connect:', error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Prisma disconnected from PostgreSQL');
  }

  /**
   * Graceful shutdown pre Prisma ≥ v5
   * (beforeExit event sa počúva priamo cez Node process)
   */
  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      console.log('⚙️ Shutting down gracefully...');
      void app
        .close()
        .then(() => console.log('✅ NestJS closed.'))
        .catch((err) => console.error('❌ Error during shutdown:', err));
    });
  }
}
