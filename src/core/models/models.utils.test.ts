import { describe, it, expect } from 'vitest';
import * as Core from '@/core';

describe('models.utils (composite id)', () => {
  const author: Core.Pubky = 'operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd0';
  const postId = 'post-123';

  it('buildCompositeId should build author:id', () => {
    const composite = Core.buildCompositeId({ pubky: author, id: postId });
    expect(composite).toBe(`${author}${Core.COMPOSITE_ID_DELIMITER}${postId}`);
  });

  it('parseCompositeId should parse back into parts', () => {
    const composite = Core.buildCompositeId({ pubky: author, id: postId });
    const parts = Core.parseCompositeId(composite);
    expect(parts.pubky).toBe(author);
    expect(parts.id).toBe(postId);
  });

  it('buildCompositeIdFromPubkyUri should parse uri to composite id for posts', () => {
    const uri = `pubky://${author}/pub/pubky.app/posts/${postId}`;
    const composite = Core.buildCompositeIdFromPubkyUri({ uri, domain: 'posts' });
    expect(composite).toBe(`${author}${Core.COMPOSITE_ID_DELIMITER}${postId}`);
  });

  it('buildCompositeIdFromPubkyUri should parse uri to composite id for files', () => {
    const fileId = 'file-456';
    const uri = `pubky://${author}/pub/pubky.app/files/${fileId}`;
    const composite = Core.buildCompositeIdFromPubkyUri({ uri, domain: 'files' });
    expect(composite).toBe(`${author}${Core.COMPOSITE_ID_DELIMITER}${fileId}`);
  });

  it('buildCompositeIdFromPubkyUri should return null for invalid uri', () => {
    const composite = Core.buildCompositeIdFromPubkyUri({ uri: 'not-a-uri', domain: 'posts' });
    expect(composite).toBeNull();
  });

  it('round-trip build -> parse -> build is stable', () => {
    const c1 = Core.buildCompositeId({ pubky: author, id: postId });
    const p = Core.parseCompositeId(c1);
    const c2 = Core.buildCompositeId(p);
    expect(c2).toBe(c1);
  });
});
