import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async login(email: string) {
    // ✅ počkáme, kým sa načítajú všetci používatelia
    const users = await this.userService.findAll();

    // 🔎 teraz už users je normálne pole (nie Promise)
    const user = users.find((u) => u.email === email);

    if (!user) {
      // ❌ používateľ neexistuje
      return { message: 'User not found' };
    }

    // ✅ úspešné prihlásenie
    return { message: `Welcome back, ${user.name}!` };
  }
}
