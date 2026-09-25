import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  asRecord,
  asString,
  asStringArray,
  dumpLines,
  firstCover,
  firstIsbn,
  keyOf,
  log,
  positiveInt,
  slugify,
  stripKey,
  textValue,
  writeJson,
  yearOf,
} from './dump';

interface WorkRecord {
  key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverId: number | null;
  firstPublishYear: number | null;
  authorKeys: string[];
  subjects: string[];
  coverEditionKey: string | null;
  editions: EditionRecord[];
}

interface EditionRecord {
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
  authorKeys: string[];
  score: number;
}

interface AuthorRecord {
  key: string;
  name: string;
  bio: string | null;
  birthDate: string | null;
  deathDate: string | null;
  photoId: number | null;
  alternateNames: string[];
}

interface RatingAggregate {
  count: number;
  average: number;
}

const MAX_CANDIDATES = 50;
const MAX_GENRES_PER_WORK = 5;
const SUBJECT_DENYLIST = [
  'accessible book',
  'protected daisy',
  'in library',
  'overdrive',
  'large type',
  'lending library',
  'staff picks',
  'internet archive',
  'reading level',
  'bestseller',
  'nyt:',
  'collectionid:',
  'long now manual',
  'open library',
  'print disabled',
];

const { values: args } = parseArgs({
  options: {
    works: { type: 'string' },
    authors: { type: 'string' },
    editions: { type: 'string' },
    keys: { type: 'string', default: 'tmp/work-keys.txt' },
    ratings: { type: 'string', default: 'tmp/ratings-agg.json' },
    out: { type: 'string', default: 'data/openlibrary' },
    tmp: { type: 'string', default: 'tmp' },
    stage: { type: 'string', default: 'all' },
    'editions-per-work': { type: 'string', default: '5' },
    genres: { type: 'string', default: '40' },
    'min-genre-books': { type: 'string', default: '3' },
  },
});

const editionsPerWork = Number(args['editions-per-work']);
const genresLimit = Number(args.genres);
const minGenreBooks = Number(args['min-genre-books']);
const stageFile = join(args.tmp, 'extract-stage.json');
const authorKeysFile = join(args.tmp, 'author-keys.txt');

const authorKeysOf = (value: unknown): string[] => {
  const keys = Array.isArray(value)
    ? value.map((item) => keyOf(asRecord(item)?.author) ?? keyOf(item))
    : [];
  return [
    ...new Set(
      keys.filter(
        (key): key is string => key?.startsWith('/authors/') ?? false,
      ),
    ),
  ];
};

async function readWorks(path: string, wanted: Set<string>) {
  const works = new Map<string, WorkRecord>();
  for await (const line of dumpLines(path)) {
    if (line.type !== '/type/work' || !wanted.has(line.key)) {
      continue;
    }
    const raw = JSON.parse(line.json) as Record<string, unknown>;
    const title = asString(raw.title);
    if (!title) {
      continue;
    }
    works.set(line.key, {
      key: line.key,
      title,
      subtitle: asString(raw.subtitle),
      description: textValue(raw.description),
      coverId: firstCover(raw.covers),
      firstPublishYear: yearOf(raw.first_publish_date),
      authorKeys: authorKeysOf(raw.authors),
      subjects: asStringArray(raw.subjects),
      coverEditionKey: keyOf(raw.cover_edition),
      editions: [],
    });
  }
  log(`works: ${works.size} of ${wanted.size} keys found`);
  return works;
}

const WORK_KEY_PATTERN = /"works":\s*\[\s*\{\s*"key":\s*"([^"]+)"/;

const compareEditions = (a: EditionRecord, b: EditionRecord) =>
  b.score - a.score || (b.publishYear ?? -1) - (a.publishYear ?? -1);

async function readEditions(path: string, works: Map<string, WorkRecord>) {
  const candidates = new Map<string, EditionRecord[]>();
  const minYear = new Map<string, number>();
  const anyCover = new Map<string, number>();
  let matched = 0;

  for await (const line of dumpLines(path)) {
    if (line.type !== '/type/edition') {
      continue;
    }
    const workKey = WORK_KEY_PATTERN.exec(line.json)?.[1];
    const work = workKey ? works.get(workKey) : undefined;
    if (!workKey || !work) {
      continue;
    }
    const raw = JSON.parse(line.json) as Record<string, unknown>;
    const title = [asString(raw.title_prefix), asString(raw.title)]
      .filter((part): part is string => part !== null)
      .join(' ');
    if (!title) {
      continue;
    }
    matched += 1;

    const languages = Array.isArray(raw.languages)
      ? raw.languages
          .map((language) => keyOf(language))
          .filter((key): key is string => key !== null)
          .map(stripKey)
      : [];
    const edition: EditionRecord = {
      key: line.key,
      workKey,
      title,
      subtitle: asString(raw.subtitle),
      publishers: asStringArray(raw.publishers),
      publishDate: asString(raw.publish_date),
      publishYear: yearOf(raw.publish_date),
      pageCount: positiveInt(raw.number_of_pages),
      isbn10: firstIsbn(raw.isbn_10, 10),
      isbn13: firstIsbn(raw.isbn_13, 13),
      languages,
      physicalFormat: asString(raw.physical_format),
      coverId: firstCover(raw.covers),
      authorKeys: authorKeysOf(raw.authors),
      score: 0,
    };
    edition.score =
      (edition.isbn13 ? 4 : 0) +
      (edition.coverId ? 3 : 0) +
      (languages.some((code) => code === 'eng' || code === 'pol') ? 2 : 0) +
      (edition.pageCount ? 1 : 0) +
      (line.key === work.coverEditionKey ? 3 : 0);

    if (edition.publishYear) {
      minYear.set(
        workKey,
        Math.min(
          minYear.get(workKey) ?? edition.publishYear,
          edition.publishYear,
        ),
      );
    }
    if (edition.coverId && !anyCover.has(workKey)) {
      anyCover.set(workKey, edition.coverId);
    }

    const list = candidates.get(workKey) ?? [];
    list.push(edition);
    if (list.length > MAX_CANDIDATES) {
      list.sort(compareEditions).length = MAX_CANDIDATES;
    }
    candidates.set(workKey, list);
  }

  for (const work of works.values()) {
    work.editions = (candidates.get(work.key) ?? [])
      .sort(compareEditions)
      .slice(0, editionsPerWork);
    work.coverId ??=
      work.editions.find((edition) => edition.coverId)?.coverId ??
      anyCover.get(work.key) ??
      null;
    work.firstPublishYear ??= minYear.get(work.key) ?? null;
    if (work.authorKeys.length === 0) {
      work.authorKeys = [
        ...new Set(work.editions.flatMap((edition) => edition.authorKeys)),
      ];
    }
  }
  log(
    `editions: ${matched} matched, ${[...works.values()].reduce((sum, work) => sum + work.editions.length, 0)} selected`,
  );
}

async function readAuthors(path: string, wanted: Set<string>) {
  const authors = new Map<string, AuthorRecord>();
  for await (const line of dumpLines(path)) {
    if (line.type !== '/type/author' || !wanted.has(line.key)) {
      continue;
    }
    const raw = JSON.parse(line.json) as Record<string, unknown>;
    const name = asString(raw.name) ?? asString(raw.personal_name);
    if (!name) {
      continue;
    }
    authors.set(line.key, {
      key: line.key,
      name,
      bio: textValue(raw.bio),
      birthDate: asString(raw.birth_date),
      deathDate: asString(raw.death_date),
      photoId: firstCover(raw.photos),
      alternateNames: asStringArray(raw.alternate_names).slice(0, 10),
    });
  }
  log(`authors: ${authors.size} of ${wanted.size} keys found`);
  return authors;
}

const normalizeSubject = (subject: string) =>
  subject
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,\s*general$/, '');

const titleCase = (value: string) =>
  value.replace(
    /(^|[\s(/-])([a-z])/g,
    (_, prefix: string, letter: string) => prefix + letter.toUpperCase(),
  );

function buildGenres(works: WorkRecord[]) {
  const counts = new Map<string, number>();
  for (const work of works) {
    for (const subject of new Set(work.subjects.map(normalizeSubject))) {
      counts.set(subject, (counts.get(subject) ?? 0) + 1);
    }
  }

  const genres = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  const ranked = [...counts.entries()]
    .filter(
      ([subject, count]) =>
        count >= minGenreBooks &&
        subject.length > 1 &&
        subject.length <= 50 &&
        !SUBJECT_DENYLIST.some((denied) => subject.includes(denied)),
    )
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b));

  for (const [subject, count] of ranked) {
    if (genres.size >= genresLimit) {
      break;
    }
    const name = titleCase(subject);
    const slug = slugify(name);
    if (slug && ![...genres.values()].some((genre) => genre.slug === slug)) {
      genres.set(subject, { name, slug, count });
    }
  }
  return genres;
}

function writeOutputs(
  works: WorkRecord[],
  authors: Map<string, AuthorRecord>,
  ratings: Record<string, RatingAggregate>,
) {
  const genres = buildGenres(works);
  const genreSlugsOf = (work: WorkRecord) =>
    [...new Set(work.subjects.map(normalizeSubject))]
      .map((subject) => genres.get(subject))
      .filter(
        (genre): genre is NonNullable<typeof genre> => genre !== undefined,
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_GENRES_PER_WORK)
      .map((genre) => genre.slug);

  const sortedWorks = [...works].sort(
    (a, b) =>
      (ratings[stripKey(b.key)]?.count ?? 0) -
        (ratings[stripKey(a.key)]?.count ?? 0) || a.key.localeCompare(b.key),
  );

  const usedIsbns = new Set<string>();
  const dedupeIsbn = (isbn: string | null) => {
    if (!isbn || usedIsbns.has(isbn)) {
      return null;
    }
    usedIsbns.add(isbn);
    return isbn;
  };

  const worksJson = sortedWorks.map((work) => {
    const rating = ratings[stripKey(work.key)];
    return {
      key: stripKey(work.key),
      title: work.title,
      subtitle: work.subtitle,
      description: work.description,
      coverId: work.coverId,
      firstPublishYear: work.firstPublishYear,
      authorKeys: work.authorKeys
        .filter((key) => authors.has(key))
        .map(stripKey),
      genreSlugs: genreSlugsOf(work),
      olRatingsCount: rating?.count ?? null,
      olAverageRating: rating ? Math.round(rating.average * 200) / 100 : null,
    };
  });
  const editionsJson = sortedWorks.flatMap((work) =>
    work.editions.map((edition) => ({
      key: stripKey(edition.key),
      workKey: stripKey(work.key),
      title: edition.title,
      subtitle: edition.subtitle,
      publishers: edition.publishers,
      publishDate: edition.publishDate,
      publishYear: edition.publishYear,
      pageCount: edition.pageCount,
      isbn10: dedupeIsbn(edition.isbn10),
      isbn13: dedupeIsbn(edition.isbn13),
      languages: edition.languages,
      physicalFormat: edition.physicalFormat,
      coverId: edition.coverId,
    })),
  );
  const authorsJson = [...authors.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((author) => ({ ...author, key: stripKey(author.key) }));
  const genresJson = [...genres.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, slug }) => ({ name, slug }));

  writeJson(join(args.out, 'works.json'), worksJson);
  writeJson(join(args.out, 'authors.json'), authorsJson);
  writeJson(join(args.out, 'editions.json'), editionsJson);
  writeJson(join(args.out, 'genres.json'), genresJson);

  log(
    `written to ${args.out}: ${worksJson.length} works, ${authorsJson.length} authors, ${editionsJson.length} editions, ${genresJson.length} genres`,
  );
  log(
    `works without authors: ${worksJson.filter((work) => work.authorKeys.length === 0).length}`,
  );
  log(
    `works without editions: ${sortedWorks.filter((work) => work.editions.length === 0).length}`,
  );
  log(
    `works without cover: ${worksJson.filter((work) => work.coverId === null).length}`,
  );
  log(
    `works without genres: ${worksJson.filter((work) => work.genreSlugs.length === 0).length}`,
  );
}

async function main() {
  let works: WorkRecord[];

  if (args.works) {
    const wanted = new Set(
      readFileSync(args.keys, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('/works/')),
    );
    const found = await readWorks(args.works, wanted);
    if (!args.editions) {
      throw new Error('--editions is required together with --works');
    }
    await readEditions(args.editions, found);
    works = [...found.values()];
    mkdirSync(args.tmp, { recursive: true });
    writeFileSync(stageFile, JSON.stringify(works));
  } else if (existsSync(stageFile)) {
    works = JSON.parse(readFileSync(stageFile, 'utf8')) as WorkRecord[];
    log(`loaded ${works.length} works from ${stageFile}`);
  } else {
    throw new Error('Pass --works and --editions, or run --stage works first');
  }

  const authorKeys = new Set(works.flatMap((work) => work.authorKeys));
  writeFileSync(authorKeysFile, [...authorKeys].join('\n') + '\n');
  log(`author keys: ${authorKeys.size} written to ${authorKeysFile}`);

  if (args.stage === 'works') {
    log(
      `stage "works" done; filter the authors dump with ${authorKeysFile} and run --stage all --authors <file>`,
    );
    return;
  }
  if (!args.authors) {
    throw new Error('--authors is required for stage "all"');
  }

  const authors = await readAuthors(args.authors, authorKeys);
  const ratings = existsSync(args.ratings)
    ? (JSON.parse(readFileSync(args.ratings, 'utf8')) as Record<
        string,
        RatingAggregate
      >)
    : {};
  writeOutputs(works, authors, ratings);
}

main().catch((error: unknown) => {
  log(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
