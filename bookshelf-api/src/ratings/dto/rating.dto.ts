import { BookSummaryDto } from '../../books/dto/book-summary.dto';
import { UserPublicDto } from '../../users/dto/user-public.dto';

export class RatingEditionDto {
  id!: string;
  title!: string;
}

export class RatingDto {
  id!: string;
  /** Rating on the 1-10 scale */
  value!: number;
  review!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  /** Public profile of the reviewer */
  user!: UserPublicDto;
  /** Edition the rating refers to, when the reviewer specified one */
  edition!: RatingEditionDto | null;
}

export class UserRatingDto {
  id!: string;
  /** Rating on the 1-10 scale */
  value!: number;
  review!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  book!: BookSummaryDto;
  /** Edition the rating refers to, when the reviewer specified one */
  edition!: RatingEditionDto | null;
}
