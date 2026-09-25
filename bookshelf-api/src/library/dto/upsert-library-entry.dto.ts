import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { ReadingStatus } from '../../generated/prisma/enums';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class UpsertLibraryEntryDto {
  @ApiProperty({ enum: ReadingStatus, example: ReadingStatus.READING })
  @IsEnum(ReadingStatus)
  status!: ReadingStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Edition of this book' })
  @IsOptional()
  @IsUUID()
  editionId?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATE_ONLY, { message: 'startedAt must be YYYY-MM-DD' })
  startedAt?: string;

  @ApiPropertyOptional({ example: '2026-09-20', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATE_ONLY, { message: 'finishedAt must be YYYY-MM-DD' })
  finishedAt?: string;

  @ApiPropertyOptional({ minimum: 0, example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentPage?: number;
}
