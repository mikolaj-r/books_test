import { BookSummaryDto } from '../../books/dto/book-summary.dto';

export class EditionDto {
  id!: string;
  openLibraryKey!: string | null;
  bookId!: string;
  title!: string;
  subtitle!: string | null;
  publishers!: string[];
  publishDate!: string | null;
  publishYear!: number | null;
  pageCount!: number | null;
  isbn10!: string | null;
  isbn13!: string | null;
  languages!: string[];
  physicalFormat!: string | null;
  coverUrl!: string | null;
}

export class EditionDetailDto extends EditionDto {
  book!: BookSummaryDto;
}
