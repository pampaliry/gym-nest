import { PrismaService } from '../prisma/prisma.service';
import { User as PrismaUser, Role } from '.prisma/client';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<PrismaUser[]>;
    findOne(id: number): Promise<PrismaUser | null>;
    findByEmail(email: string): Promise<PrismaUser | null>;
    create(data: {
        name: string;
        email: string;
        password: string;
        role?: Role;
    }): Promise<PrismaUser>;
    updatePassword(id: number, newHashedPassword: string): Promise<PrismaUser>;
    markAsVerified(id: number): Promise<PrismaUser>;
}
