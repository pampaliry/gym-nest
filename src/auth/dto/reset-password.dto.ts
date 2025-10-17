//reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string; // JWT alebo náhodný reset token

  @ApiProperty()
  @MinLength(6)
  newPassword: string;
}
