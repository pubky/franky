import { describe, it, expect } from 'vitest';
import * as Core from '@/core';

describe('NexusFollowersStreamService', () => {
  const mockUserId = 'erztyis9oiaho93ckucetcf5xnxacecqwhbst5hnd7mmkf69dhby';

  describe('streamId validation', () => {
    it('should accept valid followers streamId', async () => {
      const streamId = Core.UserStreamTypes.TODAY_FOLLOWERS_ALL;

      // This should not throw
      expect(() => {
        const streamParts = streamId.split(':');
        const streamType = streamParts[0];
        if (streamType !== 'followers') {
          throw new Error(`Invalid stream type for followers: ${streamType}`);
        }
      }).not.toThrow();
    });

    it('should reject invalid streamId (following instead of followers)', () => {
      const streamId = Core.UserStreamTypes.TODAY_FOLLOWING_ALL;

      expect(() => {
        const streamParts = streamId.split(':');
        const streamType = streamParts[0];
        if (streamType !== 'followers') {
          throw new Error(`Invalid stream type for followers: ${streamType}`);
        }
      }).toThrow('Invalid stream type for followers: following');
    });

    it('should parse streamId correctly', () => {
      const streamId = Core.UserStreamTypes.TODAY_FOLLOWERS_ALL;
      const streamParts = streamId.split(':');

      expect(streamParts[0]).toBe('followers');
      expect(streamParts[1]).toBe('today');
      expect(streamParts[2]).toBe('all');
    });
  });

  describe('URL generation via userStreamApi', () => {
    it('should generate correct URL with all parameters', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 10,
      });

      expect(url).toContain('v0/stream/users?');
      expect(url).toContain('source=followers');
      expect(url).toContain(`user_id=${mockUserId}`);
      expect(url).toContain('skip=0');
      expect(url).toContain('limit=10');
    });

    it('should generate URL with skip parameter', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 5,
        limit: 5,
      });

      expect(url).toContain('skip=5');
      expect(url).toContain('limit=5');
    });

    it('should generate URL with large skip value', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 60,
        limit: 10,
      });

      expect(url).toContain('skip=60');
      expect(url).toContain('limit=10');
    });

    it('should generate URL with different limit values', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 20,
      });

      expect(url).toContain('limit=20');
    });

    it('should handle optional viewer_id parameter', () => {
      const viewerId = 'viewer-pubky-id';
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        viewer_id: viewerId,
        skip: 0,
        limit: 10,
      });

      expect(url).toContain(`viewer_id=${viewerId}`);
    });

    it('should handle undefined viewer_id', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        viewer_id: undefined,
        skip: 0,
        limit: 10,
      });

      expect(url).not.toContain('viewer_id=');
    });
  });

  describe('Parameter handling', () => {
    it('should handle zero skip', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 5,
      });

      expect(url).toContain('skip=0');
      expect(url).toContain('limit=5');
    });

    it('should handle small limit', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 1,
      });

      expect(url).toContain('limit=1');
    });

    it('should convert numbers to strings', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 10,
        limit: 20,
      });

      expect(url).toContain('skip=10');
      expect(url).toContain('limit=20');
    });
  });

  describe('URL structure validation', () => {
    it('should always start with v0/stream/users?', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 10,
      });

      expect(url).toMatch(/v0\/stream\/users\?/);
    });

    it('should have proper query parameter format', () => {
      const url = Core.userStreamApi.followers({
        user_id: mockUserId,
        skip: 0,
        limit: 10,
      });

      // Should have proper key=value&key=value format
      expect(url).toMatch(/source=followers/);
      expect(url).toMatch(/user_id=/);
      expect(url).toMatch(/skip=0/);
      expect(url).toMatch(/limit=10/);
    });
  });
});
