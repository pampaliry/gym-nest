///user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Matúš' })
  name: string;

  @ApiProperty({ example: 'matus@example.com' })
  email: string;

  @ApiProperty({ example: 'MEMBER' })
  role: string;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: '2025-10-09T10:00:00.000Z' })
  createdAt: Date;
}
