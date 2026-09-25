import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  /** Requested page, starting at 1 */
  page!: number;
  /** Requested page size */
  limit!: number;
  /** Total number of items matching the query */
  total!: number;
  totalPages!: number;
}

export class PaginatedDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  data!: T[];

  meta!: PaginationMetaDto;
}
