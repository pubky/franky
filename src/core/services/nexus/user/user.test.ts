import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi } from './user.api';
import {
  TUserViewParams,
  TUserPaginationParams,
  TUserRelationshipParams,
  TUserTaggersParams,
  TUserTagsParams,
  USER_PATH_PARAMS,
} from './user.types';
import { buildUrlWithQuery } from '../nexus.utils';
import * as Core from '@/core';
import * as Config from '@/config';

const testUserId = 'qr3xqyz3e5cyf9npgxc5zfp15ehhcis6gqsxob4une7bwwazekry';
const testViewerId = 'viewer123';

describe('User API', () => {
  describe('buildUrlWithQuery (used by user API)', () => {
    it('should build URL with basic parameters', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };
      const baseRoute = 'v0/user/test';

      const result = buildUrlWithQuery(baseRoute, params, USER_PATH_PARAMS);
      expect(result).toBe(`${Config.NEXUS_URL}/v0/user/test?depth=2&viewer_id=${testViewerId}`);
    });

    it('should exclude path parameters from query string', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 1,
      };
      const baseRoute = 'v0/user/test';

      const result = buildUrlWithQuery(baseRoute, params, USER_PATH_PARAMS);
      expect(result).not.toContain('user_id=');
      expect(result).toContain('depth=1');
    });
  });

  describe('USER_API endpoints', () => {
    it('should generate correct URLs for basic endpoints', () => {
      const params: Core.TUserId = { user_id: testUserId };

      expect(userApi.counts(params)).toBe(`${Config.NEXUS_URL}/v0/user/${testUserId}/counts`);
      expect(userApi.details(params)).toBe(`${Config.NEXUS_URL}/v0/user/${testUserId}/details`);
    });

    it('should generate correct URLs for view endpoints', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };

      expect(userApi.view(params)).toBe(`${Config.NEXUS_URL}/v0/user/${testUserId}?depth=2&viewer_id=${testViewerId}`);
      expect(userApi.followers(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/followers?depth=2&viewer_id=${testViewerId}`,
      );
      expect(userApi.following(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/following?depth=2&viewer_id=${testViewerId}`,
      );
    });

    it('should generate correct URLs for relationship endpoint', () => {
      const params: TUserRelationshipParams = {
        user_id: testUserId,
        viewer_id: testViewerId,
      };

      expect(userApi.relationship(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/relationship/${testViewerId}`,
      );
    });

    it('should generate correct URL for friends endpoint', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };

      expect(userApi.friends(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/friends?depth=2&viewer_id=${testViewerId}`,
      );
    });

    it('should generate correct URL for muted endpoint', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };

      expect(userApi.muted(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/muted?depth=2&viewer_id=${testViewerId}`,
      );
    });

    it('should generate correct URL for notifications endpoint', () => {
      const params: TUserPaginationParams = {
        user_id: testUserId,
        skip: 0,
        limit: 10,
        start: 1000,
        end: 2000,
      };

      expect(userApi.notifications(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/notifications?skip=0&limit=10&start=1000&end=2000`,
      );
    });

    it('should generate correct URL for taggers endpoint', () => {
      const params: TUserTaggersParams = {
        user_id: testUserId,
        label: 'test-tag',
        skip: 0,
        limit: 10,
      };

      expect(userApi.taggers(params)).toBe(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/taggers/test-tag?skip=0&limit=10`,
      );
    });

    it('should generate correct URL for tags endpoint', () => {
      const params: TUserTagsParams = {
        user_id: testUserId,
        skip_tags: 0,
        limit_tags: 10,
      };

      expect(userApi.tags(params)).toBe(`${Config.NEXUS_URL}/v0/user/${testUserId}/tags?skip_tags=0&limit_tags=10`);
    });
  });

  describe('UserApiEndpoint type', () => {
    it('should have exactly 11 endpoints', () => {
      const endpointKeys = Object.keys(userApi);
      expect(endpointKeys).toHaveLength(11);
      expect(endpointKeys).toContain('view');
      expect(endpointKeys).toContain('counts');
      expect(endpointKeys).toContain('details');
      expect(endpointKeys).toContain('followers');
      expect(endpointKeys).toContain('following');
      expect(endpointKeys).toContain('friends');
      expect(endpointKeys).toContain('muted');
      expect(endpointKeys).toContain('notifications');
      expect(endpointKeys).toContain('relationship');
      expect(endpointKeys).toContain('taggers');
      expect(endpointKeys).toContain('tags');
    });
  });
});

describe('NexusUserService', () => {
  const testUserId = 'qr3xqyz3e5cyf9npgxc5zfp15ehhcis6gqsxob4une7bwwazekry' as Core.Pubky;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tags', () => {
    it('should construct correct URL and handle successful response', async () => {
      const mockTags = [
        { label: 'developer', taggers: [] as Core.Pubky[], taggers_count: 0, relationship: false },
      ] as Core.NexusTag[];

      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue(mockTags);

      const result = await Core.NexusUserService.tags({
        user_id: testUserId,
        skip_tags: 5,
        limit_tags: 20,
      });

      expect(result).toEqual(mockTags);
      expect(queryNexusSpy).toHaveBeenCalledWith(
        `${Config.NEXUS_URL}/v0/user/${testUserId}/tags?skip_tags=5&limit_tags=20`,
      );
    });

    it('should handle null/undefined responses gracefully', async () => {
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(null);

      const result = await Core.NexusUserService.tags({
        user_id: testUserId,
        skip_tags: 0,
        limit_tags: 10,
      });

      expect(result).toEqual([]);
    });
  });

  describe('taggers', () => {
    it('should construct correct URL with encoded label', async () => {
      const queryNexusSpy = vi.spyOn(Core, 'queryNexus').mockResolvedValue([]);

      await Core.NexusUserService.taggers({
        user_id: testUserId,
        label: 'rust & wasm',
        skip: 10,
        limit: 5,
      });

      // Verify label is URL-encoded (& becomes %26)
      expect(queryNexusSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/taggers\/rust%20%26%20wasm\?skip=10&limit=5$/),
      );
    });

    it('should handle null/undefined responses gracefully', async () => {
      vi.spyOn(Core, 'queryNexus').mockResolvedValue(undefined);

      const result = await Core.NexusUserService.taggers({
        user_id: testUserId,
        label: 'developer',
        skip: 0,
        limit: 10,
      });

      expect(result).toEqual([]);
    });
  });
});
