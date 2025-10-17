import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🧠 REGISTER
  @Post('register')
  @ApiResponse({ status: 201, description: 'Registers a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // 🔐 LOGIN
  @Post('login')
  @ApiResponse({ status: 200, description: 'Logs in and returns access token' })
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.login(dto);
  }

  // 📧 FORGOT PASSWORD
  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Sends password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // 🔑 RESET PASSWORD
  @Post('reset-password')
  @ApiResponse({ status: 200, description: 'Resets user password using token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ✅ VERIFY EMAIL
  @Get('verify-email')
  @ApiResponse({ status: 200, description: 'Verifies user email using token' })
  verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  // 🚪 LOGOUT
  @Post('logout')
  @ApiResponse({
    status: 200,
    description: 'Logs out user (token invalidation on client)',
  })
  logout() {
    return this.authService.logout();
  }

  // 📊 PROFILE / STATUS (chránené JWT)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('status')
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user);
  }
}
