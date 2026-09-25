import { bookSummaryInclude, toBookSummary } from '../books/books.mapper';
import { coverUrl } from '../common/utils/covers';
import { Edition, Prisma } from '../generated/prisma/client';
import { EditionDetailDto, EditionDto } from './dto/edition.dto';

export const editionDetailInclude = {
  book: { include: bookSummaryInclude },
} satisfies Prisma.EditionInclude;

export type EditionDetailRow = Prisma.EditionGetPayload<{
  include: typeof editionDetailInclude;
}>;

export const toEdition = (edition: Edition): EditionDto => ({
  id: edition.id,
  openLibraryKey: edition.openLibraryKey,
  bookId: edition.bookId,
  title: edition.title,
  subtitle: edition.subtitle,
  publishers: edition.publishers,
  publishDate: edition.publishDate,
  publishYear: edition.publishYear,
  pageCount: edition.pageCount,
  isbn10: edition.isbn10,
  isbn13: edition.isbn13,
  languages: edition.languages,
  physicalFormat: edition.physicalFormat,
  coverUrl: coverUrl(edition.coverId, 'M'),
});

export const toEditionDetail = (
  edition: EditionDetailRow,
): EditionDetailDto => ({
  ...toEdition(edition),
  book: toBookSummary(edition.book),
});
