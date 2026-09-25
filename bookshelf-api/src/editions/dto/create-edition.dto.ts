import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const stripIsbn = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.replace(/[^0-9Xx]/g, '').toUpperCase()
    : value;

export class CreateEditionDto {
  @ApiProperty({ example: 'The Lord of the Rings', maxLength: 500 })
  @IsString()
  @Length(1, 500)
  title!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiPropertyOptional({ type: [String], example: ['Houghton Mifflin'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  publishers?: string[];

  @ApiPropertyOptional({ example: 'October 1994', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  publishDate?: string;

  @ApiPropertyOptional({ example: 1994 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2100)
  publishYear?: number;

  @ApiPropertyOptional({ example: 1216 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageCount?: number;

  @ApiPropertyOptional({
    example: '0395595118',
    description: 'Hyphens and spaces are ignored',
  })
  @IsOptional()
  @Transform(stripIsbn)
  @Matches(/^\d{9}[\dX]$/, {
    message: 'isbn10 must be 10 characters: digits with an optional trailing X',
  })
  isbn10?: string;

  @ApiPropertyOptional({
    example: '9780395595114',
    description: 'Hyphens and spaces are ignored',
  })
  @IsOptional()
  @Transform(stripIsbn)
  @Matches(/^\d{13}$/, { message: 'isbn13 must be 13 digits' })
  isbn13?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['eng'],
    description: 'ISO 639 language codes',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(2, 3, { each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: 'Hardcover', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  physicalFormat?: string;

  @ApiPropertyOptional({
    example: 8231856,
    description: 'Open Library cover id',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  coverId?: number;
}
