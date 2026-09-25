import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'The Lord of the Rings', maxLength: 500 })
  @IsString()
  @Length(1, 500)
  title!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiPropertyOptional({ maxLength: 20000 })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @ApiPropertyOptional({
    example: 258027,
    description: 'Open Library cover id',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  coverId?: number;

  @ApiPropertyOptional({ example: 1954 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2100)
  firstPublishYear?: number;

  @ApiPropertyOptional({ type: [String], format: 'uuid', maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('all', { each: true })
  authorIds?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid', maxItems: 10 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  genreIds?: string[];
}
