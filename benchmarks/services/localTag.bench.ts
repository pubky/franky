import 'fake-indexeddb/auto';

import { randomUUID } from 'node:crypto';
import { Bench } from 'tinybench';

import type { Pubky } from '../../src/core/models/models.types.ts';
import { db } from '../../src/core/database/franky/franky.ts';
import { UserCountsModel } from '../../src/core/models/user/counts/userCounts.ts';
import { PostTagsModel } from '../../src/core/models/post/tags/postTags.ts';
import { LocalPostService } from '../../src/core/services/local/post/post.ts';
import { LocalTagService } from '../../src/core/services/local/tag/tag.ts';

const TAGGER_ID: Pubky = 'bench-tagger';
const POST_OWNER: Pubky = 'bench-author';
const POST_ID = `${POST_OWNER}:primary`;

const patchPostTagsModel = () => {
  const model = PostTagsModel as typeof PostTagsModel & { __benchPatched?: boolean };
  if (model.__benchPatched) return;

  model.findById = (async (id: string) => {
    try {
      const record = await model.table.get(id);
      if (!record) {
        return null;
      }
      return new model(record);
    } catch {
      return null;
    }
  }) as typeof model.findById;

  model.__benchPatched = true;
};

const ensureDatabaseReady = async () => {
  await db.delete();
  await db.initialize();
};

const ensureUserCounts = async (pubky: Pubky) => {
  await UserCountsModel.upsert({
    id: pubky,
    tagged: 0,
    tags: 0,
    unique_tags: 0,
    posts: 0,
    replies: 0,
    following: 0,
    followers: 0,
    friends: 0,
    bookmarks: 0,
  });
};

const seedTagScenario = async () => {
  await LocalPostService.create({
    postId: POST_ID,
    content: 'Tag benchmark seed',
    kind: 'short',
    authorId: POST_OWNER,
    parentUri: undefined,
    attachments: undefined,
  });
  await PostTagsModel.upsert({ id: POST_ID, tags: [] });
  const seeded = await PostTagsModel.findById(POST_ID);
  if (!seeded) {
    throw new Error('Failed to seed PostTagsModel for benchmark');
  }
  await ensureUserCounts(TAGGER_ID);
};

export const registerBenchmarks = async (bench: Bench) => {
  patchPostTagsModel();
  await ensureDatabaseReady();
  await seedTagScenario();

  bench.add('LocalTagService.create (unique label)', async () => {
    const label = `bench-${randomUUID()}`;
    await LocalTagService.create({ postId: POST_ID, label, taggerId: TAGGER_ID });
  });

  let currentLabel: string;

  bench.add(
    'LocalTagService.delete (single tagger)',
    async () => {
      await LocalTagService.delete({ postId: POST_ID, label: currentLabel, taggerId: TAGGER_ID });
    },
    {
      beforeEach: async () => {
        currentLabel = `bench-${randomUUID()}`;
        await LocalTagService.create({ postId: POST_ID, label: currentLabel, taggerId: TAGGER_ID });
        const seededTags = await PostTagsModel.findById(POST_ID);
        if (!seededTags) {
          throw new Error('Tag seeding failed before delete benchmark');
        }
      },
    },
  );
};
