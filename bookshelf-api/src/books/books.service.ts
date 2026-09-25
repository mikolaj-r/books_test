import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { paginate, toPaginated } from '../common/utils/pagination';
import { DatabaseService } from '../database/database.service';
import { toEdition } from '../editions/editions.mapper';
import { EditionDto } from '../editions/dto/edition.dto';
import { Prisma } from '../generated/prisma/client';
import { libraryEntryInclude, toLibraryEntry } from '../library/library.mapper';
import { toMyRating } from '../ratings/ratings.mapper';
import {
  bookDetailInclude,
  bookSummaryInclude,
  toBookDetail,
  toBookSummary,
} from './books.mapper';
import { BookDetailDto } from './dto/book-detail.dto';
import { BookSummaryDto } from './dto/book-summary.dto';
import { BooksQueryDto, BooksSort } from './dto/books-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: DatabaseService) {}

  async findMany(
    query: BooksQueryDto,
    base: Prisma.BookWhereInput = {},
  ): Promise<PaginatedDto<BookSummaryDto>> {
    const where = this.buildWhere(query, base);
    const [books, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: bookSummaryInclude,
        orderBy: this.buildOrderBy(query),
        ...paginate(query),
      }),
      this.prisma.book.count({ where }),
    ]);
    return toPaginated(books.map(toBookSummary), total, query);
  }

  async findOne(id: string, user?: AuthUser): Promise<BookDetailDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: bookDetailInclude,
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const [groups, myRating, myEntry] = await Promise.all([
      this.prisma.rating.groupBy({
        by: ['value'],
        where: { bookId: id },
        _count: { _all: true },
      }),
      user
        ? this.prisma.rating.findUnique({
            where: { userId_bookId: { userId: user.id, bookId: id } },
          })
        : null,
      user
        ? this.prisma.libraryEntry.findUnique({
            where: { userId_bookId: { userId: user.id, bookId: id } },
            include: libraryEntryInclude,
          })
        : null,
    ]);

    const distribution = Object.fromEntries(
      Array.from({ length: 10 }, (_, index) => [String(index + 1), 0]),
    );
    for (const group of groups) {
      distribution[String(group.value)] = group._count._all;
    }

    return toBookDetail(book, {
      ratingStats: {
        average: book.averageRating,
        count: book.ratingsCount,
        distribution,
      },
      myRating: myRating ? toMyRating(myRating) : null,
      myLibraryEntry: myEntry ? toLibraryEntry(myEntry) : null,
    });
  }

  async findEditions(id: string): Promise<EditionDto[]> {
    await this.assertExists(id);
    const editions = await this.prisma.edition.findMany({
      where: { bookId: id },
      orderBy: [
        { publishYear: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'asc' },
      ],
    });
    return editions.map(toEdition);
  }

  async create(dto: CreateBookDto): Promise<BookDetailDto> {
    const { authorIds = [], genreIds = [], ...data } = dto;
    await this.assertAuthors(authorIds);
    await this.assertGenres(genreIds);

    const book = await this.prisma.book.create({
      data: {
        ...data,
        authors: {
          create: authorIds.map((authorId, position) => ({
            authorId,
            position,
          })),
        },
        genres: { create: genreIds.map((genreId) => ({ genreId })) },
      },
    });
    return this.findOne(book.id);
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookDetailDto> {
    await this.assertExists(id);
    const { authorIds, genreIds, ...data } = dto;
    if (authorIds) {
      await this.assertAuthors(authorIds);
    }
    if (genreIds) {
      await this.assertGenres(genreIds);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.book.update({ where: { id }, data });
      if (authorIds) {
        await tx.bookAuthor.deleteMany({ where: { bookId: id } });
        await tx.bookAuthor.createMany({
          data: authorIds.map((authorId, position) => ({
            bookId: id,
            authorId,
            position,
          })),
        });
      }
      if (genreIds) {
        await tx.bookGenre.deleteMany({ where: { bookId: id } });
        await tx.bookGenre.createMany({
          data: genreIds.map((genreId) => ({ bookId: id, genreId })),
        });
      }
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.prisma.book.delete({ where: { id } });
  }

  async assertExists(id: string): Promise<void> {
    const count = await this.prisma.book.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException('Book not found');
    }
  }

  private async assertAuthors(ids: string[]): Promise<void> {
    const unique = [...new Set(ids)];
    const count = await this.prisma.author.count({
      where: { id: { in: unique } },
    });
    if (count !== unique.length) {
      throw new BadRequestException('Unknown author id');
    }
  }

  private async assertGenres(ids: string[]): Promise<void> {
    const unique = [...new Set(ids)];
    const count = await this.prisma.genre.count({
      where: { id: { in: unique } },
    });
    if (count !== unique.length) {
      throw new BadRequestException('Unknown genre id');
    }
  }

  private buildWhere(
    query: BooksQueryDto,
    base: Prisma.BookWhereInput,
  ): Prisma.BookWhereInput {
    const where: Prisma.BookWhereInput = { ...base };
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        {
          authors: {
            some: {
              author: { name: { contains: query.q, mode: 'insensitive' } },
            },
          },
        },
      ];
    }
    if (query.genre) {
      where.genres = { some: { genre: { slug: query.genre } } };
    }
    if (query.author) {
      where.authors = { some: { authorId: query.author } };
    }
    if (query.yearFrom !== undefined || query.yearTo !== undefined) {
      where.firstPublishYear = { gte: query.yearFrom, lte: query.yearTo };
    }
    if (query.minRating !== undefined) {
      where.averageRating = { gte: query.minRating };
    }
    return where;
  }

  private buildOrderBy(
    query: BooksQueryDto,
  ): Prisma.BookOrderByWithRelationInput[] {
    const order =
      query.order ?? (query.sort === BooksSort.title ? 'asc' : 'desc');
    const nullsLast = { sort: order, nulls: 'last' } as const;
    const primary: Record<BooksSort, Prisma.BookOrderByWithRelationInput> = {
      [BooksSort.popularity]: { olRatingsCount: nullsLast },
      [BooksSort.averageRating]: { averageRating: nullsLast },
      [BooksSort.ratingsCount]: { ratingsCount: order },
      [BooksSort.firstPublishYear]: { firstPublishYear: nullsLast },
      [BooksSort.title]: { title: order },
      [BooksSort.createdAt]: { createdAt: order },
    };
    return [primary[query.sort], { id: 'asc' }];
  }
}
