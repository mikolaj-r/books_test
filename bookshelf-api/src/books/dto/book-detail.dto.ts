import { ApiProperty } from '@nestjs/swagger';
import { GenreDto } from '../../genres/dto/genre.dto';
import { LibraryEntryDto } from '../../library/dto/library-entry.dto';
import { MyRatingDto } from '../../ratings/dto/my-rating.dto';
import { BookSummaryDto } from './book-summary.dto';

export class CoverUrlsDto {
  /** Small (S) cover image */
  small!: string | null;
  /** Medium (M) cover image */
  medium!: string | null;
  /** Large (L) cover image */
  large!: string | null;
}

export class RatingStatsDto {
  /** Average of ratings given by users of this API, null when there are none */
  average!: number | null;
  /** Number of ratings given by users of this API */
  count!: number;

  @ApiProperty({
    description: 'Number of ratings per value, keys "1" to "10"',
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
  /** Number of ratings in the Open Library community */
  count!: number;
  /** Open Library average converted to the 1-10 scale */
  average!: number;
}

export class BookDetailDto extends BookSummaryDto {
  /** Open Library work key, e.g. OL27448W; null for books created by an admin */
  openLibraryKey!: string | null;
  /** Link to the work on openlibrary.org */
  openLibraryUrl!: string | null;
  description!: string | null;
  coverUrls!: CoverUrlsDto;
  /** Genres sorted by name */
  genres!: GenreDto[];
  /** Number of editions in the catalog */
  editionsCount!: number;
  /** Statistics of ratings given by users of this API */
  ratingStats!: RatingStatsDto;
  /** Community rating imported from Open Library, informational only */
  openLibraryRating!: OpenLibraryRatingDto | null;
  /** Rating of the current user, null for anonymous requests or when not rated */
  myRating!: MyRatingDto | null;
  /** Library entry of the current user, null for anonymous requests or when absent */
  myLibraryEntry!: LibraryEntryDto | null;
}
