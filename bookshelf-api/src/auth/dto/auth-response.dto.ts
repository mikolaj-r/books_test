import { ApiProperty } from '@nestjs/swagger';
import { UserPrivateDto } from '../../users/dto/user-private.dto';

export class AuthResponseDto {
  accessToken!: string;

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
