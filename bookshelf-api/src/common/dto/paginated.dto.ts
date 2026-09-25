import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class PaginatedDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  data!: T[];

  meta!: PaginationMetaDto;
}
