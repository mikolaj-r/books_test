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

  @ApiProperty({
    description: 'Date only (YYYY-MM-DD)',
    example: '2026-09-01',
    nullable: true,
    type: String,
  })
  startedAt!: string | null;

  @ApiProperty({
    description: 'Date only (YYYY-MM-DD)',
    example: '2026-09-20',
    nullable: true,
    type: String,
  })
  finishedAt!: string | null;

  /** Last page read; cleared when the status becomes WANT_TO_READ */
  currentPage!: number | null;
  /** Edition being read, when specified */
  edition!: LibraryEntryEditionDto | null;
  book!: BookSummaryDto;
  updatedAt!: Date;
}
