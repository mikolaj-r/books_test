import { PaginatedDto } from '../dto/paginated.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export const paginate = ({ page, limit }: PaginationQueryDto) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const toPaginated = <T>(
  data: T[],
  total: number,
  { page, limit }: PaginationQueryDto,
): PaginatedDto<T> => ({
  data,
  meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
