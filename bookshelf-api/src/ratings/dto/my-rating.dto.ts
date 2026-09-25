export class MyRatingDto {
  id!: string;
  /** Rating on the 1-10 scale */
  value!: number;
  review!: string | null;
  /** Edition the rating refers to, when specified */
  editionId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
