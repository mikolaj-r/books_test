import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SORT_ORDERS } from '../../common/dto/sort-order';
import type { SortOrder } from '../../common/dto/sort-order';

export enum ShelfBooksSort {
  addedAt = 'addedAt',
  title = 'title',
}

export class ShelfBooksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ShelfBooksSort,
    default: ShelfBooksSort.addedAt,
  })
  @IsOptional()
  @IsEnum(ShelfBooksSort)
  sort: ShelfBooksSort = ShelfBooksSort.addedAt;

  @ApiPropertyOptional({
    enum: SORT_ORDERS,
    description: 'Defaults to desc for addedAt and asc for title',
  })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
