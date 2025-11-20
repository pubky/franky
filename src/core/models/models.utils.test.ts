import { describe, it, expect } from 'vitest';
import * as Core from '@/core';

describe('models.utils (composite id)', () => {
  const author: Core.Pubky = 'operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd0';
  const postId = 'post-123';

  it('buildCompositeId', () => {
    const composite = Core.buildCompositeId({ pubky: author, id: postId });
    expect(composite).toBe(`${author}${Core.COMPOSITE_ID_DELIMITER}${postId}`);
  });

  it('parseCompositeId', () => {
    const composite = Core.buildCompositeId({ pubky: author, id: postId });
    const parts = Core.parseCompositeId(composite);
    expect(parts.pubky).toBe(author);
    expect(parts.id).toBe(postId);
  });

  it('buildCompositeIdFromPubkyUri for posts', () => {
    const uri = `pubky://${author}/pub/pubky.app/posts/${postId}`;
    const composite = Core.buildCompositeIdFromPubkyUri({ uri, domain: Core.CompositeIdDomain.POSTS });
    expect(composite).toBe(`${author}${Core.COMPOSITE_ID_DELIMITER}${postId}`);
  });

  it('buildCompositeIdFromPubkyUri for files', () => {
    const fileId = 'file-456';
    const uri = `pubky://${author}/pub/pubky.app/files/${fileId}`;
    const composite = Core.buildCompositeIdFromPubkyUri({ uri, domain: Core.CompositeIdDomain.FILES });
    expect(composite).toBe(`${author}${Core.COMPOSITE_ID_DELIMITER}${fileId}`);
  });

  it('buildCompositeIdFromPubkyUri returns null for invalid uri', () => {
    const composite = Core.buildCompositeIdFromPubkyUri({ uri: 'not-a-uri', domain: Core.CompositeIdDomain.POSTS });
    expect(composite).toBeNull();
  });

  it('round-trip is stable', () => {
    const c1 = Core.buildCompositeId({ pubky: author, id: postId });
    const parts = Core.parseCompositeId(c1);
    const c2 = Core.buildCompositeId(parts);
    expect(c2).toBe(c1);
  });
});
