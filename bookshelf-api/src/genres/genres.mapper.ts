import { Prisma } from '../generated/prisma/client';
import { GenreDto } from './dto/genre.dto';

export const genreCountInclude = {
  _count: { select: { books: true } },
} satisfies Prisma.GenreInclude;

export type GenreWithCount = Prisma.GenreGetPayload<{
  include: typeof genreCountInclude;
}>;

export const toGenre = (genre: GenreWithCount): GenreDto => ({
  id: genre.id,
  name: genre.name,
  slug: genre.slug,
  booksCount: genre._count.books,
});
