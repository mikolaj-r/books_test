import { ApiProperty } from '@nestjs/swagger';
import { BookSummaryDto } from '../../books/dto/book-summary.dto';

export class ReadingGoalBookDto extends BookSummaryDto {
  @ApiProperty({ description: 'Date only (YYYY-MM-DD)', example: '2026-09-20' })
  finishedAt!: string;
}

export class ReadingGoalSummaryDto {
  year!: number;
  targetBooks!: number;
  /** Library entries with status READ finished in this year */
  booksRead!: number;
  /** Books still to read to reach the target, never negative */
  remaining!: number;
  /** Rounded percentage of the target, capped at 100 */
  progressPercent!: number;
}

export class ReadingGoalDto extends ReadingGoalSummaryDto {
  /** Books finished in this year, newest first */
  books!: ReadingGoalBookDto[];
}
