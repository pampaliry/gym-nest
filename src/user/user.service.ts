import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User as PrismaUser, Role } from '.prisma/client'; // ✨ pridaj Role
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // 🧠 Získa všetkých používateľov
  async findAll(): Promise<PrismaUser[]> {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // 🔍 Nájde používateľa podľa ID
  async findOne(id: number): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // 🪝 Nájde používateľa podľa emailu
  async findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 🪝 Vytvor používateľa (používa Auth.register)
  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role; // ⚙️ enum, nie string
  }): Promise<PrismaUser> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? Role.MEMBER, // ✅ správne typovanie
        verified: false,
      },
    });
  }

  // 🪝 Aktualizuj heslo
  async updatePassword(
    id: number,
    newHashedPassword: string,
  ): Promise<PrismaUser> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { password: newHashedPassword },
    });
  }

  // 🪝 Označ ako overeného
  async markAsVerified(id: number): Promise<PrismaUser> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { verified: true },
    });
  }
}
