import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';

export interface DumpLine {
  type: string;
  key: string;
  json: string;
}

export async function* dumpLines(path: string): AsyncGenerator<DumpLine> {
  const file = createReadStream(path);
  const input = path.endsWith('.gz') ? file.pipe(createGunzip()) : file;
  const lines = createInterface({ input, crlfDelay: Infinity });

  for await (const line of lines) {
    const first = line.indexOf('\t');
    const second = line.indexOf('\t', first + 1);
    const third = line.indexOf('\t', second + 1);
    const fourth = line.indexOf('\t', third + 1);
    if (fourth < 0) {
      continue;
    }
    yield {
      type: line.slice(0, first),
      key: line.slice(first + 1, second),
      json: line.slice(fourth + 1),
    };
  }
}

export const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const asString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(asString).filter((item): item is string => item !== null)
    : [];

export const textValue = (value: unknown): string | null =>
  asString(value) ?? asString(asRecord(value)?.value);

export const yearOf = (value: unknown): number | null => {
  const text = asString(value);
  const match = text ? /\b(1[0-9]{3}|20[0-9]{2})\b/.exec(text) : null;
  return match ? Number(match[1]) : null;
};

export const stripKey = (key: string) => key.slice(key.lastIndexOf('/') + 1);

export const keyOf = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value.startsWith('/') ? value : null;
  }
  return asString(asRecord(value)?.key);
};

export const normalizeIsbn = (value: unknown): string | null => {
  const text = asString(value);
  if (!text) {
    return null;
  }
  const isbn = text.replace(/[^0-9Xx]/g, '').toUpperCase();
  return /^\d{9}[\dX]$/.test(isbn) || /^\d{13}$/.test(isbn) ? isbn : null;
};

export const firstIsbn = (value: unknown, length: 10 | 13): string | null =>
  asStringArray(value)
    .map(normalizeIsbn)
    .find((isbn): isbn is string => isbn !== null && isbn.length === length) ??
  null;

export const firstCover = (value: unknown): number | null =>
  Array.isArray(value)
    ? ((value.find((id) => typeof id === 'number' && id > 0) as
        number | undefined) ?? null)
    : null;

export const positiveInt = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const writeJson = (path: string, data: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 1));
};

export const log = (message: string) => {
  process.stderr.write(`${message}\n`);
};
