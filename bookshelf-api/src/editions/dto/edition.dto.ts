import { BookSummaryDto } from '../../books/dto/book-summary.dto';

export class EditionDto {
  id!: string;
  /** Open Library edition key, e.g. OL7440033M; null for editions created by an admin */
  openLibraryKey!: string | null;
  bookId!: string;
  title!: string;
  subtitle!: string | null;
  publishers!: string[];
  /** Publication date as printed in the source, free text */
  publishDate!: string | null;
  /** Year parsed from the publication date */
  publishYear!: number | null;
  pageCount!: number | null;
  /** Normalized ISBN-10 (digits, optional trailing X) */
  isbn10!: string | null;
  /** Normalized ISBN-13 (digits only) */
  isbn13!: string | null;
  /** ISO 639-2 language codes, e.g. eng, pol */
  languages!: string[];
  /** e.g. Hardcover, Paperback */
  physicalFormat!: string | null;
  /** Medium-size cover on covers.openlibrary.org */
  coverUrl!: string | null;
}

export class EditionDetailDto extends EditionDto {
  book!: BookSummaryDto;
}
