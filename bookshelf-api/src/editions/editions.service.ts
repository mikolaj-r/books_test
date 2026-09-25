import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEditionDto } from './dto/create-edition.dto';
import { EditionDetailDto } from './dto/edition.dto';
import { UpdateEditionDto } from './dto/update-edition.dto';
import { editionDetailInclude, toEditionDetail } from './editions.mapper';

@Injectable()
export class EditionsService {
  constructor(private readonly prisma: DatabaseService) {}

  async findOne(id: string): Promise<EditionDetailDto> {
    const edition = await this.prisma.edition.findUnique({
      where: { id },
      include: editionDetailInclude,
    });
    if (!edition) {
      throw new NotFoundException('Edition not found');
    }
    return toEditionDetail(edition);
  }

  async findByIsbn(isbn: string): Promise<EditionDetailDto> {
    const edition = await this.prisma.edition.findFirst({
      where: isbn.length === 13 ? { isbn13: isbn } : { isbn10: isbn },
      include: editionDetailInclude,
    });
    if (!edition) {
      throw new NotFoundException('Edition not found');
    }
    return toEditionDetail(edition);
  }

  async create(
    bookId: string,
    dto: CreateEditionDto,
  ): Promise<EditionDetailDto> {
    const books = await this.prisma.book.count({ where: { id: bookId } });
    if (books === 0) {
      throw new NotFoundException('Book not found');
    }
    const edition = await this.prisma.edition.create({
      data: { ...dto, bookId },
      include: editionDetailInclude,
    });
    return toEditionDetail(edition);
  }

  async update(id: string, dto: UpdateEditionDto): Promise<EditionDetailDto> {
    await this.assertExists(id);
    const edition = await this.prisma.edition.update({
      where: { id },
      data: dto,
      include: editionDetailInclude,
    });
    return toEditionDetail(edition);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.prisma.edition.delete({ where: { id } });
  }

  private async assertExists(id: string): Promise<void> {
    const count = await this.prisma.edition.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException('Edition not found');
    }
  }
}
