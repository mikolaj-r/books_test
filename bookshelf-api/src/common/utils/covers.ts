export type CoverSize = 'S' | 'M' | 'L';

const COVERS_BASE = 'https://covers.openlibrary.org';

export const coverUrl = (coverId: number | null, size: CoverSize = 'M') =>
  coverId ? `${COVERS_BASE}/b/id/${coverId}-${size}.jpg` : null;

export const authorPhotoUrl = (
  photoId: number | null,
  size: CoverSize = 'M',
) => (photoId ? `${COVERS_BASE}/a/id/${photoId}-${size}.jpg` : null);

export const coverUrls = (coverId: number | null) => ({
  small: coverUrl(coverId, 'S'),
  medium: coverUrl(coverId, 'M'),
  large: coverUrl(coverId, 'L'),
});
