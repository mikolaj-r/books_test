export class GenreDto {
  id!: string;
  name!: string;
  /** URL identifier used in /genres/:slug, e.g. science-fiction */
  slug!: string;
  /** Number of books in this genre */
  booksCount!: number;
}
