export class AuthorDetailDto {
  id!: string;
  /** Open Library author key, e.g. OL26320A; null for authors created by an admin */
  openLibraryKey!: string | null;
  name!: string;
  bio!: string | null;
  /** Free text as in Open Library, e.g. "3 January 1892" */
  birthDate!: string | null;
  /** Free text as in Open Library, e.g. "2 September 1973" */
  deathDate!: string | null;
  /** Large photo on covers.openlibrary.org, null when unavailable */
  photoUrl!: string | null;
  alternateNames!: string[];
  /** Number of books by this author in the catalog */
  booksCount!: number;
}
