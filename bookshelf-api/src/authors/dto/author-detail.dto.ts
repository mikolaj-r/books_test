export class AuthorDetailDto {
  id!: string;
  openLibraryKey!: string | null;
  name!: string;
  bio!: string | null;
  birthDate!: string | null;
  deathDate!: string | null;
  photoUrl!: string | null;
  alternateNames!: string[];
  booksCount!: number;
}
