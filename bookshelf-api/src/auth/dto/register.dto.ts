import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'anna@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'anna', pattern: '^[a-z0-9_]{3,30}$' })
  @Matches(/^[a-z0-9_]{3,30}$/i, {
    message: 'username must be 3-30 characters: letters, digits or underscore',
  })
  username!: string;

  @ApiProperty({ example: 'Secret123!', minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72)
  password!: string;

  @ApiPropertyOptional({ example: 'Anna Nowak', maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;
}
