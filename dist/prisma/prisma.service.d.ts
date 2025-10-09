<<<<<<< HEAD
import { OnModuleDestroy, OnModuleInit, INestApplication } from '@nestjs/common';
=======
import { OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
>>>>>>> dist
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enableShutdownHooks(app: INestApplication): void;
}
