import { authorPhotoUrl } from '../common/utils/covers';
import { Author, Prisma } from '../generated/prisma/client';
import { AuthorDetailDto } from './dto/author-detail.dto';
import { AuthorListItemDto } from './dto/author-list-item.dto';
import { AuthorSummaryDto } from './dto/author-summary.dto';

export const authorCountInclude = {
  _count: { select: { books: true } },
} satisfies Prisma.AuthorInclude;

export type AuthorWithCount = Prisma.AuthorGetPayload<{
  include: typeof authorCountInclude;
}>;

export const toAuthorSummary = (author: Author): AuthorSummaryDto => ({
  id: author.id,
  name: author.name,
  photoUrl: authorPhotoUrl(author.photoId, 'M'),
});

export const toAuthorListItem = (
  author: AuthorWithCount,
): AuthorListItemDto => ({
  ...toAuthorSummary(author),
  booksCount: author._count.books,
});

export const toAuthorDetail = (author: AuthorWithCount): AuthorDetailDto => ({
  id: author.id,
  openLibraryKey: author.openLibraryKey,
  name: author.name,
  bio: author.bio,
  birthDate: author.birthDate,
  deathDate: author.deathDate,
  photoUrl: authorPhotoUrl(author.photoId, 'L'),
  alternateNames: author.alternateNames,
  booksCount: author._count.books,
});
