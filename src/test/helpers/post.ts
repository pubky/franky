import {
  type Post,
  type PostPK,
  type PostDetails,
  DEFAULT_POST_COUNTS,
  DEFAULT_POST_RELATIONSHIPS,
  DEFAULT_SYNC_TTL,
} from '@/database/schemas/post';
import { postModel } from '@/database/models/post';
import { generateTestUserId } from './user';

export function generateTestPostId(userId: string, index: number): PostPK {
  return `${userId}:post${index}`;
}

export function createTestPostDetails(overrides: Partial<PostDetails> = {}): PostDetails {
  return {
    attachments: [],
    author: generateTestUserId(0),
    content: 'Test content',
    kind: 'post',
    uri: 'test://post',
    indexed_at: Date.now(),
    ...overrides
  };
}

export async function createTestPost(userId: string, index: number, details: Partial<PostDetails> = {}): Promise<Post> {
  const id = generateTestPostId(userId, index);
  const fullDetails = createTestPostDetails({ ...details, author: userId });
  const post: Post = {
    id,
    details: fullDetails,
    counts: { ...DEFAULT_POST_COUNTS },
    relationships: { ...DEFAULT_POST_RELATIONSHIPS },
    tags: [],
    bookmarked: false,
    indexed_at: null,
    updated_at: Date.now(),
    sync_status: 'local',
    sync_ttl: Date.now() + DEFAULT_SYNC_TTL,
  };
  return postModel.new(post);
}

export async function createTestPosts(userId: string, count: number): Promise<Post[]> {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    posts.push(await createTestPost(userId, i));
  }
  return posts;
} 