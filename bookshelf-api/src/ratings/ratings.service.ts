import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { round2 } from '../common/utils/numbers';
import { paginate, toPaginated } from '../common/utils/pagination';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { MyRatingDto } from './dto/my-rating.dto';
import { RatingDto, UserRatingDto } from './dto/rating.dto';
import { RatingsQueryDto, RatingsSort } from './dto/ratings-query.dto';
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import {
  ratingInclude,
  toMyRating,
  toRating,
  toUserRating,
  userRatingInclude,
} from './ratings.mapper';

const ORDER_BY: Record<RatingsSort, Prisma.RatingOrderByWithRelationInput[]> = {
  [RatingsSort.newest]: [{ createdAt: 'desc' }],
  [RatingsSort.highest]: [{ value: 'desc' }, { createdAt: 'desc' }],
  [RatingsSort.lowest]: [{ value: 'asc' }, { createdAt: 'desc' }],
};

@Injectable()
export class RatingsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  async upsert(
    userId: string,
    bookId: string,
    dto: UpsertRatingDto,
  ): Promise<MyRatingDto> {
    await this.booksService.assertExists(bookId);
    if (dto.editionId) {
      await this.assertEditionOfBook(dto.editionId, bookId);
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.rating.findUnique({
        where: { userId_bookId: { userId, bookId } },
      });
      const data = {
        value: dto.value,
        review: dto.review ?? null,
        editionId: dto.editionId ?? null,
      };
      const rating = existing
        ? await tx.rating.update({ where: { id: existing.id }, data })
        : await tx.rating.create({ data: { ...data, userId, bookId } });

      const book = await tx.book.update({
        where: { id: bookId },
        data: {
          ratingsCount: { increment: existing ? 0 : 1 },
          ratingSum: { increment: dto.value - (existing?.value ?? 0) },
        },
      });
      await tx.book.update({
        where: { id: bookId },
        data: { averageRating: round2(book.ratingSum / book.ratingsCount) },
      });
      return toMyRating(rating);
    });
  }

  async remove(userId: string, bookId: string): Promise<void> {
    const rating = await this.prisma.rating.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rating.delete({ where: { id: rating.id } });
      const book = await tx.book.update({
        where: { id: bookId },
        data: {
          ratingsCount: { decrement: 1 },
          ratingSum: { decrement: rating.value },
        },
      });
      await tx.book.update({
        where: { id: bookId },
        data: {
          averageRating: book.ratingsCount
            ? round2(book.ratingSum / book.ratingsCount)
            : null,
        },
      });
    });
  }

  async findForBook(
    bookId: string,
    query: RatingsQueryDto,
  ): Promise<PaginatedDto<RatingDto>> {
    await this.booksService.assertExists(bookId);
    const where: Prisma.RatingWhereInput = {
      bookId,
      ...(query.withReview ? { review: { not: null } } : {}),
    };
    const [ratings, total] = await this.prisma.$transaction([
      this.prisma.rating.findMany({
        where,
        include: ratingInclude,
        orderBy: ORDER_BY[query.sort],
        ...paginate(query),
      }),
      this.prisma.rating.count({ where }),
    ]);
    return toPaginated(ratings.map(toRating), total, query);
  }

  async findForUser(
    username: string,
    query: RatingsQueryDto,
  ): Promise<PaginatedDto<UserRatingDto>> {
    const userId = await this.usersService.getIdByUsername(username);
    const where: Prisma.RatingWhereInput = {
      userId,
      ...(query.withReview ? { review: { not: null } } : {}),
    };
    const [ratings, total] = await this.prisma.$transaction([
      this.prisma.rating.findMany({
        where,
        include: userRatingInclude,
        orderBy: ORDER_BY[query.sort],
        ...paginate(query),
      }),
      this.prisma.rating.count({ where }),
    ]);
    return toPaginated(ratings.map(toUserRating), total, query);
  }

  private async assertEditionOfBook(
    editionId: string,
    bookId: string,
  ): Promise<void> {
    const count = await this.prisma.edition.count({
      where: { id: editionId, bookId },
    });
    if (count === 0) {
      throw new BadRequestException('Edition does not belong to this book');
    }
  }
}
