import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    login(email: string): Promise<{
        message: string;
    }>;
}
