import { AuthorSummaryDto } from './author-summary.dto';

export class AuthorListItemDto extends AuthorSummaryDto {
  /** Number of books by this author in the catalog */
  booksCount!: number;
}
