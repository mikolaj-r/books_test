import { bookSummaryInclude, toBookSummary } from '../books/books.mapper';
import { Prisma } from '../generated/prisma/client';
import { ShelfBookDto, ShelfDto } from './dto/shelf.dto';

export const shelfInclude = {
  user: { select: { id: true, username: true } },
  _count: { select: { books: true } },
} satisfies Prisma.ShelfInclude;

export const shelfBookInclude = {
  book: { include: bookSummaryInclude },
} satisfies Prisma.ShelfBookInclude;

export type ShelfRow = Prisma.ShelfGetPayload<{ include: typeof shelfInclude }>;

export type ShelfBookRow = Prisma.ShelfBookGetPayload<{
  include: typeof shelfBookInclude;
}>;

export const toShelf = (shelf: ShelfRow): ShelfDto => ({
  id: shelf.id,
  name: shelf.name,
  description: shelf.description,
  isPublic: shelf.isPublic,
  booksCount: shelf._count.books,
  owner: shelf.user,
  createdAt: shelf.createdAt,
});

export const toShelfBook = (shelfBook: ShelfBookRow): ShelfBookDto => ({
  addedAt: shelfBook.addedAt,
  book: toBookSummary(shelfBook.book),
});
