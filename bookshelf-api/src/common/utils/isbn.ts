export const normalizeIsbn = (value: string) => {
  const isbn = value.replace(/[^0-9Xx]/g, '').toUpperCase();
  return /^\d{9}[\dX]$/.test(isbn) || /^\d{13}$/.test(isbn) ? isbn : null;
};
