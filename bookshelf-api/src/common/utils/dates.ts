export const toDateOnly = (date: Date | null | undefined) =>
  date ? date.toISOString().slice(0, 10) : null;

export const fromDateOnly = (value: string) => new Date(`${value}T00:00:00Z`);

export const today = () => fromDateOnly(new Date().toISOString().slice(0, 10));
