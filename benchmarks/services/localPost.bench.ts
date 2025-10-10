import 'fake-indexeddb/auto';

import { randomUUID } from 'node:crypto';
import { Bench } from 'tinybench';

import * as Core from '../../src/core/index.ts';
import { LocalPostService } from '../../src/core/services/local/post/post.ts';
import { traceAsync } from '../runtime.ts';

const SEED_AUTHOR = 'bench-author';

const seedPosts = async (count: number) => {
  for (let index = 0; index < count; index += 1) {
    const postId = `${SEED_AUTHOR}:${index}`;
    await LocalPostService.create({
      postId,
      content: `Seed content ${index}`,
      kind: 'short',
      authorId: SEED_AUTHOR,
      parentUri: undefined,
      attachments: undefined,
    });
  }
};

const ensureDatabaseReady = async () => {
  await Core.db.delete();
  await Core.db.initialize();
};

export const registerBenchmarks = async (bench: Bench) => {
  await ensureDatabaseReady();
  await seedPosts(12);

  bench.add('LocalPostService.fetch (limit=5)', async () => {
    await LocalPostService.fetch({ limit: 5, offset: 0 });
  });

  bench.add(
    'LocalPostService.create (root post)',
    async () => {
      const id = randomUUID();
      const author = `${SEED_AUTHOR}-runtime`;
      await LocalPostService.create({
        postId: `${author}:${id}`,
        content: 'Benchmark content',
        kind: 'short',
        authorId: author,
        parentUri: undefined,
        attachments: undefined,
      });
    },
    {
      beforeEach: async () => {
        await traceAsync('local-service', 'LocalPostService.prepare', async () => {
          // noop placeholder for warmup visibility
        });
      },
    },
  );
};
