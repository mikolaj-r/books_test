import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { BookSummaryDto } from '../books/dto/book-summary.dto';
import { BooksQueryDto } from '../books/dto/books-query.dto';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { slugify } from '../common/utils/slug';
import { DatabaseService } from '../database/database.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreDto } from './dto/genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { genreCountInclude, toGenre } from './genres.mapper';

@Injectable()
export class GenresService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly booksService: BooksService,
  ) {}

  async findAll(): Promise<GenreDto[]> {
    const genres = await this.prisma.genre.findMany({
      include: genreCountInclude,
      orderBy: { name: 'asc' },
    });
    return genres.map(toGenre);
  }

  async findBySlug(slug: string): Promise<GenreDto> {
    const genre = await this.prisma.genre.findUnique({
      where: { slug },
      include: genreCountInclude,
    });
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }
    return toGenre(genre);
  }

  async findBooks(
    slug: string,
    query: BooksQueryDto,
  ): Promise<PaginatedDto<BookSummaryDto>> {
    const genre = await this.findBySlug(slug);
    return this.booksService.findMany(query, {
      genres: { some: { genreId: genre.id } },
    });
  }

  async create(dto: CreateGenreDto): Promise<GenreDto> {
    const genre = await this.prisma.genre.create({
      data: { name: dto.name, slug: this.slugOf(dto.name) },
      include: genreCountInclude,
    });
    return toGenre(genre);
  }

  async update(id: string, dto: UpdateGenreDto): Promise<GenreDto> {
    await this.assertExists(id);
    const genre = await this.prisma.genre.update({
      where: { id },
      data: dto.name ? { name: dto.name, slug: this.slugOf(dto.name) } : {},
      include: genreCountInclude,
    });
    return toGenre(genre);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.prisma.genre.delete({ where: { id } });
  }

  private slugOf(name: string): string {
    const slug = slugify(name);
    if (!slug) {
      throw new BadRequestException(
        'Genre name must contain letters or digits',
      );
    }
    return slug;
  }

  private async assertExists(id: string): Promise<void> {
    const count = await this.prisma.genre.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException('Genre not found');
    }
  }
}
