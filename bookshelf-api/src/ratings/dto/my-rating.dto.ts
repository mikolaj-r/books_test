export class MyRatingDto {
  id!: string;
  value!: number;
  review!: string | null;
  editionId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
