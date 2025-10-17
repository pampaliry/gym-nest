///token-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({
    example: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
    },
  })
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
