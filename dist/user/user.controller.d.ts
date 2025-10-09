import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): Promise<{
        name: string;
        id: number;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        verified: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        verified: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    } | null>;
}
