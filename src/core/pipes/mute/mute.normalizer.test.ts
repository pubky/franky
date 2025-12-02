import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { MuteResult } from 'pubky-app-specs';
import {
  TEST_PUBKY,
  INVALID_INPUTS,
  setupUnitTestMocks,
  setupIntegrationTestMocks,
  restoreMocks,
  buildPubkyUri,
} from '../pipes.test-utils';

describe('MuteNormalizer', () => {
  const createMockBuilder = (overrides?: Partial<{ createMute: ReturnType<typeof vi.fn> }>) => ({
    createMute: vi.fn((mutee: string) => ({
      mute: { mutee, toJson: vi.fn(() => ({})) },
      meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, `mutes/${mutee}`) },
    }) as unknown as MuteResult),
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
      it('should create mute and log debug message', () => {
        const result = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });

        expect(result).toHaveProperty('mute');
        expect(result).toHaveProperty('meta');
        expect(Libs.Logger.debug).toHaveBeenCalledWith('Mute validated', { result });
      });

      it('should call PubkySpecsSingleton.get with muter and createMute with mutee', () => {
        Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
        expect(mockBuilder.createMute).toHaveBeenCalledWith(TEST_PUBKY.USER_2);
      });

      it('should return correct structure with mute and meta URL', () => {
        const result = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });

        expect(result.mute).toHaveProperty('toJson');
        expect(result.meta.url).toContain('pubky://');
        expect(result.meta.url).toContain('/pub/pubky.app/mutes/');
      });
    });

    describe('to - different inputs', () => {
      it('should handle different muter/mutee combinations', () => {
        Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });
        expect(mockBuilder.createMute).toHaveBeenCalledWith(TEST_PUBKY.USER_2);

        Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_2, mutee: TEST_PUBKY.USER_1 });
        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_2);
      });

      it('should handle self-mute scenario', () => {
        Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_1 });

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
        expect(mockBuilder.createMute).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
      });
    });

    describe('to - error handling', () => {
      it.each([
        ['createMute', () => mockBuilder.createMute.mockImplementation(() => { throw new Error('Builder error'); })],
        ['PubkySpecsSingleton.get', () => vi.spyOn(Core.PubkySpecsSingleton, 'get').mockImplementation(() => { throw new Error('Singleton error'); })],
      ])('should propagate errors from %s', (_, setupError) => {
        setupError();
        expect(() => Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 })).toThrow();
      });

      it('should not call logger when error occurs', () => {
        mockBuilder.createMute.mockImplementation(() => { throw new Error('Error'); });

        expect(() => Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 })).toThrow();
        expect(Libs.Logger.debug).not.toHaveBeenCalled();
      });
    });

    describe('to - edge cases', () => {
      it.each([
        ['empty mutee', { muter: TEST_PUBKY.USER_1, mutee: INVALID_INPUTS.EMPTY }],
        ['empty muter', { muter: INVALID_INPUTS.EMPTY, mutee: TEST_PUBKY.USER_2 }],
      ])('should pass %s to builder (unit test)', (_, params) => {
        Core.MuteNormalizer.to(params);
        expect(mockBuilder.createMute).toHaveBeenCalled();
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
        const result = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });

        expect(result.mute).toBeDefined();
        expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/mutes\/.+/);
        expect(result.meta.url).toContain(TEST_PUBKY.USER_2);
      });

      it('should create unique URLs for different mutees', () => {
        const result1 = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });
        const result2 = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_1 });

        expect(result1.meta.url).not.toBe(result2.meta.url);
      });

      it('should allow self-mute at specs level', () => {
        const result = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_1 });

        expect(result).toBeDefined();
        expect(result.meta.url).toContain(TEST_PUBKY.USER_1);
      });

      it('should produce valid JSON from mute object', () => {
        const result = Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: TEST_PUBKY.USER_2 });

        expect(typeof result.mute.toJson).toBe('function');
        expect(result.mute.toJson()).toBeDefined();
      });
    });

    describe('validation with real library', () => {
      /**
       * Note: createMute(mutee) validates the mutee parameter.
       * Invalid mutees throw because the method takes a parameter.
       */
      it.each([
        ['empty', INVALID_INPUTS.EMPTY],
        ['null', INVALID_INPUTS.NULL],
        ['undefined', INVALID_INPUTS.UNDEFINED],
        ['invalid format', INVALID_INPUTS.INVALID_FORMAT],
      ])('should throw error for %s mutee', (_, invalidMutee) => {
        expect(() =>
          Core.MuteNormalizer.to({ muter: TEST_PUBKY.USER_1, mutee: invalidMutee }),
        ).toThrow();
      });
    });
  });
});

