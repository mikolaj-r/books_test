import { ApiProperty } from '@nestjs/swagger';
import { BookSummaryDto } from '../../books/dto/book-summary.dto';
import { ReadingStatus } from '../../generated/prisma/enums';

export class LibraryEntryEditionDto {
  id!: string;
  title!: string;
  pageCount!: number | null;
}

export class LibraryEntryDto {
  id!: string;

  @ApiProperty({ enum: ReadingStatus })
  status!: ReadingStatus;

  @ApiProperty({ example: '2026-09-01', nullable: true, type: String })
  startedAt!: string | null;

  @ApiProperty({ example: '2026-09-20', nullable: true, type: String })
  finishedAt!: string | null;

  currentPage!: number | null;
  edition!: LibraryEntryEditionDto | null;
  book!: BookSummaryDto;
  updatedAt!: Date;
}
