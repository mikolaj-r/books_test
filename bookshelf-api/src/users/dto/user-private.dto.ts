import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums';
import { UserPublicDto } from './user-public.dto';

export class UserPrivateDto extends UserPublicDto {
  email!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  updatedAt!: Date;
}
