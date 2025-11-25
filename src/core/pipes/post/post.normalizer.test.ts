import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { PubkyAppPostKind, PubkySpecsBuilder, PostResult, PubkyAppPostEmbed } from 'pubky-app-specs';
import type { FileResult } from 'pubky-app-specs';

describe('PostNormalizer', () => {
  const testData = {
    authorPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
    postId: 'abc123',
    embeddedPostId: 'embedded:post123',
    embeddedUri: 'pubky://embedded/pub/pubky.app/posts/post123',
  };

  // Test data factories
  const createBasicPostValidatorData = (): Core.PostValidatorData => ({
    content: 'Hello, world!',
    kind: PubkyAppPostKind.Short,
  });

  const createPostValidatorDataWithAttachments = (): Core.PostValidatorData => {
    const mockFileResult1: FileResult = {
      file: {
        toJson: vi.fn(() => ({
          id: 'file-1',
          src: 'pubky://author/pub/pubky.app/blobs/blob123',
          content_type: 'image/png',
          size: 1024,
        })),
      },
      meta: { url: 'pubky://author/pub/pubky.app/files/file123' },
    } as unknown as FileResult;

    const mockFileResult2: FileResult = {
      file: {
        toJson: vi.fn(() => ({
          id: 'file-2',
          src: 'pubky://author/pub/pubky.app/blobs/blob456',
          content_type: 'image/png',
          size: 2048,
        })),
      },
      meta: { url: 'pubky://author/pub/pubky.app/files/file456' },
    } as unknown as FileResult;

    return {
      content: 'Post with attachments',
      kind: PubkyAppPostKind.Short,
      attachments: [
        {
          blobResult: {
            blob: { data: new Uint8Array([1, 2, 3]) },
            meta: { url: 'pubky://author/pub/pubky.app/blobs/blob123' },
          } as unknown as any,
          fileResult: mockFileResult1,
        },
        {
          blobResult: {
            blob: { data: new Uint8Array([4, 5, 6]) },
            meta: { url: 'pubky://author/pub/pubky.app/blobs/blob456' },
          } as unknown as any,
          fileResult: mockFileResult2,
        },
      ],
    };
  };

  const createMockPostDetails = (id: string, kind: string = 'short'): Core.PostDetailsModelSchema => ({
    id,
    content: 'Mock post content',
    kind,
    uri: `pubky://author/pub/pubky.app/posts/${id}`,
    indexed_at: Date.now(),
    attachments: null,
  });

  // Mock builder instance
  const mockBuilder = {
    createPost: vi.fn((content, kind, parent, embed, attachments) => {
      return {
        post: {
          content,
          kind,
          parent: parent || undefined,
          embed: embed || undefined,
          attachments: attachments || undefined,
        },
        meta: {
          url: `pubky://${testData.authorPubky}/pub/pubky.app/posts/${testData.postId}`,
        },
      } as unknown as PostResult;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock PubkySpecsSingleton.get to return our mock builder
    vi.spyOn(Core.PubkySpecsSingleton, 'get').mockReturnValue(mockBuilder as unknown as PubkySpecsBuilder);
    // Mock Logger
    vi.spyOn(Libs.Logger, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('postKindToLowerCase', () => {
    it('should convert string to lowercase', () => {
      expect(Core.PostNormalizer.postKindToLowerCase('SHORT')).toBe('short');
      expect(Core.PostNormalizer.postKindToLowerCase('LoNg')).toBe('long');
      expect(Core.PostNormalizer.postKindToLowerCase('short')).toBe('short');
      expect(Core.PostNormalizer.postKindToLowerCase('TYPE-123')).toBe('type-123');
    });
  });

  describe('to', () => {
    it('should normalize post with different kinds and parent URI', async () => {
      // Basic short post
      await Core.PostNormalizer.to({ content: 'Hello', kind: PubkyAppPostKind.Short }, testData.authorPubky);
      expect(mockBuilder.createPost).toHaveBeenCalledWith('Hello', PubkyAppPostKind.Short, null, null, null);

      // Long post with parent
      const parentUri = 'pubky://parent/pub/pubky.app/posts/parent123';
      await Core.PostNormalizer.to(
        { content: 'Long form', kind: PubkyAppPostKind.Long, parentUri },
        testData.authorPubky,
      );
      expect(mockBuilder.createPost).toHaveBeenCalledWith('Long form', PubkyAppPostKind.Long, parentUri, null, null);
    });

    it('should handle embed creation and fallback', async () => {
      const postData = { content: 'Post', kind: PubkyAppPostKind.Short, embed: testData.embeddedUri };

      // When embed post exists
      vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(testData.embeddedPostId);
      vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(createMockPostDetails(testData.embeddedPostId));

      await Core.PostNormalizer.to(postData, testData.authorPubky);
      expect(mockBuilder.createPost).toHaveBeenCalledWith(
        postData.content,
        postData.kind,
        null,
        expect.any(PubkyAppPostEmbed),
        null,
      );

      // When embed URI is invalid
      vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(null);
      await Core.PostNormalizer.to(postData, testData.authorPubky);
      expect(mockBuilder.createPost).toHaveBeenLastCalledWith(postData.content, postData.kind, null, null, null);
    });

    it('should handle attachments mapping', async () => {
      const postData = createPostValidatorDataWithAttachments();

      await Core.PostNormalizer.to(postData, testData.authorPubky);

      expect(mockBuilder.createPost).toHaveBeenCalledWith(
        postData.content,
        postData.kind,
        null,
        null,
        ['pubky://author/pub/pubky.app/files/file123', 'pubky://author/pub/pubky.app/files/file456'],
      );
    });

    it('should handle all options together', async () => {
      const parentUri = 'pubky://parent/pub/pubky.app/posts/parent123';
      const postData: Core.PostValidatorData = {
        content: 'Complex post',
        kind: PubkyAppPostKind.Short,
        parentUri,
        embed: testData.embeddedUri,
        attachments: createPostValidatorDataWithAttachments().attachments,
      };

      vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(testData.embeddedPostId);
      vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(createMockPostDetails(testData.embeddedPostId));

      await Core.PostNormalizer.to(postData, testData.authorPubky);

      expect(mockBuilder.createPost).toHaveBeenCalledWith(
        postData.content,
        postData.kind,
        parentUri,
        expect.any(PubkyAppPostEmbed),
        expect.arrayContaining([expect.stringContaining('pubky://author/pub/pubky.app/files/')]),
      );
    });

    it('should propagate errors from dependencies', async () => {
      const postData = createBasicPostValidatorData();
      const embedData = { content: 'Post', kind: PubkyAppPostKind.Short, embed: testData.embeddedUri };

      // buildCompositeIdFromPubkyUri error
      vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockImplementation(() => {
        throw new Error('Invalid URI');
      });
      await expect(Core.PostNormalizer.to(embedData, testData.authorPubky)).rejects.toThrow('Invalid URI');

      // PostDetailsModel.findById error
      vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(testData.embeddedPostId);
      vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValue(new Error('Database error'));
      await expect(Core.PostNormalizer.to(embedData, testData.authorPubky)).rejects.toThrow('Database error');

      // builder.createPost error
      mockBuilder.createPost.mockImplementation(() => {
        throw new Error('Invalid post');
      });
      await expect(Core.PostNormalizer.to(postData, testData.authorPubky)).rejects.toThrow('Invalid post');
    });
  });
});

