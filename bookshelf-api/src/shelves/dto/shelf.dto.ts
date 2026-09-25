import { BookSummaryDto } from '../../books/dto/book-summary.dto';

export class ShelfOwnerDto {
  id!: string;
  username!: string;
}

export class ShelfDto {
  id!: string;
  name!: string;
  description!: string | null;
  /** Private shelves are visible only to their owner */
  isPublic!: boolean;
  /** Number of books on the shelf */
  booksCount!: number;
  owner!: ShelfOwnerDto;
  createdAt!: Date;
}

export class ShelfBookDto {
  /** When the book was added to the shelf */
  addedAt!: Date;
  book!: BookSummaryDto;
}
