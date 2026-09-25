import { ApiProperty } from '@nestjs/swagger';
import { GenreDto } from '../../genres/dto/genre.dto';
import { LibraryEntryDto } from '../../library/dto/library-entry.dto';
import { MyRatingDto } from '../../ratings/dto/my-rating.dto';
import { BookSummaryDto } from './book-summary.dto';

export class CoverUrlsDto {
  small!: string | null;
  medium!: string | null;
  large!: string | null;
}

export class RatingStatsDto {
  average!: number | null;
  count!: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'integer' },
    example: {
      '1': 0,
      '2': 0,
      '3': 1,
      '4': 0,
      '5': 2,
      '6': 3,
      '7': 5,
      '8': 9,
      '9': 6,
      '10': 4,
    },
  })
  distribution!: Record<string, number>;
}

export class OpenLibraryRatingDto {
  count!: number;
  average!: number;
}

export class BookDetailDto extends BookSummaryDto {
  openLibraryKey!: string | null;
  openLibraryUrl!: string | null;
  description!: string | null;
  coverUrls!: CoverUrlsDto;
  genres!: GenreDto[];
  editionsCount!: number;
  ratingStats!: RatingStatsDto;
  openLibraryRating!: OpenLibraryRatingDto | null;
  myRating!: MyRatingDto | null;
  myLibraryEntry!: LibraryEntryDto | null;
}
