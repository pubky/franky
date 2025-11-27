import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind, FeedResult, PubkySpecsBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

describe('FeedNormalizer', () => {
  const testData = {
    userPubky: 'pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy' as Core.Pubky,
    feedName: 'Bitcoin News',
    tags: ['bitcoin', 'lightning'],
  };

  // Mock builder factory
  const createMockBuilder = () => ({
    createFeed: vi.fn(
      (tags: string[], reach: string, layout: string, sort: string, content: string | null, name: string) => {
        const mockFeed = {
          name,
          feed: {
            tags,
            reach: PubkyAppFeedReach.All,
            layout: 0,
            sort: PubkyAppFeedSort.Recent,
            content: content ? PubkyAppPostKind.Short : null,
          },
          toJson: vi.fn(() => ({ name, tags, reach, layout, sort, content })),
        };
        return {
          feed: mockFeed,
          meta: {
            id: 'feed123',
            url: `pubky://${testData.userPubky}/pub/pubky.app/feeds/feed123`,
            path: '/pub/pubky.app/feeds/feed123',
          },
        } as unknown as FeedResult;
      },
    ),
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
    const createValidParams = (): Core.TFeedCreateParams => ({
      name: testData.feedName,
      tags: testData.tags,
      reach: PubkyAppFeedReach.All,
      sort: PubkyAppFeedSort.Recent,
      content: null,
      layout: Core.FeedLayout.COLUMNS,
    });

    it('should create feed using builder with correct parameters', () => {
      const params = createValidParams();

      const result = Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        ['bitcoin', 'lightning'],
        'all',
        'columns',
        'recent',
        null,
        testData.feedName,
      );
      expect(result).toBeTruthy();
      expect(Libs.Logger.debug).toHaveBeenCalledWith('Feed validated', { result });
    });

    it('should normalize tags to lowercase', () => {
      const params = createValidParams();
      params.tags = ['BITCOIN', 'Lightning', 'TECH'];

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        ['bitcoin', 'lightning', 'tech'],
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should trim whitespace from tags', () => {
      const params = createValidParams();
      params.tags = ['  bitcoin  ', ' lightning '];

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        ['bitcoin', 'lightning'],
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should deduplicate tags', () => {
      const params = createValidParams();
      params.tags = ['bitcoin', 'BITCOIN', 'Bitcoin'];

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        ['bitcoin'],
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should trim feed name', () => {
      const params = createValidParams();
      params.name = '  Bitcoin News  ';

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        'Bitcoin News',
      );
    });

    it('should convert FeedLayout.FOCUS to Visual for homeserver', () => {
      const params = createValidParams();
      params.layout = Core.FeedLayout.FOCUS;

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        'visual',
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should convert reach enum to string', () => {
      const params = createValidParams();
      params.reach = PubkyAppFeedReach.Following;

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        expect.any(Array),
        'following',
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should convert sort enum to string', () => {
      const params = createValidParams();
      params.sort = PubkyAppFeedSort.Popularity;

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(String),
        'popularity',
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should convert content enum to string when specified', () => {
      const params = createValidParams();
      params.content = PubkyAppPostKind.Image;

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        'image',
        expect.any(String),
      );
    });

    it('should pass null content when All is selected', () => {
      const params = createValidParams();
      params.content = null;

      Core.FeedNormalizer.to(params, testData.userPubky);

      expect(mockBuilder.createFeed).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        null,
        expect.any(String),
      );
    });

    describe('validation errors', () => {
      it('should throw error when tags array is empty', () => {
        const params = createValidParams();
        params.tags = [];

        expect(() => Core.FeedNormalizer.to(params, testData.userPubky)).toThrow('At least one tag is required');
      });

      it('should throw error when tags is undefined', () => {
        const params = createValidParams();
        // @ts-expect-error - testing invalid input
        params.tags = undefined;

        expect(() => Core.FeedNormalizer.to(params, testData.userPubky)).toThrow('At least one tag is required');
      });

      it('should throw error when more than 5 tags provided', () => {
        const params = createValidParams();
        params.tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];

        expect(() => Core.FeedNormalizer.to(params, testData.userPubky)).toThrow('Maximum 5 tags allowed');
      });

      it('should throw error when all tags dedupe to less than 1', () => {
        const params = createValidParams();
        params.tags = ['   ', '  '];

        expect(() => Core.FeedNormalizer.to(params, testData.userPubky)).toThrow('At least one unique tag is required');
      });
    });

    it('should propagate builder errors', () => {
      const params = createValidParams();
      mockBuilder.createFeed.mockImplementation(() => {
        throw new Error('Invalid feed configuration');
      });

      expect(() => Core.FeedNormalizer.to(params, testData.userPubky)).toThrow('Invalid feed configuration');
    });
  });
});
