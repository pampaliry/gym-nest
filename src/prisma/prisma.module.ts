///prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // dostupné vo všetkých moduloch bez importovania
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
