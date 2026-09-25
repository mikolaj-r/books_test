import { AuthorSummaryDto } from './author-summary.dto';

export class AuthorListItemDto extends AuthorSummaryDto {
  booksCount!: number;
}
