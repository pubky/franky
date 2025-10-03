import { describe, it, expect } from 'vitest';
import { userStreamApi, buildUserStreamBodyUrl } from './userStream.api';
import * as Core from '@/core';

describe('Users Stream API - Error Control', () => {
  const mockUserId = 'erztyis9oiaho93ckucetcf5xnxacecqwhbst5hnd7mmkf69dhby';
  const mockViewerId = 'viewer-pubky-id';
  const mockUsername = 'testuser';
  const mockUserIds = ['user1-pubky', 'user2-pubky', 'user3-pubky'];

  describe('Parameter validation', () => {
    it('should handle undefined and null values correctly', () => {
      const url = userStreamApi.followers({
        user_id: mockUserId,
        viewer_id: undefined,
        skip: null as unknown as number,
        limit: undefined,
      });

      expect(url).toContain('source=followers');
      expect(url).toContain(`user_id=${mockUserId}`);
      expect(url).not.toContain('viewer_id=');
      expect(url).not.toContain('skip=');
      expect(url).not.toContain('limit=');
    });

    it('should handle empty username gracefully', () => {
      const url = userStreamApi.username({
        username: '',
        viewer_id: mockViewerId,
      });

      expect(url).toContain('stream/users/username?');
      expect(url).toContain('username=');
      expect(url).toContain(`viewer_id=${mockViewerId}`);
    });

    it('should handle missing required parameters', () => {
      // This should not throw but generate URL with missing required params
      const url = userStreamApi.followers({
        user_id: mockUserId,
      });

      expect(url).toContain('source=followers');
      expect(url).toContain(`user_id=${mockUserId}`);
    });
  });

  describe('Username endpoint error handling', () => {
    it('should handle special characters in username', () => {
      const specialUsername = 'user@domain.com';
      const url = userStreamApi.username({
        username: specialUsername,
        viewer_id: mockViewerId,
      });

      expect(url).toContain('stream/users/username?');
      expect(url).toContain(`username=${encodeURIComponent(specialUsername)}`);
    });

    it('should handle long usernames', () => {
      const longUsername = 'a'.repeat(100);
      const url = userStreamApi.username({
        username: longUsername,
        viewer_id: mockViewerId,
      });

      expect(url).toContain(`username=${encodeURIComponent(longUsername)}`);
    });

    it('should handle username with spaces', () => {
      const usernameWithSpaces = 'user name with spaces';
      const url = userStreamApi.username({
        username: usernameWithSpaces,
        viewer_id: mockViewerId,
      });

      // URLSearchParams uses + for spaces, not %20
      expect(url).toContain('username=user+name+with+spaces');
    });
  });

  describe('Users by IDs endpoint error handling', () => {
    it('should handle empty user IDs array', () => {
      const request = userStreamApi.usersByIds({
        user_ids: [],
      });

      expect(request.url).toMatch('stream/users/by_ids');
      expect(request.body.user_ids).toEqual([]);
      expect(request.body).not.toHaveProperty('viewer_id');
      expect(request.body).not.toHaveProperty('depth');
    });

    it('should handle large array of user IDs', () => {
      const largeUserIds = Array.from({ length: 1000 }, (_, i) => `user-${i}-pubky`);
      const request = userStreamApi.usersByIds({
        user_ids: largeUserIds,
        viewer_id: mockViewerId,
        depth: 3,
      });

      expect(request.url).toMatch('stream/users/by_ids');
      expect(request.body.user_ids).toHaveLength(1000);
      expect(request.body.viewer_id).toBe(mockViewerId);
      expect(request.body.depth).toBe(3);
    });

    it('should handle depth parameter validation', () => {
      const request = userStreamApi.usersByIds({
        user_ids: mockUserIds,
        depth: 0,
      });

      expect(request.body.depth).toBe(0);
    });

    it('should handle negative depth values', () => {
      const request = userStreamApi.usersByIds({
        user_ids: mockUserIds,
        depth: -1,
      });

      expect(request.body.depth).toBe(-1);
    });

    it('should handle very large depth values', () => {
      const request = userStreamApi.usersByIds({
        user_ids: mockUserIds,
        depth: 999,
      });

      expect(request.body.depth).toBe(999);
    });
  });

  describe('URL structure validation', () => {
    it('should generate correct URL prefixes', () => {
      const followersUrl = userStreamApi.followers({ user_id: mockUserId });
      const usernameUrl = userStreamApi.username({ username: mockUsername });
      const usersByIdsRequest = userStreamApi.usersByIds({ user_ids: mockUserIds });

      expect(followersUrl).toMatch(/stream\/users\?/);
      expect(usernameUrl).toMatch(/stream\/users\/username\?/);
      expect(usersByIdsRequest.url).toMatch(/stream\/users\/by_ids$/);
    });

    it('should handle special characters in parameters', () => {
      const specialUserId = 'user@domain.com#special';
      const url = userStreamApi.followers({
        user_id: specialUserId,
        viewer_id: mockViewerId,
      });

      expect(url).toContain(`user_id=${encodeURIComponent(specialUserId)}`);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle maximum numeric values', () => {
      const url = userStreamApi.followers({
        user_id: mockUserId,
        skip: Number.MAX_SAFE_INTEGER,
        limit: Number.MAX_SAFE_INTEGER,
      });

      expect(url).toContain(`skip=${Number.MAX_SAFE_INTEGER}`);
      expect(url).toContain(`limit=${Number.MAX_SAFE_INTEGER}`);
    });

    it('should handle zero values', () => {
      const url = userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 0,
      });

      expect(url).toContain('skip=0');
      expect(url).toContain('limit=0');
    });

    it('should handle negative numeric values (should be filtered out)', () => {
      const url = userStreamApi.followers({
        user_id: mockUserId,
        skip: -1,
        limit: -5,
      });

      // Negative values should be filtered out by the buildUserStreamUrl function
      expect(url).not.toContain('skip=');
      expect(url).not.toContain('limit=');
    });
  });

  describe('Type safety validation', () => {
    it('should handle boolean preview parameter correctly', () => {
      const url = userStreamApi.followers({
        user_id: mockUserId,
        preview: true,
      });

      expect(url).toContain('preview=true');
    });

    it('should handle enum values correctly', () => {
      const url = userStreamApi.influencers({
        user_id: mockUserId,
        reach: Core.UserStreamReach.FOLLOWERS,
        timeframe: Core.UserStreamTimeframe.THIS_MONTH,
      });

      expect(url).toContain('reach=followers');
      expect(url).toContain('timeframe=this_month');
    });
  });

  describe('buildUserStreamBodyUrl function', () => {
    it('should handle missing optional parameters', () => {
      const body = buildUserStreamBodyUrl({
        user_ids: mockUserIds,
      });

      expect(body).toEqual({
        user_ids: mockUserIds,
      });
      expect(body).not.toHaveProperty('viewer_id');
      expect(body).not.toHaveProperty('depth');
    });

    it('should handle all parameters provided', () => {
      const body = buildUserStreamBodyUrl({
        user_ids: mockUserIds,
        viewer_id: mockViewerId,
        depth: 2,
      });

      expect(body).toEqual({
        user_ids: mockUserIds,
        viewer_id: mockViewerId,
        depth: 2,
      });
    });

    it('should handle depth as 0', () => {
      const body = buildUserStreamBodyUrl({
        user_ids: mockUserIds,
        depth: 0,
      });

      expect(body.depth).toBe(0);
    });
  });

  describe('UserStreamApiEndpoint type', () => {
    it('should have exactly 11 endpoints', () => {
      const endpointKeys = Object.keys(userStreamApi);
      expect(endpointKeys).toHaveLength(11);
      expect(endpointKeys).toContain('followers');
      expect(endpointKeys).toContain('following');
      expect(endpointKeys).toContain('friends');
      expect(endpointKeys).toContain('muted');
      expect(endpointKeys).toContain('recommended');
      expect(endpointKeys).toContain('influencers');
      expect(endpointKeys).toContain('postReplies');
      expect(endpointKeys).toContain('friendsWithDepth');
      expect(endpointKeys).toContain('mostFollowed');
      expect(endpointKeys).toContain('username');
      expect(endpointKeys).toContain('usersByIds');
    });
  });
});
