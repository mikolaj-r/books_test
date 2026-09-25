import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { BookSummaryDto } from '../books/dto/book-summary.dto';
import { BooksQueryDto } from '../books/dto/books-query.dto';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { paginate, toPaginated } from '../common/utils/pagination';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '../generated/prisma/client';
import {
  authorCountInclude,
  toAuthorDetail,
  toAuthorListItem,
} from './authors.mapper';
import { AuthorDetailDto } from './dto/author-detail.dto';
import { AuthorListItemDto } from './dto/author-list-item.dto';
import { AuthorsQueryDto, AuthorsSort } from './dto/authors-query.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly booksService: BooksService,
  ) {}

  async findMany(
    query: AuthorsQueryDto,
  ): Promise<PaginatedDto<AuthorListItemDto>> {
    const where: Prisma.AuthorWhereInput = query.q
      ? { name: { contains: query.q, mode: 'insensitive' } }
      : {};
    const order =
      query.order ?? (query.sort === AuthorsSort.name ? 'asc' : 'desc');
    const orderBy: Prisma.AuthorOrderByWithRelationInput[] =
      query.sort === AuthorsSort.booksCount
        ? [{ books: { _count: order } }, { name: 'asc' }]
        : [{ name: order }, { id: 'asc' }];

    const [authors, total] = await this.prisma.$transaction([
      this.prisma.author.findMany({
        where,
        include: authorCountInclude,
        orderBy,
        ...paginate(query),
      }),
      this.prisma.author.count({ where }),
    ]);
    return toPaginated(authors.map(toAuthorListItem), total, query);
  }

  async findOne(id: string): Promise<AuthorDetailDto> {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: authorCountInclude,
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return toAuthorDetail(author);
  }

  async findBooks(
    id: string,
    query: BooksQueryDto,
  ): Promise<PaginatedDto<BookSummaryDto>> {
    await this.assertExists(id);
    return this.booksService.findMany(query, {
      authors: { some: { authorId: id } },
    });
  }

  async create(dto: CreateAuthorDto): Promise<AuthorDetailDto> {
    const author = await this.prisma.author.create({
      data: dto,
      include: authorCountInclude,
    });
    return toAuthorDetail(author);
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<AuthorDetailDto> {
    await this.assertExists(id);
    const author = await this.prisma.author.update({
      where: { id },
      data: dto,
      include: authorCountInclude,
    });
    return toAuthorDetail(author);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.prisma.author.delete({ where: { id } });
  }

  private async assertExists(id: string): Promise<void> {
    const count = await this.prisma.author.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException('Author not found');
    }
  }
}
