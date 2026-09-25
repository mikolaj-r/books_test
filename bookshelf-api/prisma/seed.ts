import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client';
import { ReadingStatus, Role } from '../src/generated/prisma/enums';

interface WorkJson {
  key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverId: number | null;
  firstPublishYear: number | null;
  authorKeys: string[];
  genreSlugs: string[];
  olRatingsCount: number | null;
  olAverageRating: number | null;
}

interface AuthorJson {
  key: string;
  name: string;
  bio: string | null;
  birthDate: string | null;
  deathDate: string | null;
  photoId: number | null;
  alternateNames: string[];
}

interface EditionJson {
  key: string;
  workKey: string;
  title: string;
  subtitle: string | null;
  publishers: string[];
  publishDate: string | null;
  publishYear: number | null;
  pageCount: number | null;
  isbn10: string | null;
  isbn13: string | null;
  languages: string[];
  physicalFormat: string | null;
  coverId: number | null;
}

interface GenreJson {
  name: string;
  slug: string;
}

const SALT_ROUNDS = 10;
const DEMO_EMAIL = 'demo@bookshelf.local';
const dataDir = join(__dirname, '../data/openlibrary');

const readJson = <T>(name: string): T =>
  JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T;

const round2 = (value: number) => Math.round(value * 100) / 100;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

async function seedCatalog() {
  if (!existsSync(join(dataDir, 'works.json'))) {
    console.log(
      `No catalog files in ${dataDir}, skipping import (run pnpm ol:select and pnpm ol:extract first)`,
    );
    return;
  }
  const genres = readJson<GenreJson[]>('genres.json');
  const authors = readJson<AuthorJson[]>('authors.json');
  const works = readJson<WorkJson[]>('works.json');
  const editions = readJson<EditionJson[]>('editions.json');

  await prisma.genre.createMany({ data: genres, skipDuplicates: true });
  await prisma.author.createMany({
    data: authors.map(({ key, ...author }) => ({
      openLibraryKey: key,
      ...author,
    })),
    skipDuplicates: true,
  });
  await prisma.book.createMany({
    data: works.map(
      ({ key, authorKeys: _authors, genreSlugs: _genres, ...book }) => ({
        openLibraryKey: key,
        ...book,
      }),
    ),
    skipDuplicates: true,
  });

  const bookIds = new Map<string, string>();
  for (const book of await prisma.book.findMany({
    where: { openLibraryKey: { not: null } },
    select: { id: true, openLibraryKey: true },
  })) {
    if (book.openLibraryKey) bookIds.set(book.openLibraryKey, book.id);
  }
  const authorIds = new Map<string, string>();
  for (const author of await prisma.author.findMany({
    where: { openLibraryKey: { not: null } },
    select: { id: true, openLibraryKey: true },
  })) {
    if (author.openLibraryKey) authorIds.set(author.openLibraryKey, author.id);
  }
  const genreIds = new Map(
    (await prisma.genre.findMany({ select: { id: true, slug: true } })).map(
      (genre) => [genre.slug, genre.id],
    ),
  );

  await prisma.bookAuthor.createMany({
    data: works.flatMap((work) => {
      const bookId = bookIds.get(work.key);
      return bookId
        ? work.authorKeys.flatMap((key, position) => {
            const authorId = authorIds.get(key);
            return authorId ? [{ bookId, authorId, position }] : [];
          })
        : [];
    }),
    skipDuplicates: true,
  });
  await prisma.bookGenre.createMany({
    data: works.flatMap((work) => {
      const bookId = bookIds.get(work.key);
      return bookId
        ? work.genreSlugs.flatMap((slug) => {
            const genreId = genreIds.get(slug);
            return genreId ? [{ bookId, genreId }] : [];
          })
        : [];
    }),
    skipDuplicates: true,
  });
  await prisma.edition.createMany({
    data: editions.flatMap(({ key, workKey, ...edition }) => {
      const bookId = bookIds.get(workKey);
      return bookId ? [{ openLibraryKey: key, bookId, ...edition }] : [];
    }),
    skipDuplicates: true,
  });
}

async function seedAdmin() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? 'admin@bookshelf.local'
  ).toLowerCase();
  const username = (process.env.SEED_ADMIN_USERNAME ?? 'admin').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: {
      email,
      username,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      displayName: 'Administrator',
      role: Role.ADMIN,
    },
  });
}

async function seedDemo() {
  if (await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })) {
    return;
  }
  const demo = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      username: 'demo',
      passwordHash: await bcrypt.hash('Demo1234!', SALT_ROUNDS),
      displayName: 'Demo Reader',
      bio: 'Sample account with a few ratings, library entries and a shelf.',
    },
  });

  const books = await prisma.book.findMany({
    where: { editions: { some: {} } },
    orderBy: { olRatingsCount: { sort: 'desc', nulls: 'last' } },
    take: 3,
    include: { editions: { take: 1 } },
  });
  if (books.length < 3) {
    return;
  }
  const [first, second, third] = books;
  const year = new Date().getUTCFullYear();

  await prisma.rating.createMany({
    data: [
      {
        userId: demo.id,
        bookId: first.id,
        editionId: first.editions[0].id,
        value: 9,
        review: 'One of those books I keep coming back to every few years.',
      },
      { userId: demo.id, bookId: second.id, value: 7 },
      { userId: demo.id, bookId: third.id, value: 8 },
    ],
  });
  await prisma.libraryEntry.createMany({
    data: [
      {
        userId: demo.id,
        bookId: first.id,
        editionId: first.editions[0].id,
        status: ReadingStatus.READ,
        startedAt: new Date(`${year}-01-10T00:00:00Z`),
        finishedAt: new Date(`${year}-02-02T00:00:00Z`),
      },
      {
        userId: demo.id,
        bookId: second.id,
        status: ReadingStatus.READING,
        startedAt: new Date(`${year}-03-01T00:00:00Z`),
        currentPage: 120,
      },
      { userId: demo.id, bookId: third.id, status: ReadingStatus.WANT_TO_READ },
    ],
  });
  await prisma.shelf.create({
    data: {
      userId: demo.id,
      name: 'Favourites',
      description: 'Books I recommend to everyone.',
      isPublic: true,
      books: { create: [{ bookId: first.id }, { bookId: second.id }] },
    },
  });
  await prisma.readingGoal.create({
    data: { userId: demo.id, year, targetBooks: 12 },
  });

  await recountRatings([first.id, second.id, third.id]);
}

async function recountRatings(bookIds: string[]) {
  const groups = await prisma.rating.groupBy({
    by: ['bookId'],
    where: { bookId: { in: bookIds } },
    _count: { _all: true },
    _sum: { value: true },
  });
  for (const group of groups) {
    const ratingSum = group._sum.value ?? 0;
    await prisma.book.update({
      where: { id: group.bookId },
      data: {
        ratingsCount: group._count._all,
        ratingSum,
        averageRating: round2(ratingSum / group._count._all),
      },
    });
  }
}

async function printCounts() {
  const tables = {
    users: prisma.user.count(),
    authors: prisma.author.count(),
    books: prisma.book.count(),
    editions: prisma.edition.count(),
    genres: prisma.genre.count(),
    ratings: prisma.rating.count(),
    libraryEntries: prisma.libraryEntry.count(),
    shelves: prisma.shelf.count(),
    readingGoals: prisma.readingGoal.count(),
  };
  for (const [table, count] of Object.entries(tables)) {
    console.log(`${table}: ${await count}`);
  }
}

async function main() {
  await seedCatalog();
  await seedAdmin();
  await seedDemo();
  await printCounts();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
