import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { PubkyAppPostKind, PostResult, PubkyAppPostEmbed } from 'pubky-app-specs';
import type { FileResult } from 'pubky-app-specs';
import {
  TEST_PUBKY,
  TEST_POST_IDS,
  setupUnitTestMocks,
  setupIntegrationTestMocks,
  restoreMocks,
  buildPubkyUri,
} from '../pipes.test-utils';

describe('PostNormalizer', () => {
  // Test data factories
  const createBasicPost = (overrides?: Partial<Core.PostValidatorData>): Core.PostValidatorData => ({
    content: 'Hello, world!',
    kind: PubkyAppPostKind.Short,
    ...overrides,
  });

  const createMockFileResult = (id: string): FileResult =>
    ({
      file: { toJson: vi.fn(() => ({ id, src: `blob-${id}`, content_type: 'image/png', size: 1024 })) },
      meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, `files/${id}`) },
    }) as unknown as FileResult;

  const createMockAttachment = (id: string): Core.TFileAttachmentResult => ({
    blobResult: {
      blob: { data: new Uint8Array([1, 2, 3]) },
      meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, `blobs/${id}`) },
    } as unknown as Core.TFileAttachmentResult['blobResult'],
    fileResult: createMockFileResult(id),
  });

  const createMockPostDetails = (id: string, kind = 'short'): Core.PostDetailsModelSchema => ({
    id,
    content: 'Mock content',
    kind,
    uri: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${id}`),
    indexed_at: Date.now(),
    attachments: null,
  });

  const createMockBuilder = (overrides?: Partial<{ createPost: ReturnType<typeof vi.fn> }>) => ({
    createPost: vi.fn((content, kind, parent, embed, attachments) => ({
      post: { content, kind, parent: parent || undefined, embed: embed || undefined, attachments: attachments || undefined },
      meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${TEST_POST_IDS.POST_1}`) },
    }) as unknown as PostResult),
    ...overrides,
  });

  /**
   * Tests for `postKindToLowerCase` - Simple string transformation
   */
  describe('postKindToLowerCase', () => {
    it.each([
      ['SHORT', 'short'],
      ['LoNg', 'long'],
      ['short', 'short'],
      ['TYPE-123', 'type-123'],
      ['MIXED_Case', 'mixed_case'],
    ])('should convert "%s" to "%s"', (input, expected) => {
      expect(Core.PostNormalizer.postKindToLowerCase(input)).toBe(expected);
    });
  });

  /**
   * Tests for `to` method - Creates PostResult
   */
  describe('to', () => {
    describe('Unit Tests', () => {
      let mockBuilder: ReturnType<typeof createMockBuilder>;

      beforeEach(() => {
        mockBuilder = createMockBuilder();
        setupUnitTestMocks(mockBuilder);
      });

      afterEach(restoreMocks);

      describe('successful creation', () => {
        it('should create post and log debug message', async () => {
          const post = createBasicPost();
          const result = await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(result).toHaveProperty('post');
          expect(result).toHaveProperty('meta');
          expect(Libs.Logger.debug).toHaveBeenCalledWith('Post validated', { result });
        });

        it('should call PubkySpecsSingleton.get with pubky and createPost with content/kind', async () => {
          const post = createBasicPost();
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            null,
            null,
          );
        });
      });

      describe('different post kinds', () => {
        it.each([
          ['Short', PubkyAppPostKind.Short],
          ['Long', PubkyAppPostKind.Long],
        ])('should handle %s post kind', async (_, kind) => {
          const post = createBasicPost({ kind });
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            expect.any(String),
            kind,
            null,
            null,
            null,
          );
        });
      });

      describe('parent URI handling', () => {
        it('should pass parentUri to createPost when provided', async () => {
          const parentUri = buildPubkyUri(TEST_PUBKY.USER_2, 'posts/parent123');
          const post = createBasicPost({ parentUri });

          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            parentUri,
            null,
            null,
          );
        });

        it('should pass null when parentUri not provided', async () => {
          const post = createBasicPost();
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            null,
            null,
          );
        });
      });

      describe('embed handling', () => {
        const embedUri = buildPubkyUri(TEST_PUBKY.USER_2, 'posts/embedded123');
        const embeddedPostId = `${TEST_PUBKY.USER_2}:embedded123`;

        it('should create embed object when embed post exists', async () => {
          vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(embeddedPostId);
          vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(createMockPostDetails(embeddedPostId));

          const post = createBasicPost({ embed: embedUri });
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            expect.any(PubkyAppPostEmbed),
            null,
          );
        });

        it('should pass null embed when URI is invalid', async () => {
          vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(null);

          const post = createBasicPost({ embed: embedUri });
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            null,
            null,
          );
        });

        it('should pass null embed when embedded post not found', async () => {
          vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(embeddedPostId);
          vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(null);

          const post = createBasicPost({ embed: embedUri });
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            null,
            null,
          );
        });
      });

      describe('attachments handling', () => {
        it('should map attachments to file URLs', async () => {
          const attachments = [createMockAttachment('file1'), createMockAttachment('file2')];
          const post = createBasicPost({ attachments });

          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            null,
            [
              buildPubkyUri(TEST_PUBKY.USER_1, 'files/file1'),
              buildPubkyUri(TEST_PUBKY.USER_1, 'files/file2'),
            ],
          );
        });

        it('should pass null when no attachments', async () => {
          const post = createBasicPost();
          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            null,
            null,
            null,
          );
        });
      });

      describe('all options combined', () => {
        it('should handle post with all options', async () => {
          const parentUri = buildPubkyUri(TEST_PUBKY.USER_2, 'posts/parent');
          const embedUri = buildPubkyUri(TEST_PUBKY.USER_2, 'posts/embed');
          const embeddedPostId = `${TEST_PUBKY.USER_2}:embed`;

          vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue(embeddedPostId);
          vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(createMockPostDetails(embeddedPostId));

          const post = createBasicPost({
            parentUri,
            embed: embedUri,
            attachments: [createMockAttachment('file1')],
          });

          await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(mockBuilder.createPost).toHaveBeenCalledWith(
            post.content,
            post.kind,
            parentUri,
            expect.any(PubkyAppPostEmbed),
            [buildPubkyUri(TEST_PUBKY.USER_1, 'files/file1')],
          );
        });
      });

      describe('error handling', () => {
        it.each([
          ['buildCompositeIdFromPubkyUri', () => vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockImplementation(() => { throw new Error('URI error'); })],
          ['createPost', () => mockBuilder.createPost.mockImplementation(() => { throw new Error('Builder error'); })],
        ])('should propagate errors from %s', async (_, setupError) => {
          setupError();
          const post = createBasicPost({ embed: 'pubky://embed' });

          await expect(Core.PostNormalizer.to(post, TEST_PUBKY.USER_1)).rejects.toThrow();
        });

        it('should propagate errors from PostDetailsModel.findById', async () => {
          vi.spyOn(Core, 'buildCompositeIdFromPubkyUri').mockReturnValue('valid-id');
          vi.spyOn(Core.PostDetailsModel, 'findById').mockRejectedValue(new Error('Database error'));

          const post = createBasicPost({ embed: 'pubky://embed' });

          await expect(Core.PostNormalizer.to(post, TEST_PUBKY.USER_1)).rejects.toThrow('Database error');
        });

        it('should not call logger when error occurs', async () => {
          mockBuilder.createPost.mockImplementation(() => { throw new Error('Error'); });

          await expect(Core.PostNormalizer.to(createBasicPost(), TEST_PUBKY.USER_1)).rejects.toThrow();
          expect(Libs.Logger.debug).not.toHaveBeenCalled();
        });
      });
    });

    describe('Integration Tests', () => {
      beforeEach(setupIntegrationTestMocks);
      afterEach(restoreMocks);

      describe('successful creation with real library', () => {
        it('should create valid result with correct URL format', async () => {
          const post = createBasicPost();
          const result = await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(result.post).toBeDefined();
          expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/posts\/.+/);
        });

        it.each([
          ['Short', PubkyAppPostKind.Short],
          ['Long', PubkyAppPostKind.Long],
        ])('should handle %s post kind', async (_, kind) => {
          const post = createBasicPost({ kind });
          const result = await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(result).toBeDefined();
          expect(result.meta.url).toContain('pubky://');
        });

        it('should create post with parent URI', async () => {
          const parentUri = buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_2}`);
          const post = createBasicPost({ parentUri });

          const result = await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(result).toBeDefined();
        });

        it('should produce valid JSON from post object', async () => {
          const post = createBasicPost();
          const result = await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(typeof result.post.toJson).toBe('function');
          const postJson = result.post.toJson();
          expect(postJson).toHaveProperty('content', post.content);
        });
      });

      describe('validation with real library', () => {
        /**
         * Note: The pubky-app-specs library is permissive with content validation.
         * Empty content is allowed at the specs level.
         */
        it('should accept empty content (library is permissive)', async () => {
          const post = createBasicPost({ content: '' });
          const result = await Core.PostNormalizer.to(post, TEST_PUBKY.USER_1);

          expect(result).toBeDefined();
        });

        it('should throw error for null content', async () => {
          const post = createBasicPost({ content: null as unknown as string });

          await expect(Core.PostNormalizer.to(post, TEST_PUBKY.USER_1)).rejects.toThrow();
        });
      });
    });
  });
});
