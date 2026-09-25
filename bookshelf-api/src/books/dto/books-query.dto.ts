import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SORT_ORDERS } from '../../common/dto/sort-order';
import type { SortOrder } from '../../common/dto/sort-order';

export enum BooksSort {
  popularity = 'popularity',
  averageRating = 'averageRating',
  ratingsCount = 'ratingsCount',
  firstPublishYear = 'firstPublishYear',
  title = 'title',
  createdAt = 'createdAt',
}

export class BooksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Title or author name contains (case-insensitive)',
    example: 'tolkien',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ description: 'Genre slug', example: 'fantasy' })
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/)
  genre?: string;

  @ApiPropertyOptional({ description: 'Author id', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  author?: string;

  @ApiPropertyOptional({ example: 1950 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2100)
  yearFrom?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2100)
  yearTo?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, example: 7.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  minRating?: number;

  @ApiPropertyOptional({ enum: BooksSort, default: BooksSort.popularity })
  @IsOptional()
  @IsEnum(BooksSort)
  sort: BooksSort = BooksSort.popularity;

  @ApiPropertyOptional({
    enum: SORT_ORDERS,
    description: 'Defaults to desc, except title which defaults to asc',
  })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
