import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User as PrismaUser } from '.prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Získa všetkých používateľov z databázy
  async findAll(): Promise<PrismaUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });

    // typovo bezpečný návrat
    return users as PrismaUser[];
  }

  // Nájde používateľa podľa ID
  async findOne(id: number): Promise<PrismaUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
}
