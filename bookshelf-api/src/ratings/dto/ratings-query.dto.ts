import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum RatingsSort {
  newest = 'newest',
  highest = 'highest',
  lowest = 'lowest',
}

export class RatingsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Only ratings with a review' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true')
  @IsBoolean()
  withReview?: boolean;

  @ApiPropertyOptional({ enum: RatingsSort, default: RatingsSort.newest })
  @IsOptional()
  @IsEnum(RatingsSort)
  sort: RatingsSort = RatingsSort.newest;
}
