import { Rating } from '../generated/prisma/client';
import { MyRatingDto } from './dto/my-rating.dto';

export const toMyRating = (rating: Rating): MyRatingDto => ({
  id: rating.id,
  value: rating.value,
  review: rating.review,
  editionId: rating.editionId,
  createdAt: rating.createdAt,
  updatedAt: rating.updatedAt,
});
