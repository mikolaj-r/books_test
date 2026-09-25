import { toAuthorSummary } from '../authors/authors.mapper';
import { coverUrl, coverUrls } from '../common/utils/covers';
import { Prisma } from '../generated/prisma/client';
import { toGenre } from '../genres/genres.mapper';
import { LibraryEntryDto } from '../library/dto/library-entry.dto';
import { MyRatingDto } from '../ratings/dto/my-rating.dto';
import { BookDetailDto, RatingStatsDto } from './dto/book-detail.dto';
import { BookSummaryDto } from './dto/book-summary.dto';

export const bookSummaryInclude = {
  authors: { include: { author: true }, orderBy: { position: 'asc' } },
} satisfies Prisma.BookInclude;

export const bookDetailInclude = {
  ...bookSummaryInclude,
  genres: {
    include: { genre: { include: { _count: { select: { books: true } } } } },
    orderBy: { genre: { name: 'asc' } },
  },
  _count: { select: { editions: true } },
} satisfies Prisma.BookInclude;

export type BookSummaryRow = Prisma.BookGetPayload<{
  include: typeof bookSummaryInclude;
}>;

export type BookDetailRow = Prisma.BookGetPayload<{
  include: typeof bookDetailInclude;
}>;

export interface BookDetailExtras {
  ratingStats: RatingStatsDto;
  myRating: MyRatingDto | null;
  myLibraryEntry: LibraryEntryDto | null;
}

export const toBookSummary = (book: BookSummaryRow): BookSummaryDto => ({
  id: book.id,
  title: book.title,
  subtitle: book.subtitle,
  coverUrl: coverUrl(book.coverId, 'M'),
  firstPublishYear: book.firstPublishYear,
  authors: book.authors.map(({ author }) => toAuthorSummary(author)),
  averageRating: book.averageRating,
  ratingsCount: book.ratingsCount,
});

export const toBookDetail = (
  book: BookDetailRow,
  extras: BookDetailExtras,
): BookDetailDto => ({
  ...toBookSummary(book),
  openLibraryKey: book.openLibraryKey,
  openLibraryUrl: book.openLibraryKey
    ? `https://openlibrary.org/works/${book.openLibraryKey}`
    : null,
  description: book.description,
  coverUrls: coverUrls(book.coverId),
  genres: book.genres.map(({ genre }) => toGenre(genre)),
  editionsCount: book._count.editions,
  openLibraryRating:
    book.olRatingsCount !== null && book.olAverageRating !== null
      ? { count: book.olRatingsCount, average: book.olAverageRating }
      : null,
  ...extras,
});
