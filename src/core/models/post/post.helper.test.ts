import { describe, it, expect } from 'vitest';
import * as Core from '@/core';

describe('post.helper (composite id)', () => {
  const author: Core.Pubky = 'operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd0';
  const postId = 'post-123';

  it('buildPostCompositeId should build author:postId', () => {
    const composite = Core.buildPostCompositeId({ pubky: author, postId });
    expect(composite).toBe(`${author}${Core.POST_ID_DELIMITER}${postId}`);
  });

  it('parsePostCompositeId should parse back into parts', () => {
    const composite = Core.buildPostCompositeId({ pubky: author, postId });
    const parts = Core.parsePostCompositeId(composite);
    expect(parts.pubky).toBe(author);
    expect(parts.postId).toBe(postId);
  });

  it('buildPostIdFromPubkyUri should parse uri to composite id', () => {
    const uri = `pubky://${author}/pub/pubky.app/posts/${postId}`;
    const composite = Core.buildPostIdFromPubkyUri(uri);
    expect(composite).toBe(`${author}${Core.POST_ID_DELIMITER}${postId}`);
  });

  it('buildPostIdFromPubkyUri should return null for invalid uri', () => {
    const composite = Core.buildPostIdFromPubkyUri('not-a-uri');
    expect(composite).toBeNull();
  });

  it('round-trip build -> parse -> build is stable', () => {
    const c1 = Core.buildPostCompositeId({ pubky: author, postId });
    const p = Core.parsePostCompositeId(c1);
    const c2 = Core.buildPostCompositeId(p);
    expect(c2).toBe(c1);
  });
});
