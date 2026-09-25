import { bookSummaryInclude, toBookSummary } from '../books/books.mapper';
import { Prisma, Rating } from '../generated/prisma/client';
import { toUserPublic } from '../users/users.mapper';
import { MyRatingDto } from './dto/my-rating.dto';
import { RatingDto, UserRatingDto } from './dto/rating.dto';

export const ratingInclude = {
  user: true,
  edition: { select: { id: true, title: true } },
} satisfies Prisma.RatingInclude;

export const userRatingInclude = {
  book: { include: bookSummaryInclude },
  edition: { select: { id: true, title: true } },
} satisfies Prisma.RatingInclude;

export type RatingRow = Prisma.RatingGetPayload<{
  include: typeof ratingInclude;
}>;

export type UserRatingRow = Prisma.RatingGetPayload<{
  include: typeof userRatingInclude;
}>;

export const toMyRating = (rating: Rating): MyRatingDto => ({
  id: rating.id,
  value: rating.value,
  review: rating.review,
  editionId: rating.editionId,
  createdAt: rating.createdAt,
  updatedAt: rating.updatedAt,
});

export const toRating = (rating: RatingRow): RatingDto => ({
  id: rating.id,
  value: rating.value,
  review: rating.review,
  createdAt: rating.createdAt,
  updatedAt: rating.updatedAt,
  user: toUserPublic(rating.user),
  edition: rating.edition,
});

export const toUserRating = (rating: UserRatingRow): UserRatingDto => ({
  id: rating.id,
  value: rating.value,
  review: rating.review,
  createdAt: rating.createdAt,
  updatedAt: rating.updatedAt,
  book: toBookSummary(rating.book),
  edition: rating.edition,
});
