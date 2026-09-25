import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SORT_ORDERS } from '../../common/dto/sort-order';
import type { SortOrder } from '../../common/dto/sort-order';

export enum AuthorsSort {
  name = 'name',
  booksCount = 'booksCount',
}

export class AuthorsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Name contains (case-insensitive)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: AuthorsSort, default: AuthorsSort.name })
  @IsOptional()
  @IsEnum(AuthorsSort)
  sort: AuthorsSort = AuthorsSort.name;

  @ApiPropertyOptional({
    enum: SORT_ORDERS,
    description: 'Defaults to asc for name and desc for booksCount',
  })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
