import { describe, it, expect } from 'vitest';
import * as Core from '@/core';
import { postStreamApi } from './postStream.api';
import { StreamKind, StreamOrder } from './postStream.types';

describe('Stream API URL Generation', () => {
  const mockObserverId = 'erztyis9oiaho93ckucetcf5xnxacecqwhbst5hnd7mmkf69dhby';
  const mockAuthorId = 'author-pubky-id';
  const mockPostId = 'post-pubky-id';
  const mockViewerId = 'viewer-pubky-id';

  describe('Sources requiring observer_id', () => {
    it('should generate correct following URL', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        viewer_id: mockViewerId,
        sorting: Core.StreamSorting.TIMELINE,
        limit: 10,
      });

      expect(url).toContain('v0/stream/posts?');
      expect(url).toContain('source=following');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      expect(url).toContain(`viewer_id=${mockViewerId}`);
      expect(url).toContain('sorting=timeline');
      expect(url).toContain('limit=10');
    });

    it('should generate correct followers URL', () => {
      const url = postStreamApi.followers({
        observer_id: mockObserverId,
        sorting: Core.StreamSorting.ENGAGEMENT,
      });

      expect(url).toContain('source=followers');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      expect(url).toContain('sorting=total_engagement');
    });

    it('should generate correct friends URL', () => {
      const url = postStreamApi.friends({
        observer_id: mockObserverId,
        tags: ['dev', 'opensource'],
        kind: StreamKind.SHORT,
      });

      expect(url).toContain('source=friends');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      expect(url).toContain('tags=dev%2Copensource');
      expect(url).toContain('kind=short');
    });

    it('should generate correct bookmarks URL', () => {
      const url = postStreamApi.bookmarks({
        observer_id: mockObserverId,
        order: StreamOrder.ASCENDING,
        start: 1759289451314,
        end: 1759289451314,
      });

      expect(url).toContain('source=bookmarks');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      expect(url).toContain('order=ascending');
      expect(url).toContain('start=1759289451314');
      expect(url).toContain('end=1759289451314');
    });
  });

  describe('Post replies requiring author_id and post_id', () => {
    it('should generate correct post replies URL', () => {
      const url = postStreamApi.postReplies({
        author_id: mockAuthorId,
        post_id: mockPostId,
        viewer_id: mockViewerId,
        limit: 20,
      });

      expect(url).toContain('source=replies');
      expect(url).toContain(`author_id=${mockAuthorId}`);
      expect(url).toContain(`post_id=${mockPostId}`);
      expect(url).toContain(`viewer_id=${mockViewerId}`);
      expect(url).toContain('limit=20');
    });
  });

  describe('Author posts requiring author_id', () => {
    it('should generate correct author URL', () => {
      const url = postStreamApi.author({
        author_id: mockAuthorId,
        sorting: Core.StreamSorting.TIMELINE,
        kind: StreamKind.IMAGE,
      });

      expect(url).toContain('source=author');
      expect(url).toContain(`author_id=${mockAuthorId}`);
      expect(url).toContain('sorting=timeline');
      expect(url).toContain('kind=image');
    });

    it('should generate correct author replies URL', () => {
      const url = postStreamApi.authorReplies({
        author_id: mockAuthorId,
        tags: ['tech', 'ai', 'machine-learning'],
        order: StreamOrder.DESCENDING,
      });

      expect(url).toContain('source=author_replies');
      expect(url).toContain(`author_id=${mockAuthorId}`);
      expect(url).toContain('tags=tech%2Cai%2Cmachine-learning');
      expect(url).toContain('order=descending');
    });
  });

  describe('All posts (no additional required parameters)', () => {
    it('should generate correct all posts URL', () => {
      const url = postStreamApi.all({
        viewer_id: mockViewerId,
        sorting: Core.StreamSorting.ENGAGEMENT,
        kind: StreamKind.VIDEO,
        limit: 50,
      });

      expect(url).toContain('source=all');
      expect(url).toContain(`viewer_id=${mockViewerId}`);
      expect(url).toContain('sorting=total_engagement');
      expect(url).toContain('kind=video');
      expect(url).toContain('limit=50');
    });
  });

  describe('Tags validation', () => {
    it('should limit tags to maximum 5', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'], // 7 tags
      });

      expect(url).toContain('tags=tag1%2Ctag2%2Ctag3%2Ctag4%2Ctag5'); // Only first 5
      expect(url).not.toContain('tag6');
      expect(url).not.toContain('tag7');
    });

    it('should handle empty tags array', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        tags: [],
      });

      expect(url).not.toContain('tags=');
    });
  });

  describe('Parameter handling', () => {
    it('should handle undefined and null values correctly', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        viewer_id: undefined,
        sorting: null as unknown as Core.StreamSorting,
        limit: undefined,
      });

      expect(url).toContain('source=following');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      expect(url).not.toContain('viewer_id=');
      expect(url).not.toContain('sorting=');
      expect(url).not.toContain('limit=');
    });

    it('should convert numbers to strings', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        limit: 10,
        skip: 5,
        start: 1234567890,
        end: 9876543210,
      });

      expect(url).toContain('limit=10');
      expect(url).toContain('skip=5');
      expect(url).toContain('start=1234567890');
      expect(url).toContain('end=9876543210');
    });
  });

  describe('URL structure validation', () => {
    it('should always start with v0/stream/posts?', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
      });

      expect(url).toMatch(/v0\/stream\/posts\?/);
    });

    it('should have proper query parameter format', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        viewer_id: mockViewerId,
        sorting: Core.StreamSorting.TIMELINE,
      });

      // Should have proper key=value&key=value format
      expect(url).toMatch(/source=following/);
      expect(url).toMatch(/observer_id=erztyis9oiaho93ckucetcf5xnxacecqwhbst5hnd7mmkf69dhby/);
      expect(url).toMatch(/viewer_id=viewer-pubky-id/);
      expect(url).toMatch(/sorting=timeline/);
    });
  });

  describe('Edge cases', () => {
    it('should handle minimal parameters', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
      });

      expect(url).toContain('source=following');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      // Should not have any other parameters
      expect(url.split('&')).toHaveLength(2); // source and observer_id only
    });

    it('should handle all optional parameters', () => {
      const url = postStreamApi.following({
        observer_id: mockObserverId,
        viewer_id: mockViewerId,
        sorting: Core.StreamSorting.TIMELINE,
        order: StreamOrder.DESCENDING,
        tags: ['dev', 'test'],
        kind: StreamKind.SHORT,
        skip: 0,
        limit: 10,
        start: 1000,
        end: 2000,
      });

      expect(url).toContain('source=following');
      expect(url).toContain(`observer_id=${mockObserverId}`);
      expect(url).toContain(`viewer_id=${mockViewerId}`);
      expect(url).toContain('sorting=timeline');
      expect(url).toContain('order=descending');
      expect(url).toContain('tags=dev%2Ctest');
      expect(url).toContain('kind=short');
      expect(url).toContain('skip=0');
      expect(url).toContain('limit=10');
      expect(url).toContain('start=1000');
      expect(url).toContain('end=2000');
    });
  });

  describe('Posts by IDs endpoint', () => {
    const mockPostIds = ['post-id-1', 'post-id-2', 'post-id-3'];
    const mockViewerId = 'viewer-pubky-id';

    it('should generate correct POST request with post IDs only', () => {
      const request = postStreamApi.postsByIds({
        post_ids: mockPostIds,
      });

      expect(request.url).toMatch(/\/stream\/posts\/by_ids$/);
      expect(request.body).toEqual({
        post_ids: mockPostIds,
      });
    });

    it('should generate correct POST request with post IDs and viewer_id', () => {
      const request = postStreamApi.postsByIds({
        post_ids: mockPostIds,
        viewer_id: mockViewerId,
      });

      expect(request.url).toMatch(/\/stream\/posts\/by_ids$/);
      expect(request.body).toEqual({
        post_ids: mockPostIds,
        viewer_id: mockViewerId,
      });
    });

    it('should handle empty post IDs array', () => {
      const request = postStreamApi.postsByIds({
        post_ids: [],
      });

      expect(request.url).toMatch(/\/stream\/posts\/by_ids$/);
      expect(request.body.post_ids).toEqual([]);
    });

    it('should handle large array of post IDs', () => {
      const largePostIds = Array.from({ length: 100 }, (_, i) => `post-id-${i}`);
      const request = postStreamApi.postsByIds({
        post_ids: largePostIds,
        viewer_id: mockViewerId,
      });

      expect(request.url).toMatch(/\/stream\/posts\/by_ids$/);
      expect(request.body.post_ids).toHaveLength(100);
      expect(request.body.viewer_id).toBe(mockViewerId);
    });
  });

  describe('PostStreamApiEndpoint type', () => {
    it('should have exactly 9 endpoints', () => {
      const endpointKeys = Object.keys(postStreamApi);
      expect(endpointKeys).toHaveLength(9);
      expect(endpointKeys).toContain('following');
      expect(endpointKeys).toContain('followers');
      expect(endpointKeys).toContain('friends');
      expect(endpointKeys).toContain('bookmarks');
      expect(endpointKeys).toContain('postReplies');
      expect(endpointKeys).toContain('author');
      expect(endpointKeys).toContain('authorReplies');
      expect(endpointKeys).toContain('postsByIds');
      expect(endpointKeys).toContain('all');
    });
  });
});
