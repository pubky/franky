import { describe, it, expect } from 'vitest';
import * as Core from '@/core';
import { createUserStreamParams } from './userStream.utils';

describe('createUserStreamParams', () => {
  const baseParams: Core.TUserStreamBase = {
    skip: 0,
    limit: 20,
  };

  // ============================================================================
  // 2-Part Composite IDs (userId:reach)
  // ============================================================================

  describe('2-part composite IDs (userId:reach)', () => {
    it('should parse followers composite ID correctly', () => {
      const streamId = 'user-123:followers' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('followers');
      expect(result.apiParams).toEqual({
        user_id: 'user-123',
        skip: 0,
        limit: 20,
      });
    });

    it('should parse following composite ID correctly', () => {
      const streamId = 'user-456:following' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('following');
      expect(result.apiParams).toEqual({
        user_id: 'user-456',
        skip: 0,
        limit: 20,
      });
    });

    it('should parse friends composite ID correctly', () => {
      const streamId = 'user-789:friends' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('friends');
      expect(result.apiParams).toEqual({
        user_id: 'user-789',
        skip: 0,
        limit: 20,
      });
    });

    it('should parse muted composite ID correctly', () => {
      const streamId = 'user-abc:muted' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('muted');
      expect(result.apiParams).toEqual({
        user_id: 'user-abc',
        skip: 0,
        limit: 20,
      });
    });

    it('should handle user IDs with special characters', () => {
      const streamId = 'user_with-special.chars:followers' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('followers');
      expect(result.apiParams).toHaveProperty('user_id', 'user_with-special.chars');
    });

    it('should spread baseParams correctly', () => {
      const streamId = 'user-123:followers' as Core.UserStreamId;
      const paramsWithViewer: Core.TUserStreamBase = {
        skip: 10,
        limit: 30,
        viewer_id: 'viewer-xyz' as Core.Pubky,
      };

      const result = createUserStreamParams(streamId, paramsWithViewer);

      expect(result.apiParams).toEqual({
        user_id: 'user-123',
        skip: 10,
        limit: 30,
        viewer_id: 'viewer-xyz',
      });
    });

    it('should handle preview parameter', () => {
      const streamId = 'user-123:followers' as Core.UserStreamId;
      const paramsWithPreview: Core.TUserStreamBase = {
        skip: 0,
        limit: 20,
        preview: true,
      };

      const result = createUserStreamParams(streamId, paramsWithPreview);

      expect(result.apiParams).toHaveProperty('preview', true);
    });
  });

  // ============================================================================
  // 3-Part Enum Types (source:timeframe:reach)
  // ============================================================================

  describe('3-part enum types (source:timeframe:reach)', () => {
    it('should parse influencers stream ID correctly', () => {
      const streamId = Core.UserStreamTypes.TODAY_INFLUENCERS_ALL;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('influencers');
      expect(result.apiParams).toEqual({
        skip: 0,
        limit: 20,
        timeframe: 'today',
        reach: 'all',
      });
    });

    it('should parse recommended stream ID correctly', () => {
      const streamId = Core.UserStreamTypes.RECOMMENDED;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('recommended');
      expect(result.apiParams).toEqual({
        skip: 0,
        limit: 20,
      });
    });

    it('should handle influencers with different timeframe', () => {
      const streamId = 'influencers:this_month:followers' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('influencers');
      expect(result.apiParams).toEqual({
        skip: 0,
        limit: 20,
        timeframe: 'this_month',
        reach: 'followers',
      });
    });

    it('should handle influencers with different reach', () => {
      const streamId = 'influencers:today:following' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('influencers');
      expect(result.apiParams).toEqual({
        skip: 0,
        limit: 20,
        timeframe: 'today',
        reach: 'following',
      });
    });

    it('should spread baseParams for influencers', () => {
      const streamId = Core.UserStreamTypes.TODAY_INFLUENCERS_ALL;
      const paramsWithViewer: Core.TUserStreamBase = {
        skip: 5,
        limit: 15,
        viewer_id: 'viewer-abc' as Core.Pubky,
      };

      const result = createUserStreamParams(streamId, paramsWithViewer);

      expect(result.apiParams).toEqual({
        skip: 5,
        limit: 15,
        viewer_id: 'viewer-abc',
        timeframe: 'today',
        reach: 'all',
      });
    });

    it('should handle 3-part non-influencers format', () => {
      const streamId = 'recommended:all:all' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('recommended');
      expect(result.apiParams).toEqual(baseParams);
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  describe('edge cases and error handling', () => {
    it('should throw error for invalid format (1 part)', () => {
      const streamId = 'invalid-stream-id' as Core.UserStreamId;

      expect(() => createUserStreamParams(streamId, baseParams)).toThrow(
        'Invalid stream ID: "invalid-stream-id". Expected 2 or 3 parts separated by ":"',
      );
    });

    it('should throw error for invalid format (4+ parts)', () => {
      const streamId = 'part1:part2:part3:part4' as Core.UserStreamId;

      expect(() => createUserStreamParams(streamId, baseParams)).toThrow(
        'Invalid stream ID: "part1:part2:part3:part4". Expected 2 or 3 parts separated by ":"',
      );
    });

    it('should throw error for empty streamId', () => {
      const streamId = '' as Core.UserStreamId;

      expect(() => createUserStreamParams(streamId, baseParams)).toThrow();
    });

    it('should handle empty parts gracefully', () => {
      // This would create userId="" or reach=""
      const streamId = ':followers' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('followers');
      expect(result.apiParams).toHaveProperty('user_id', '');
    });

    it('should handle trailing colon', () => {
      const streamId = 'user-123:' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      expect(result.reach).toBe('');
      expect(result.apiParams).toHaveProperty('user_id', 'user-123');
    });
  });

  // ============================================================================
  // Type Safety Verification
  // ============================================================================

  describe('type safety', () => {
    it('should return correct apiParams type for followers', () => {
      const streamId = 'user-123:followers' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      // Type check: should have user_id property
      expect(result.apiParams).toHaveProperty('user_id');
      expect((result.apiParams as Core.TUserStreamWithUserIdParams).user_id).toBe('user-123');
    });

    it('should return correct apiParams type for influencers', () => {
      const streamId = Core.UserStreamTypes.TODAY_INFLUENCERS_ALL;

      const result = createUserStreamParams(streamId, baseParams);

      // Type check: should have timeframe and reach properties
      expect(result.apiParams).toHaveProperty('timeframe');
      expect(result.apiParams).toHaveProperty('reach');
      expect((result.apiParams as Core.TUserStreamInfluencersParams).timeframe).toBe('today');
      expect((result.apiParams as Core.TUserStreamInfluencersParams).reach).toBe('all');
    });

    it('should return correct apiParams type for most_followed', () => {
      const streamId = 'most_followed:all:all' as Core.UserStreamId;

      const result = createUserStreamParams(streamId, baseParams);

      // Type check: should only have base params
      expect(result.apiParams).toEqual(baseParams);
      expect(result.reach).toBe('most_followed');
    });
  });

  // ============================================================================
  // All UserStreamSource Values
  // ============================================================================

  describe('all UserStreamSource enum values', () => {
    it('should handle followers', () => {
      const streamId = 'user-123:followers' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('followers');
    });

    it('should handle following', () => {
      const streamId = 'user-123:following' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('following');
    });

    it('should handle friends', () => {
      const streamId = 'user-123:friends' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('friends');
    });

    it('should handle muted', () => {
      const streamId = 'user-123:muted' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('muted');
    });

    it('should handle recommended', () => {
      const streamId = 'recommended:all:all' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('recommended');
    });

    it('should handle influencers', () => {
      const streamId = 'influencers:today:all' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('influencers');
    });

    it('should handle most_followed', () => {
      const streamId = 'most_followed:all:all' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('most_followed');
    });

    it('should handle post_replies', () => {
      const streamId = 'post_replies:all:all' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);
      expect(result.reach).toBe('post_replies');
    });
  });

  // ============================================================================
  // Integration with userStreamApi
  // ============================================================================

  describe('integration with userStreamApi', () => {
    it('should generate parameters compatible with userStreamApi.followers', () => {
      const streamId = 'user-123:followers' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);

      // Should be able to call userStreamApi with these params
      const url = Core.userStreamApi.followers(result.apiParams as Core.TUserStreamWithUserIdParams);
      expect(url).toContain('user_id=user-123');
      expect(url).toContain('skip=0');
      expect(url).toContain('limit=20');
    });

    it('should generate parameters compatible with userStreamApi.influencers', () => {
      const streamId = Core.UserStreamTypes.TODAY_INFLUENCERS_ALL;
      const result = createUserStreamParams(streamId, baseParams);

      // Should be able to call userStreamApi with these params
      const url = Core.userStreamApi.influencers(result.apiParams as Core.TUserStreamInfluencersParams);
      expect(url).toContain('timeframe=today');
      expect(url).toContain('reach=all');
    });

    it('should generate parameters compatible with userStreamApi.mostFollowed', () => {
      const streamId = 'most_followed:all:all' as Core.UserStreamId;
      const result = createUserStreamParams(streamId, baseParams);

      // Should be able to call userStreamApi with these params
      const url = Core.userStreamApi.mostFollowed(result.apiParams as Core.TUserStreamBase);
      expect(url).toContain('skip=0');
      expect(url).toContain('limit=20');
    });
  });
});
