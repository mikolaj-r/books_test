import { BookSummaryDto } from '../../books/dto/book-summary.dto';
import { UserPublicDto } from '../../users/dto/user-public.dto';

export class RatingEditionDto {
  id!: string;
  title!: string;
}

export class RatingDto {
  id!: string;
  value!: number;
  review!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  user!: UserPublicDto;
  edition!: RatingEditionDto | null;
}

export class UserRatingDto {
  id!: string;
  value!: number;
  review!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  book!: BookSummaryDto;
  edition!: RatingEditionDto | null;
}
