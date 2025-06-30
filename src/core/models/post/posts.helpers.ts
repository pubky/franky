import {
  type NexusPostDetails,
  type PostModelSchema,
  PostController,
  PostModelPK,
  DEFAULT_POST_COUNTS,
  DEFAULT_POST_RELATIONSHIPS,
  generateTestUserId,
  PostModel,
} from '@/core';
import { SYNC_TTL } from '@/config';

export function generateTestPostId(userId: string, index: number): PostModelPK {
  return `${userId}:post${index}` as PostModelPK;
}

export function createTestPostDetails(overrides: Partial<NexusPostDetails> = {}): NexusPostDetails {
  return {
    id: generateTestPostId(generateTestUserId(0), 0),
    attachments: [],
    author: generateTestUserId(0),
    content: 'Test content',
    kind: 'short',
    uri: 'test://post',
    indexed_at: Date.now(),
    ...overrides,
  };
}

export async function createTestPost(
  userId: string,
  index: number,
  details: Partial<NexusPostDetails> = {},
): Promise<PostModel> {
  const id = generateTestPostId(userId, index);
  const fullDetails = createTestPostDetails({ ...details, author: userId });
  const post: PostModelSchema = {
    created_at: Date.now(),
    id,
    details: fullDetails,
    counts: { ...DEFAULT_POST_COUNTS },
    relationships: { ...DEFAULT_POST_RELATIONSHIPS },
    tags: [],
    bookmark: null,
    indexed_at: null,
    sync_status: 'local',
    sync_ttl: Date.now() + SYNC_TTL,
  };
  return await PostController.save(post);
}

export async function createTestPosts(userId: string, count: number): Promise<PostModel[]> {
  const posts: PostModel[] = [];
  for (let i = 0; i < count; i++) {
    posts.push(await createTestPost(userId, i));
  }
  return posts;
}
