import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @Length(8, 72)
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecret456!', minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72)
  newPassword!: string;
}
