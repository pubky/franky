import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { TagResult, PubkySpecsBuilder } from 'pubky-app-specs';

describe('TagNormalizer', () => {
  const testData = {
    taggerPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
    taggedUserId: 'user123' as Core.Pubky,
    taggedPostId: 'author:post123',
    label: 'Technology',
  };

  // Mock builder factory
  const createMockBuilder = () => ({
    createTag: vi.fn((uri: string, label: string) => {
      const mockTag = {
        label,
        toJson: vi.fn(() => ({ uri, label })),
      };
      return {
        tag: mockTag,
        meta: { url: `pubky://${testData.taggerPubky}/pub/pubky.app/tags/${label}` },
      } as unknown as TagResult;
    }),
  });

  let mockBuilder: ReturnType<typeof createMockBuilder>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuilder = createMockBuilder();
    vi.spyOn(Core.PubkySpecsSingleton, 'get').mockReturnValue(mockBuilder as unknown as PubkySpecsBuilder);
    vi.spyOn(Libs.Logger, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('to', () => {
    it('should create tag using builder', () => {
      const uri = 'pubky://user/pub/pubky.app/posts/post123';
      const label = 'tech';

      const result = Core.TagNormalizer.to(uri, label, testData.taggerPubky);

      expect(mockBuilder.createTag).toHaveBeenCalledWith(uri, label);
      expect(result).toBeTruthy();
      expect(Libs.Logger.debug).toHaveBeenCalledWith('Tag validated', { result });
    });

    it('should propagate builder errors', () => {
      mockBuilder.createTag.mockImplementation(() => {
        throw new Error('Invalid tag');
      });

      expect(() => Core.TagNormalizer.to('uri', 'label', testData.taggerPubky)).toThrow('Invalid tag');
    });
  });

  describe('from', () => {
    it('should normalize POST tag with trimmed lowercase label', () => {
      const params: Core.TTagEventParams = {
        taggerId: testData.taggerPubky,
        taggedId: testData.taggedPostId,
        label: '  Technology  ',
        taggedKind: Core.TagKind.POST,
      };

      vi.spyOn(Core, 'parseCompositeId').mockReturnValue({ pubky: 'author' as Core.Pubky, id: 'post123' });

      const result = Core.TagNormalizer.from(params);

      expect(Core.parseCompositeId).toHaveBeenCalledWith(testData.taggedPostId);
      expect(mockBuilder.createTag).toHaveBeenCalledWith(
        expect.stringContaining('pubky://author/pub/pubky.app/posts/post123'),
        'Technology',
      );
      expect(result.taggerId).toBe(testData.taggerPubky);
      expect(result.taggedId).toBe(testData.taggedPostId);
      expect(result.label).toBe('technology'); // Lowercase
      expect(result.taggedKind).toBe(Core.TagKind.POST);
      expect(result.tagUrl).toContain('pubky://');
      expect(result.tagJson).toBeTruthy();
    });

    it('should normalize USER tag', () => {
      const params: Core.TTagEventParams = {
        taggerId: testData.taggerPubky,
        taggedId: testData.taggedUserId,
        label: 'Developer',
        taggedKind: Core.TagKind.USER,
      };

      const result = Core.TagNormalizer.from(params);

      expect(mockBuilder.createTag).toHaveBeenCalledWith(
        expect.stringContaining(`pubky://${testData.taggedUserId}`),
        'Developer',
      );
      expect(result.label).toBe('developer'); // Lowercase
      expect(result.taggedKind).toBe(Core.TagKind.USER);
    });

    it('should propagate errors from dependencies', () => {
      const params: Core.TTagEventParams = {
        taggerId: testData.taggerPubky,
        taggedId: testData.taggedPostId,
        label: 'test',
        taggedKind: Core.TagKind.POST,
      };

      // parseCompositeId error
      vi.spyOn(Core, 'parseCompositeId').mockImplementation(() => {
        throw new Error('Invalid composite ID');
      });
      expect(() => Core.TagNormalizer.from(params)).toThrow('Invalid composite ID');

      // Builder error
      vi.spyOn(Core, 'parseCompositeId').mockReturnValue({ pubky: 'author' as Core.Pubky, id: 'post123' });
      mockBuilder.createTag.mockImplementation(() => {
        throw new Error('Builder error');
      });
      expect(() => Core.TagNormalizer.from(params)).toThrow('Builder error');
    });
  });
});
