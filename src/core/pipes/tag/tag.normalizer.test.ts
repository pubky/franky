import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { TagResult, postUriBuilder, userUriBuilder } from 'pubky-app-specs';
import {
  TEST_PUBKY,
  TEST_POST_IDS,
  setupUnitTestMocks,
  setupIntegrationTestMocks,
  restoreMocks,
  buildPubkyUri,
} from '../pipes.test-utils';

describe('TagNormalizer', () => {
  const createMockBuilder = (overrides?: Partial<{ createTag: ReturnType<typeof vi.fn> }>) => ({
    createTag: vi.fn((uri: string, label: string) => ({
      tag: { label, toJson: vi.fn(() => ({ uri, label })) },
      meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, `tags/${encodeURIComponent(label)}`) },
    }) as unknown as TagResult),
    ...overrides,
  });

  /**
   * Tests for `to` method - Creates TagResult directly
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
        it('should create tag and log debug message', () => {
          const uri = buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`);
          const result = Core.TagNormalizer.to(uri, 'technology', TEST_PUBKY.USER_1);

          expect(result).toHaveProperty('tag');
          expect(result).toHaveProperty('meta');
          expect(Libs.Logger.debug).toHaveBeenCalledWith('Tag validated', { result });
        });

        it('should call PubkySpecsSingleton.get with pubky and createTag with uri/label', () => {
          const uri = buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`);
          Core.TagNormalizer.to(uri, 'tech', TEST_PUBKY.USER_1);

          expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
          expect(mockBuilder.createTag).toHaveBeenCalledWith(uri, 'tech');
        });

        it('should return correct structure with tag and meta URL', () => {
          const uri = buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`);
          const result = Core.TagNormalizer.to(uri, 'label', TEST_PUBKY.USER_1);

          expect(result.tag).toHaveProperty('toJson');
          expect(result.meta.url).toContain('pubky://');
          expect(result.meta.url).toContain('/pub/pubky.app/tags/');
        });
      });

      describe('different inputs', () => {
        it.each([
          ['technology'],
          ['Developer'],
          ['tech-tag'],
          ['tag_123'],
        ])('should handle label "%s"', (label) => {
          const uri = buildPubkyUri(TEST_PUBKY.USER_2, 'posts/123');
          Core.TagNormalizer.to(uri, label, TEST_PUBKY.USER_1);

          expect(mockBuilder.createTag).toHaveBeenCalledWith(uri, label);
        });

        it.each([
          ['USER_1', TEST_PUBKY.USER_1],
          ['USER_2', TEST_PUBKY.USER_2],
        ])('should handle pubky: %s', (_, pubky) => {
          const uri = buildPubkyUri(TEST_PUBKY.USER_2, 'posts/123');
          Core.TagNormalizer.to(uri, 'label', pubky);

          expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(pubky);
        });
      });

      describe('error handling', () => {
        it.each([
          ['createTag', () => mockBuilder.createTag.mockImplementation(() => { throw new Error('Builder error'); })],
          ['PubkySpecsSingleton.get', () => vi.spyOn(Core.PubkySpecsSingleton, 'get').mockImplementation(() => { throw new Error('Singleton error'); })],
        ])('should propagate errors from %s', (_, setupError) => {
          setupError();
          expect(() => Core.TagNormalizer.to('uri', 'label', TEST_PUBKY.USER_1)).toThrow();
        });

        it('should not call logger when error occurs', () => {
          mockBuilder.createTag.mockImplementation(() => { throw new Error('Error'); });

          expect(() => Core.TagNormalizer.to('uri', 'label', TEST_PUBKY.USER_1)).toThrow();
          expect(Libs.Logger.debug).not.toHaveBeenCalled();
        });
      });
    });

    describe('Integration Tests', () => {
      beforeEach(setupIntegrationTestMocks);
      afterEach(restoreMocks);

      describe('successful creation with real library', () => {
        it('should create valid result with correct URL format', () => {
          const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);
          const result = Core.TagNormalizer.to(uri, 'technology', TEST_PUBKY.USER_1);

          expect(result.tag).toBeDefined();
          expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/tags\/.+/);
        });

        it('should store label in tag', () => {
          const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);
          const result = Core.TagNormalizer.to(uri, 'developer', TEST_PUBKY.USER_1);

          expect(result.tag.label).toBe('developer');
        });

        it('should create unique URLs for different labels', () => {
          const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);
          const result1 = Core.TagNormalizer.to(uri, 'tech', TEST_PUBKY.USER_1);
          const result2 = Core.TagNormalizer.to(uri, 'news', TEST_PUBKY.USER_1);

          expect(result1.meta.url).not.toBe(result2.meta.url);
        });

        it('should produce valid JSON from tag object', () => {
          const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);
          const result = Core.TagNormalizer.to(uri, 'label', TEST_PUBKY.USER_1);

          expect(typeof result.tag.toJson).toBe('function');
          const tagJson = result.tag.toJson();
          expect(tagJson).toHaveProperty('uri', uri);
          expect(tagJson).toHaveProperty('label', 'label');
        });
      });

      describe('validation with real library', () => {
        it('should throw error for empty label', () => {
          const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);

          expect(() => Core.TagNormalizer.to(uri, '', TEST_PUBKY.USER_1)).toThrow();
        });

        it('should throw error for null label', () => {
          const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);

          expect(() => Core.TagNormalizer.to(uri, null as unknown as string, TEST_PUBKY.USER_1)).toThrow();
        });
      });

      describe('special characters in labels', () => {
        const uri = postUriBuilder(TEST_PUBKY.USER_2, TEST_POST_IDS.POST_1);

        /**
         * Characters that are ACCEPTED by the library
         */
        it.each([
          ['hyphen', 'tag-value'],
          ['underscore', 'tag_value'],
          ['period', 'tag.value'],
          ['at symbol', 'tag@value'],
          ['hash', 'tag#value'],
          ['ampersand', 'tag&value'],
          ['equals', 'tag=value'],
          ['plus', 'tag+value'],
        ])('should accept label with %s: "%s"', (_, label) => {
          const result = Core.TagNormalizer.to(uri, label, TEST_PUBKY.USER_1);

          expect(result).toBeDefined();
          expect(result.tag.label).toBe(label);
        });

        /**
         * Characters that are REJECTED by the library.
         * Note: `:` and `,` have semantic meaning in the pubky protocol
         * - `:` is used in composite IDs (author:postId)
         * - `,` might be used to separate multiple tags
         */
        it.each([
          ['colon', 'tag:value'],
          ['comma', 'tag,value'],
        ])('should reject label with %s: "%s"', (_, label) => {
          expect(() => Core.TagNormalizer.to(uri, label, TEST_PUBKY.USER_1)).toThrow();
        });
      });
    });
  });

  /**
   * Tests for `from` method - High-level tag creation with normalization
   */
  describe('from', () => {
    describe('Unit Tests', () => {
      let mockBuilder: ReturnType<typeof createMockBuilder>;
      const compositePostId = `${TEST_PUBKY.USER_2}:${TEST_POST_IDS.POST_1}`;

      beforeEach(() => {
        mockBuilder = createMockBuilder();
        setupUnitTestMocks(mockBuilder);
      });

      afterEach(restoreMocks);

      describe('POST tag creation', () => {
        it('should parse composite ID and build post URI', () => {
          vi.spyOn(Core, 'parseCompositeId').mockReturnValue({
            pubky: TEST_PUBKY.USER_2,
            id: TEST_POST_IDS.POST_1,
          });

          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: compositePostId,
            label: 'Technology',
            taggedKind: Core.TagKind.POST,
          };

          Core.TagNormalizer.from(params);

          expect(Core.parseCompositeId).toHaveBeenCalledWith(compositePostId);
          expect(mockBuilder.createTag).toHaveBeenCalledWith(
            expect.stringContaining(`pubky://${TEST_PUBKY.USER_2}/pub/pubky.app/posts/${TEST_POST_IDS.POST_1}`),
            'Technology',
          );
        });

        it('should return normalized response with lowercase label', () => {
          vi.spyOn(Core, 'parseCompositeId').mockReturnValue({
            pubky: TEST_PUBKY.USER_2,
            id: TEST_POST_IDS.POST_1,
          });

          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: compositePostId,
            label: '  TECHNOLOGY  ',
            taggedKind: Core.TagKind.POST,
          };

          const result = Core.TagNormalizer.from(params);

          expect(result.label).toBe('technology'); // Trimmed and lowercase
          expect(result.taggerId).toBe(TEST_PUBKY.USER_1);
          expect(result.taggedId).toBe(compositePostId);
          expect(result.taggedKind).toBe(Core.TagKind.POST);
          expect(result.tagUrl).toContain('pubky://');
          expect(result.tagJson).toBeDefined();
        });
      });

      describe('USER tag creation', () => {
        it('should build user URI directly without parsing', () => {
          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: TEST_PUBKY.USER_2,
            label: 'Developer',
            taggedKind: Core.TagKind.USER,
          };

          Core.TagNormalizer.from(params);

          expect(mockBuilder.createTag).toHaveBeenCalledWith(
            expect.stringContaining(`pubky://${TEST_PUBKY.USER_2}`),
            'Developer',
          );
        });

        it('should return normalized response with lowercase label', () => {
          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: TEST_PUBKY.USER_2,
            label: '  DEVELOPER  ',
            taggedKind: Core.TagKind.USER,
          };

          const result = Core.TagNormalizer.from(params);

          expect(result.label).toBe('developer');
          expect(result.taggedKind).toBe(Core.TagKind.USER);
        });
      });

      describe('error handling', () => {
        it('should propagate errors from parseCompositeId', () => {
          vi.spyOn(Core, 'parseCompositeId').mockImplementation(() => {
            throw new Error('Invalid composite ID');
          });

          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: 'invalid',
            label: 'test',
            taggedKind: Core.TagKind.POST,
          };

          expect(() => Core.TagNormalizer.from(params)).toThrow('Invalid composite ID');
        });

        it('should propagate errors from createTag', () => {
          vi.spyOn(Core, 'parseCompositeId').mockReturnValue({
            pubky: TEST_PUBKY.USER_2,
            id: TEST_POST_IDS.POST_1,
          });
          mockBuilder.createTag.mockImplementation(() => {
            throw new Error('Builder error');
          });

          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: compositePostId,
            label: 'test',
            taggedKind: Core.TagKind.POST,
          };

          expect(() => Core.TagNormalizer.from(params)).toThrow('Builder error');
        });
      });
    });

    describe('Integration Tests', () => {
      beforeEach(setupIntegrationTestMocks);
      afterEach(restoreMocks);

      describe('POST tag with real library', () => {
        it('should create valid POST tag', () => {
          const compositeId = `${TEST_PUBKY.USER_2}:${TEST_POST_IDS.POST_1}`;

          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: compositeId,
            label: 'technology',
            taggedKind: Core.TagKind.POST,
          };

          const result = Core.TagNormalizer.from(params);

          expect(result.tagUrl).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/tags\/.+/);
          expect(result.label).toBe('technology');
          expect(result.tagJson).toBeDefined();
        });
      });

      describe('USER tag with real library', () => {
        it('should create valid USER tag', () => {
          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: TEST_PUBKY.USER_2,
            label: 'developer',
            taggedKind: Core.TagKind.USER,
          };

          const result = Core.TagNormalizer.from(params);

          expect(result.tagUrl).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/tags\/.+/);
          expect(result.label).toBe('developer');
        });
      });

      describe('label normalization', () => {
        it.each([
          ['  spaces  ', 'spaces'],
          ['UPPERCASE', 'uppercase'],
          ['  MixedCASE  ', 'mixedcase'],
        ])('should normalize "%s" to "%s"', (input, expected) => {
          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: TEST_PUBKY.USER_2,
            label: input,
            taggedKind: Core.TagKind.USER,
          };

          const result = Core.TagNormalizer.from(params);

          expect(result.label).toBe(expected);
        });

        /**
         * Note: The pubky-app-specs library rejects labels with internal whitespace.
         */
        it('should throw error for label with internal whitespace', () => {
          const params: Core.TTagEventParams = {
            taggerId: TEST_PUBKY.USER_1,
            taggedId: TEST_PUBKY.USER_2,
            label: 'mixed case',
            taggedKind: Core.TagKind.USER,
          };

          expect(() => Core.TagNormalizer.from(params)).toThrow();
        });
      });
    });
  });
});
