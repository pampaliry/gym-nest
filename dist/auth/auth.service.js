"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
void common_1.ConflictException;
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async register(dto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = {
            id: Date.now(),
            name: dto.name,
            email: dto.email,
            role: dto.role || 'member',
            password: hashedPassword,
            verified: false,
        };
        const verifyToken = this.jwtService.sign({ email: user.email }, { expiresIn: '1d' });
        console.log(`[VERIFY EMAIL] http://localhost:3001/api/auth/verify-email?token=${verifyToken}`);
        const payload = {
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
    async login(dto) {
        const user = {
            id: 1,
            name: 'John Doe',
            email: dto.email,
            password: await bcrypt.hash('secret123', 10),
            role: 'member',
            verified: true,
        };
        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.verified)
            throw new common_1.UnauthorizedException('Email not verified');
        const payload = {
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
    forgotPassword(dto) {
        if (dto.email !== 'demo@example.com')
            throw new common_1.NotFoundException('User not found');
        const resetToken = this.jwtService.sign({ email: dto.email }, { expiresIn: '15m' });
        console.log(`[RESET PASSWORD] http://localhost:3001/api/auth/reset-password?token=${resetToken}`);
        return { message: 'Password reset link sent to email.' };
    }
    async resetPassword(dto) {
        try {
            const payload = this.jwtService.verify(dto.token);
            const newHash = await bcrypt.hash(dto.newPassword, 10);
            console.log(`[PASSWORD UPDATED] for ${payload.email} with hash ${newHash}`);
            return { message: 'Password updated successfully.' };
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
    }
    verifyEmail(dto) {
        try {
            const payload = this.jwtService.verify(dto.token);
            console.log(`[EMAIL VERIFIED] ${payload.email}`);
            return { message: 'Email verified successfully.' };
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
    }
    logout() {
        return { message: 'User logged out successfully (client deletes token).' };
    }
    getProfile(user) {
        return {
            id: user?.id || 1,
            name: 'Demo User',
            email: 'demo@example.com',
            role: 'member',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map