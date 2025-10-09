import { PrismaService } from '../prisma/prisma.service';
import { User as PrismaUser } from '.prisma/client';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<PrismaUser[]>;
    findOne(id: number): Promise<PrismaUser | null>;
}
