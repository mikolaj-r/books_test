import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertRatingDto {
  @ApiProperty({ minimum: 1, maximum: 10, example: 8 })
  @IsInt()
  @Min(1)
  @Max(10)
  value!: number;

  @ApiPropertyOptional({
    maxLength: 5000,
    description: 'Empty string clears the review',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  )
  @IsString()
  @MaxLength(5000)
  review?: string | null;

  @ApiPropertyOptional({ format: 'uuid', description: 'Edition of this book' })
  @IsOptional()
  @IsUUID()
  editionId?: string;
}
