import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { FollowResult } from 'pubky-app-specs';
import {
  TEST_PUBKY,
  INVALID_INPUTS,
  setupUnitTestMocks,
  setupIntegrationTestMocks,
  restoreMocks,
  buildPubkyUri,
} from '../pipes.test-utils';

describe('FollowNormalizer', () => {
  const createMockBuilder = (overrides?: Partial<{ createFollow: ReturnType<typeof vi.fn> }>) => ({
    createFollow: vi.fn(
      (followee: string) =>
        ({
          follow: { followee, toJson: vi.fn(() => ({})) },
          meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, `follows/${followee}`) },
        }) as unknown as FollowResult,
    ),
    ...overrides,
  });

  /**
   * Unit Tests
   */
  describe('Unit Tests', () => {
    let mockBuilder: ReturnType<typeof createMockBuilder>;

    beforeEach(() => {
      mockBuilder = createMockBuilder();
      setupUnitTestMocks(mockBuilder);
    });

    afterEach(restoreMocks);

    describe('to - successful creation', () => {
      it('should create follow and log debug message', () => {
        const result = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });

        expect(result).toHaveProperty('follow');
        expect(result).toHaveProperty('meta');
        expect(Libs.Logger.debug).toHaveBeenCalledWith('Follow validated', { result });
      });

      it('should call PubkySpecsSingleton.get with follower and createFollow with followee', () => {
        Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
        expect(mockBuilder.createFollow).toHaveBeenCalledWith(TEST_PUBKY.USER_2);
      });

      it('should return correct structure with follow and meta URL', () => {
        const result = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });

        expect(result.follow).toHaveProperty('toJson');
        expect(result.meta.url).toContain('pubky://');
        expect(result.meta.url).toContain('/pub/pubky.app/follows/');
      });
    });

    describe('to - different inputs', () => {
      it('should handle different follower/followee combinations', () => {
        Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });
        expect(mockBuilder.createFollow).toHaveBeenCalledWith(TEST_PUBKY.USER_2);

        Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_2, followee: TEST_PUBKY.USER_1 });
        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_2);
      });

      it('should handle self-follow scenario', () => {
        Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_1 });

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
        expect(mockBuilder.createFollow).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
      });
    });

    describe('to - error handling', () => {
      it.each([
        [
          'createFollow',
          () =>
            mockBuilder.createFollow.mockImplementation(() => {
              throw new Error('Builder error');
            }),
        ],
        [
          'PubkySpecsSingleton.get',
          () =>
            vi.spyOn(Core.PubkySpecsSingleton, 'get').mockImplementation(() => {
              throw new Error('Singleton error');
            }),
        ],
      ])('should propagate errors from %s', (_, setupError) => {
        setupError();
        expect(() => Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 })).toThrow();
      });

      it('should not call logger when error occurs', () => {
        mockBuilder.createFollow.mockImplementation(() => {
          throw new Error('Error');
        });

        expect(() => Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 })).toThrow();
        expect(Libs.Logger.debug).not.toHaveBeenCalled();
      });
    });

    describe('to - edge cases', () => {
      it.each([
        ['empty followee', { follower: TEST_PUBKY.USER_1, followee: INVALID_INPUTS.EMPTY }],
        ['empty follower', { follower: INVALID_INPUTS.EMPTY, followee: TEST_PUBKY.USER_2 }],
      ])('should pass %s to builder (unit test)', (_, params) => {
        Core.FollowNormalizer.to(params);
        // In unit tests, mocks don't validate - just verify calls
        expect(mockBuilder.createFollow).toHaveBeenCalled();
      });
    });
  });

  /**
   * Integration Tests - Real pubky-app-specs library
   */
  describe('Integration Tests', () => {
    beforeEach(setupIntegrationTestMocks);
    afterEach(restoreMocks);

    describe('successful creation with real library', () => {
      it('should create valid result with correct URL format', () => {
        const result = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });

        expect(result.follow).toBeDefined();
        expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/follows\/.+/);
        expect(result.meta.url).toContain(TEST_PUBKY.USER_2);
      });

      it('should create unique URLs for different followees', () => {
        const result1 = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });
        const result2 = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_1 });

        expect(result1.meta.url).not.toBe(result2.meta.url);
      });

      it('should allow self-follow at specs level', () => {
        const result = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_1 });

        expect(result).toBeDefined();
        expect(result.meta.url).toContain(TEST_PUBKY.USER_1);
      });

      it('should produce valid JSON from follow object', () => {
        const result = Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: TEST_PUBKY.USER_2 });

        expect(typeof result.follow.toJson).toBe('function');
        expect(result.follow.toJson()).toBeDefined();
      });
    });

    describe('validation with real library', () => {
      /**
       * Note: createFollow(followee) validates the followee parameter.
       * Unlike LastRead, invalid followees throw because the method takes a parameter.
       */
      it.each([
        ['empty', INVALID_INPUTS.EMPTY],
        ['null', INVALID_INPUTS.NULL],
        ['undefined', INVALID_INPUTS.UNDEFINED],
        ['invalid format', INVALID_INPUTS.INVALID_FORMAT],
      ])('should throw error for %s followee', (_, invalidFollowee) => {
        expect(() => Core.FollowNormalizer.to({ follower: TEST_PUBKY.USER_1, followee: invalidFollowee })).toThrow();
      });
    });
  });
});
