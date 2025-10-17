import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

void ConflictException;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    // private readonly prisma: PrismaService, // neskôr
  ) {}

  // 🧠 REGISTER
  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    // 1️⃣ (Neskôr) kontrola duplicitného emailu
    // const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // if (existing) throw new ConflictException('Email already exists');

    // 2️⃣ Hash hesla
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3️⃣ Mock používateľ (dočasne)
    const user = {
      id: Date.now(),
      name: dto.name,
      email: dto.email,
      role: dto.role || 'member',
      password: hashedPassword,
      verified: false,
    };

    // 4️⃣ Token na verifikáciu emailu (1 deň)
    const verifyToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '1d' },
    );
    console.log(
      `[VERIFY EMAIL] http://localhost:3001/api/auth/verify-email?token=${verifyToken}`,
    );

    // 5️⃣ JWT access token (po registrácii môžeš nechať používateľa prihláseného)
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 🔐 LOGIN
  async login(dto: LoginDto): Promise<TokenResponseDto> {
    // (Neskôr: získanie používateľa z DB)
    const user = {
      id: 1,
      name: 'John Doe',
      email: dto.email,
      password: await bcrypt.hash('secret123', 10),
      role: 'member',
      verified: true,
    };

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.verified) throw new UnauthorizedException('Email not verified');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 📧 FORGOT PASSWORD
  forgotPassword(dto: ForgotPasswordDto) {
    // (Neskôr: find user by email)
    if (dto.email !== 'demo@example.com')
      throw new NotFoundException('User not found');

    const resetToken = this.jwtService.sign(
      { email: dto.email },
      { expiresIn: '15m' },
    );
    console.log(
      `[RESET PASSWORD] http://localhost:3001/api/auth/reset-password?token=${resetToken}`,
    );

    return { message: 'Password reset link sent to email.' };
  }

  // 🔑 RESET PASSWORD
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token);
      const newHash = await bcrypt.hash(dto.newPassword, 10);
      console.log(
        `[PASSWORD UPDATED] for ${payload.email} with hash ${newHash}`,
      );
      // (Neskôr: update hesla v DB)
      return { message: 'Password updated successfully.' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  // ✅ VERIFY EMAIL
  verifyEmail(dto: VerifyEmailDto) {
    try {
      const payload = this.jwtService.verify(dto.token);
      console.log(`[EMAIL VERIFIED] ${payload.email}`);
      // (Neskôr: mark user as verified in DB)
      return { message: 'Email verified successfully.' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  // 🚪 LOGOUT
  logout() {
    return { message: 'User logged out successfully (client deletes token).' };
  }

  // 📊 STATUS
  getProfile(user: any) {
    return {
      id: user?.id || 1,
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'member',
    };
  }
}
