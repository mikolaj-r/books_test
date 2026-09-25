import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { fromDateOnly, today } from '../common/utils/dates';
import { paginate, toPaginated } from '../common/utils/pagination';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '../generated/prisma/client';
import { ReadingStatus } from '../generated/prisma/enums';
import { UsersService } from '../users/users.service';
import { LibraryEntryDto } from './dto/library-entry.dto';
import { LibraryQueryDto, LibrarySort } from './dto/library-query.dto';
import { UpsertLibraryEntryDto } from './dto/upsert-library-entry.dto';
import { libraryEntryInclude, toLibraryEntry } from './library.mapper';

@Injectable()
export class LibraryService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  async upsert(
    userId: string,
    bookId: string,
    dto: UpsertLibraryEntryDto,
  ): Promise<LibraryEntryDto> {
    await this.booksService.assertExists(bookId);
    const existing = await this.prisma.libraryEntry.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    const editionId = dto.editionId ?? existing?.editionId ?? null;
    const edition = editionId
      ? await this.prisma.edition.findUnique({
          where: { id: editionId },
          select: { bookId: true, pageCount: true },
        })
      : null;
    if (dto.editionId && edition?.bookId !== bookId) {
      throw new BadRequestException('Edition does not belong to this book');
    }

    let startedAt = dto.startedAt
      ? fromDateOnly(dto.startedAt)
      : (existing?.startedAt ?? null);
    let finishedAt = dto.finishedAt
      ? fromDateOnly(dto.finishedAt)
      : (existing?.finishedAt ?? null);
    let currentPage = dto.currentPage ?? existing?.currentPage ?? null;

    switch (dto.status) {
      case ReadingStatus.READING:
        startedAt ??= today();
        break;
      case ReadingStatus.READ:
        finishedAt ??= today();
        break;
      case ReadingStatus.WANT_TO_READ:
        finishedAt = null;
        currentPage = null;
        break;
    }

    if (startedAt && finishedAt && finishedAt < startedAt) {
      throw new BadRequestException(
        'finishedAt cannot be earlier than startedAt',
      );
    }
    if (
      currentPage !== null &&
      edition?.pageCount &&
      currentPage > edition.pageCount
    ) {
      throw new BadRequestException(
        `currentPage cannot exceed the edition page count (${edition.pageCount})`,
      );
    }

    const data = {
      status: dto.status,
      editionId,
      startedAt,
      finishedAt,
      currentPage,
    };
    const entry = await this.prisma.libraryEntry.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { ...data, userId, bookId },
      update: data,
      include: libraryEntryInclude,
    });
    return toLibraryEntry(entry);
  }

  async remove(userId: string, bookId: string): Promise<void> {
    const { count } = await this.prisma.libraryEntry.deleteMany({
      where: { userId, bookId },
    });
    if (count === 0) {
      throw new NotFoundException('Library entry not found');
    }
  }

  findMine(
    userId: string,
    query: LibraryQueryDto,
  ): Promise<PaginatedDto<LibraryEntryDto>> {
    return this.findForUser(userId, query);
  }

  async findByUsername(
    username: string,
    query: LibraryQueryDto,
  ): Promise<PaginatedDto<LibraryEntryDto>> {
    const userId = await this.usersService.getIdByUsername(username);
    return this.findForUser(userId, query);
  }

  private async findForUser(
    userId: string,
    query: LibraryQueryDto,
  ): Promise<PaginatedDto<LibraryEntryDto>> {
    const where: Prisma.LibraryEntryWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };
    const order =
      query.order ?? (query.sort === LibrarySort.title ? 'asc' : 'desc');
    const orderBy: Record<
      LibrarySort,
      Prisma.LibraryEntryOrderByWithRelationInput[]
    > = {
      [LibrarySort.updatedAt]: [{ updatedAt: order }],
      [LibrarySort.finishedAt]: [
        { finishedAt: { sort: order, nulls: 'last' } },
      ],
      [LibrarySort.title]: [{ book: { title: order } }],
    };

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.libraryEntry.findMany({
        where,
        include: libraryEntryInclude,
        orderBy: [...orderBy[query.sort], { id: 'asc' }],
        ...paginate(query),
      }),
      this.prisma.libraryEntry.count({ where }),
    ]);
    return toPaginated(entries.map(toLibraryEntry), total, query);
  }
}
