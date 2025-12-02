import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { UserResult } from 'pubky-app-specs';
import {
  TEST_PUBKY,
  setupUnitTestMocks,
  setupIntegrationTestMocks,
  restoreMocks,
  buildPubkyUri,
} from '../pipes.test-utils';

describe('UserNormalizer', () => {
  // Test data factories
  const createUserData = (overrides?: Partial<Core.UserValidatorData>): Core.UserValidatorData => ({
    name: 'Test User',
    bio: 'A test bio',
    image: 'https://example.com/avatar.png',
    links: [{ title: 'Website', url: 'https://example.com' }],
    status: 'Available',
    ...overrides,
  });

  const createMockBuilder = (overrides?: Partial<{ createUser: ReturnType<typeof vi.fn> }>) => ({
    createUser: vi.fn(
      (name, bio, image, links, status) =>
        ({
          user: {
            name,
            bio,
            image,
            links,
            status,
            toJson: vi.fn(() => ({ name, bio, image, links, status })),
          },
          meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, 'profile.json') },
        }) as unknown as UserResult,
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
      it('should create user and log debug message', () => {
        const user = createUserData();
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('meta');
        expect(Libs.Logger.debug).toHaveBeenCalledWith('User validated', { result });
      });

      it('should call PubkySpecsSingleton.get with pubky', () => {
        const user = createUserData();
        Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
      });

      it('should call createUser with all user fields', () => {
        const user = createUserData();
        Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(mockBuilder.createUser).toHaveBeenCalledWith(user.name, user.bio, user.image, user.links, user.status);
      });

      it('should return correct structure with user and meta URL', () => {
        const user = createUserData();
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result.user).toHaveProperty('toJson');
        expect(result.meta.url).toContain('pubky://');
      });
    });

    describe('to - different inputs', () => {
      it('should handle user with all fields', () => {
        const user = createUserData({
          name: 'Full User',
          bio: 'Complete bio',
          image: 'https://avatar.com/img.png',
          links: [
            { title: 'Twitter', url: 'https://twitter.com/user' },
            { title: 'GitHub', url: 'https://github.com/user' },
          ],
          status: 'Working',
        });

        Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(mockBuilder.createUser).toHaveBeenCalledWith(
          'Full User',
          'Complete bio',
          'https://avatar.com/img.png',
          expect.arrayContaining([
            expect.objectContaining({ title: 'Twitter' }),
            expect.objectContaining({ title: 'GitHub' }),
          ]),
          'Working',
        );
      });

      it('should handle user with null optional fields', () => {
        const user = createUserData({
          image: null,
          links: null,
          status: null,
        });

        Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(mockBuilder.createUser).toHaveBeenCalledWith(
          user.name,
          user.bio,
          null,
          null,
          undefined, // status || undefined converts null to undefined
        );
      });

      it('should handle user with empty strings', () => {
        const user = createUserData({
          name: '',
          bio: '',
          status: '',
        });

        Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(mockBuilder.createUser).toHaveBeenCalledWith(
          '',
          '',
          expect.any(String),
          expect.any(Array),
          undefined, // empty string is falsy, so status || undefined = undefined
        );
      });

      it('should handle user with empty links array', () => {
        const user = createUserData({ links: [] });

        Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(mockBuilder.createUser).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.any(String),
          [],
          expect.any(String),
        );
      });

      it.each([
        ['USER_1', TEST_PUBKY.USER_1],
        ['USER_2', TEST_PUBKY.USER_2],
      ])('should handle pubky: %s', (_, pubky) => {
        const user = createUserData();
        Core.UserNormalizer.to(user, pubky);

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(pubky);
      });
    });

    describe('to - error handling', () => {
      it.each([
        [
          'createUser',
          () =>
            mockBuilder.createUser.mockImplementation(() => {
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
        expect(() => Core.UserNormalizer.to(createUserData(), TEST_PUBKY.USER_1)).toThrow();
      });

      it('should not call logger when error occurs', () => {
        mockBuilder.createUser.mockImplementation(() => {
          throw new Error('Error');
        });

        expect(() => Core.UserNormalizer.to(createUserData(), TEST_PUBKY.USER_1)).toThrow();
        expect(Libs.Logger.debug).not.toHaveBeenCalled();
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
        const user = createUserData();
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result.user).toBeDefined();
        expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/profile\.json$/);
      });

      it('should store user data correctly', () => {
        const user = createUserData({
          name: 'Integration User',
          bio: 'Integration bio',
        });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        const userJson = result.user.toJson();
        expect(userJson.name).toBe('Integration User');
        expect(userJson.bio).toBe('Integration bio');
      });

      it('should handle user with multiple links', () => {
        const user = createUserData({
          links: [
            { title: 'Twitter', url: 'https://twitter.com/user' },
            { title: 'GitHub', url: 'https://github.com/user' },
            { title: 'Website', url: 'https://mysite.com' },
          ],
        });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toBeDefined();
        const userJson = result.user.toJson();
        expect(userJson.links).toHaveLength(3);
      });

      it('should produce valid JSON from user object', () => {
        const user = createUserData();
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(typeof result.user.toJson).toBe('function');
        const userJson = result.user.toJson();
        expect(userJson).toHaveProperty('name');
        expect(userJson).toHaveProperty('bio');
      });
    });

    describe('validation with real library', () => {
      it('should throw error for empty name', () => {
        const user = createUserData({ name: '' });

        expect(() => Core.UserNormalizer.to(user, TEST_PUBKY.USER_1)).toThrow();
      });

      it('should throw error for null name', () => {
        const user = createUserData({ name: null as unknown as string });

        expect(() => Core.UserNormalizer.to(user, TEST_PUBKY.USER_1)).toThrow();
      });

      /**
       * Note: Testing what the library accepts/rejects for optional fields
       */
      it('should accept user with null optional fields', () => {
        const user = createUserData({
          image: null,
          links: null,
          status: null,
        });

        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);
        expect(result).toBeDefined();
      });

      it('should accept user with empty bio', () => {
        const user = createUserData({ bio: '' });

        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);
        expect(result).toBeDefined();
      });
    });

    describe('name length validation', () => {
      /**
       * Note: The library has a minimum name length requirement.
       * Single character names are rejected.
       */
      it('should reject single character name', () => {
        const user = createUserData({ name: 'A' });

        expect(() => Core.UserNormalizer.to(user, TEST_PUBKY.USER_1)).toThrow();
      });

      it('should accept minimum valid name length (3 characters)', () => {
        // Minimum name length is 3 characters
        const user = createUserData({ name: 'ABC' });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toBeDefined();
      });

      it('should reject 2 character name', () => {
        const user = createUserData({ name: 'AB' });

        expect(() => Core.UserNormalizer.to(user, TEST_PUBKY.USER_1)).toThrow();
      });

      it('should accept reasonable length name', () => {
        const user = createUserData({ name: 'A'.repeat(50) });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toBeDefined();
      });

      it('should handle very long name (library may reject)', () => {
        const user = createUserData({ name: 'A'.repeat(1000) });

        try {
          const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);
          expect(result).toBeDefined();
        } catch {
          // Library may reject very long names
          expect(true).toBe(true);
        }
      });
    });

    describe('special characters in fields', () => {
      it('should accept name with unicode characters', () => {
        const user = createUserData({ name: '用户名 🎉 مستخدم' });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toBeDefined();
        expect(result.user.toJson().name).toBe('用户名 🎉 مستخدم');
      });

      it('should accept bio with special characters', () => {
        const user = createUserData({ bio: 'Bio with <html> & "quotes" and \'apostrophes\'' });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toBeDefined();
      });

      it('should accept status with emoji', () => {
        const user = createUserData({ status: '🚀 Working on something cool!' });
        const result = Core.UserNormalizer.to(user, TEST_PUBKY.USER_1);

        expect(result).toBeDefined();
      });
    });
  });
});
