export class AuthorSummaryDto {
  id!: string;
  name!: string;
  /** Medium-size photo on covers.openlibrary.org, null when unavailable */
  photoUrl!: string | null;
}
