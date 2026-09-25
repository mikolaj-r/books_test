import { bookSummaryInclude, toBookSummary } from '../books/books.mapper';
import { toDateOnly } from '../common/utils/dates';
import { Prisma } from '../generated/prisma/client';
import { LibraryEntryDto } from './dto/library-entry.dto';

export const libraryEntryInclude = {
  book: { include: bookSummaryInclude },
  edition: { select: { id: true, title: true, pageCount: true } },
} satisfies Prisma.LibraryEntryInclude;

export type LibraryEntryRow = Prisma.LibraryEntryGetPayload<{
  include: typeof libraryEntryInclude;
}>;

export const toLibraryEntry = (entry: LibraryEntryRow): LibraryEntryDto => ({
  id: entry.id,
  status: entry.status,
  startedAt: toDateOnly(entry.startedAt),
  finishedAt: toDateOnly(entry.finishedAt),
  currentPage: entry.currentPage,
  edition: entry.edition,
  book: toBookSummary(entry.book),
  updatedAt: entry.updatedAt,
});
