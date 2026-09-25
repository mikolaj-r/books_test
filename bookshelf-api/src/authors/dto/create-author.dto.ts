import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Olga Tokarczuk', maxLength: 200 })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiPropertyOptional({ example: '29 January 1962', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  birthDate?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deathDate?: string;

  @ApiPropertyOptional({
    example: 6791431,
    description: 'Open Library photo id',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  photoId?: number;

  @ApiPropertyOptional({ type: [String], maxItems: 10 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  alternateNames?: string[];
}
