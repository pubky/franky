import { type Post, type PostDetails } from '@/database/schemas/post';
import { PostController } from '@/database/controllers/post';
import { generateTestUserId } from './user';
import { PostPK } from '@/database/types';
import { DEFAULT_POST_COUNTS } from '@/database/defaults';
import { DEFAULT_POST_RELATIONSHIPS } from '@/database/defaults';
import { SYNC_TTL } from '@/database/config';

export function generateTestPostId(userId: string, index: number): PostPK {
  return `${userId}:post${index}`;
}

export function createTestPostDetails(overrides: Partial<PostDetails> = {}): PostDetails {
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

export async function createTestPost(userId: string, index: number, details: Partial<PostDetails> = {}): Promise<Post> {
  const id = generateTestPostId(userId, index);
  const fullDetails = createTestPostDetails({ ...details, author: userId });
  const post: Post = {
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
  return PostController.create(post);
}

export async function createTestPosts(userId: string, count: number): Promise<Post[]> {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    posts.push(await createTestPost(userId, i));
  }
  return posts;
}
