import { BookSummaryDto } from '../../books/dto/book-summary.dto';

export class ShelfOwnerDto {
  id!: string;
  username!: string;
}

export class ShelfDto {
  id!: string;
  name!: string;
  description!: string | null;
  isPublic!: boolean;
  booksCount!: number;
  owner!: ShelfOwnerDto;
  createdAt!: Date;
}

export class ShelfBookDto {
  addedAt!: Date;
  book!: BookSummaryDto;
}
