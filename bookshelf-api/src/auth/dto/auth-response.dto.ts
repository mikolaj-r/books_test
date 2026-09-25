import { ApiProperty } from '@nestjs/swagger';
import { UserPrivateDto } from '../../users/dto/user-private.dto';

export class AuthResponseDto {
  /** JWT for the Authorization: Bearer header */
  accessToken!: string;

  /** Single-use token for POST /auth/refresh; every refresh issues a new one */
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds',
  })
  expiresIn!: number;

  user!: UserPrivateDto;
}
