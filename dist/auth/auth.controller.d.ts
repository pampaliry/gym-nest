import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { TokenResponseDto } from './dto/token-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<TokenResponseDto>;
    login(dto: LoginDto): Promise<TokenResponseDto>;
    forgotPassword(dto: ForgotPasswordDto): {
        message: string;
    };
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): {
        message: string;
    };
    logout(): {
        message: string;
    };
    getProfile(req: any): {
        id: any;
        name: string;
        email: string;
        role: string;
    };
}
