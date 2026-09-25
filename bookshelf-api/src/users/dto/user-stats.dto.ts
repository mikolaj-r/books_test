export class UserStatsDto {
  /** Library entries with status READ */
  booksRead!: number;
  /** Ratings given by the user */
  ratingsCount!: number;
  /** Average of the ratings given by the user, null when there are none */
  averageRating!: number | null;
  /** For other users' profiles only public shelves are counted */
  shelvesCount!: number;
}
