import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SORT_ORDERS } from '../../common/dto/sort-order';
import type { SortOrder } from '../../common/dto/sort-order';
import { ReadingStatus } from '../../generated/prisma/enums';

export enum LibrarySort {
  updatedAt = 'updatedAt',
  finishedAt = 'finishedAt',
  title = 'title',
}

export class LibraryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReadingStatus })
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;

  @ApiPropertyOptional({ enum: LibrarySort, default: LibrarySort.updatedAt })
  @IsOptional()
  @IsEnum(LibrarySort)
  sort: LibrarySort = LibrarySort.updatedAt;

  @ApiPropertyOptional({
    enum: SORT_ORDERS,
    description: 'Defaults to desc, except title which defaults to asc',
  })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
