import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { parseArgs } from 'node:util';
import { createGunzip } from 'node:zlib';
import { log, stripKey, writeJson } from './dump';

interface Aggregate {
  count: number;
  sum: number;
}

const { values: args } = parseArgs({
  options: {
    ratings: { type: 'string' },
    top: { type: 'string', default: '500' },
    out: { type: 'string', default: 'tmp' },
  },
});

if (!args.ratings) {
  log(
    'Usage: select-works --ratings <ol_dump_ratings.txt[.gz]> [--top 500] [--out tmp]',
  );
  process.exit(1);
}

async function main(ratingsPath: string, top: number, out: string) {
  const file = createReadStream(ratingsPath);
  const input = ratingsPath.endsWith('.gz') ? file.pipe(createGunzip()) : file;
  const aggregates = new Map<string, Aggregate>();
  let rows = 0;
  let skipped = 0;

  for await (const line of createInterface({ input, crlfDelay: Infinity })) {
    const [workKey, , rating] = line.split('\t');
    const value = Number(rating);
    if (
      !workKey?.startsWith('/works/') ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      skipped += 1;
      continue;
    }
    rows += 1;
    const aggregate = aggregates.get(workKey) ?? { count: 0, sum: 0 };
    aggregate.count += 1;
    aggregate.sum += value;
    aggregates.set(workKey, aggregate);
  }

  const selected = [...aggregates.entries()]
    .sort(
      ([, a], [, b]) => b.count - a.count || b.sum / b.count - a.sum / a.count,
    )
    .slice(0, top);

  mkdirSync(out, { recursive: true });
  writeFileSync(
    join(out, 'work-keys.txt'),
    selected.map(([key]) => key).join('\n') + '\n',
  );
  writeJson(
    join(out, 'ratings-agg.json'),
    Object.fromEntries(
      selected.map(([key, { count, sum }]) => [
        stripKey(key),
        { count, average: Math.round((sum / count) * 100) / 100 },
      ]),
    ),
  );

  const last = selected.at(-1);
  log(
    `ratings rows: ${rows} (skipped ${skipped}), rated works: ${aggregates.size}`,
  );
  log(
    `selected ${selected.length} works, lowest ratings count: ${last?.[1].count ?? 0}`,
  );
  log(
    `written ${join(out, 'work-keys.txt')} and ${join(out, 'ratings-agg.json')}`,
  );
}

main(args.ratings, Number(args.top), args.out).catch((error: unknown) => {
  log(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
