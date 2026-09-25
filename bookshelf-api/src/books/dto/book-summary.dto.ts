import { AuthorSummaryDto } from '../../authors/dto/author-summary.dto';

export class BookSummaryDto {
  id!: string;
  title!: string;
  subtitle!: string | null;
  /** Medium-size cover on covers.openlibrary.org, null when the book has no cover */
  coverUrl!: string | null;
  /** Year of the first publication of the work */
  firstPublishYear!: number | null;
  /** Authors in the order they are credited */
  authors!: AuthorSummaryDto[];
  /** Average of ratings given by users of this API (1-10), null until the first rating */
  averageRating!: number | null;
  /** Number of ratings given by users of this API */
  ratingsCount!: number;
}
