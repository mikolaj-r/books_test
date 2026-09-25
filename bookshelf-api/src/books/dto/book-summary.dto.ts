import { AuthorSummaryDto } from '../../authors/dto/author-summary.dto';

export class BookSummaryDto {
  id!: string;
  title!: string;
  subtitle!: string | null;
  coverUrl!: string | null;
  firstPublishYear!: number | null;
  authors!: AuthorSummaryDto[];
  averageRating!: number | null;
  ratingsCount!: number;
}
