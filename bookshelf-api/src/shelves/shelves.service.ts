import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { BooksService } from '../books/books.service';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { paginate, toPaginated } from '../common/utils/pagination';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import {
  ShelfBooksQueryDto,
  ShelfBooksSort,
} from './dto/shelf-books-query.dto';
import { ShelfBookDto, ShelfDto } from './dto/shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import {
  shelfBookInclude,
  shelfInclude,
  ShelfRow,
  toShelf,
  toShelfBook,
} from './shelves.mapper';

@Injectable()
export class ShelvesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  async findMine(userId: string): Promise<ShelfDto[]> {
    const shelves = await this.prisma.shelf.findMany({
      where: { userId },
      include: shelfInclude,
      orderBy: { name: 'asc' },
    });
    return shelves.map(toShelf);
  }

  async create(userId: string, dto: CreateShelfDto): Promise<ShelfDto> {
    await this.assertNameFree(userId, dto.name);
    const shelf = await this.prisma.shelf.create({
      data: { ...dto, userId },
      include: shelfInclude,
    });
    return toShelf(shelf);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateShelfDto,
  ): Promise<ShelfDto> {
    const shelf = await this.getOwned(userId, id);
    if (dto.name && dto.name !== shelf.name) {
      await this.assertNameFree(userId, dto.name);
    }
    const updated = await this.prisma.shelf.update({
      where: { id },
      data: dto,
      include: shelfInclude,
    });
    return toShelf(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.prisma.shelf.delete({ where: { id } });
  }

  async addBook(
    userId: string,
    shelfId: string,
    bookId: string,
  ): Promise<void> {
    await this.getOwned(userId, shelfId);
    await this.booksService.assertExists(bookId);
    await this.prisma.shelfBook.upsert({
      where: { shelfId_bookId: { shelfId, bookId } },
      create: { shelfId, bookId },
      update: {},
    });
  }

  async removeBook(
    userId: string,
    shelfId: string,
    bookId: string,
  ): Promise<void> {
    await this.getOwned(userId, shelfId);
    await this.prisma.shelfBook.deleteMany({ where: { shelfId, bookId } });
  }

  async findOne(id: string, user?: AuthUser): Promise<ShelfDto> {
    return toShelf(await this.getVisible(id, user));
  }

  async findBooks(
    id: string,
    query: ShelfBooksQueryDto,
    user?: AuthUser,
  ): Promise<PaginatedDto<ShelfBookDto>> {
    await this.getVisible(id, user);
    const order =
      query.order ?? (query.sort === ShelfBooksSort.title ? 'asc' : 'desc');
    const orderBy: Prisma.ShelfBookOrderByWithRelationInput[] =
      query.sort === ShelfBooksSort.title
        ? [{ book: { title: order } }, { addedAt: 'desc' }]
        : [{ addedAt: order }, { bookId: 'asc' }];

    const [books, total] = await this.prisma.$transaction([
      this.prisma.shelfBook.findMany({
        where: { shelfId: id },
        include: shelfBookInclude,
        orderBy,
        ...paginate(query),
      }),
      this.prisma.shelfBook.count({ where: { shelfId: id } }),
    ]);
    return toPaginated(books.map(toShelfBook), total, query);
  }

  async findPublicByUsername(username: string): Promise<ShelfDto[]> {
    const userId = await this.usersService.getIdByUsername(username);
    const shelves = await this.prisma.shelf.findMany({
      where: { userId, isPublic: true },
      include: shelfInclude,
      orderBy: { name: 'asc' },
    });
    return shelves.map(toShelf);
  }

  private async getOwned(userId: string, id: string): Promise<ShelfRow> {
    const shelf = await this.prisma.shelf.findUnique({
      where: { id },
      include: shelfInclude,
    });
    if (!shelf || shelf.userId !== userId) {
      throw new NotFoundException('Shelf not found');
    }
    return shelf;
  }

  private async getVisible(id: string, user?: AuthUser): Promise<ShelfRow> {
    const shelf = await this.prisma.shelf.findUnique({
      where: { id },
      include: shelfInclude,
    });
    if (!shelf || (!shelf.isPublic && shelf.userId !== user?.id)) {
      throw new NotFoundException('Shelf not found');
    }
    return shelf;
  }

  private async assertNameFree(userId: string, name: string): Promise<void> {
    const taken = await this.prisma.shelf.count({ where: { userId, name } });
    if (taken > 0) {
      throw new ConflictException('Shelf with this name already exists');
    }
  }
}
