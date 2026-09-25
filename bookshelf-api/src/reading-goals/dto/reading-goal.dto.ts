import { ApiProperty } from '@nestjs/swagger';
import { BookSummaryDto } from '../../books/dto/book-summary.dto';

export class ReadingGoalBookDto extends BookSummaryDto {
  @ApiProperty({ example: '2026-09-20' })
  finishedAt!: string;
}

export class ReadingGoalSummaryDto {
  year!: number;
  targetBooks!: number;
  booksRead!: number;
  remaining!: number;
  progressPercent!: number;
}

export class ReadingGoalDto extends ReadingGoalSummaryDto {
  books!: ReadingGoalBookDto[];
}
