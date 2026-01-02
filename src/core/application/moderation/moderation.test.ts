import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationApplication } from './moderation';
import * as Core from '@/core';

vi.mock('@/core/services/local/moderation', () => ({
  LocalModerationService: {
    setUnblur: vi.fn(),
  },
}));

vi.mock('@/core/models/moderation', () => ({
  ModerationModel: {
    findByIds: vi.fn(),
  },
}));

describe('ModerationApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setUnblur', () => {
    it('should delegate to LocalModerationService', async () => {
      const postId = 'author:post1';
      const spy = vi.spyOn(Core.LocalModerationService, 'setUnblur').mockResolvedValue(undefined);

      await ModerationApplication.setUnblur(postId);

      expect(spy).toHaveBeenCalledWith(postId);
    });
  });

  describe('enrichPostsWithModeration', () => {
    it('should return not moderated when no record exists', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Test content',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
      ];

      vi.spyOn(Core.ModerationModel, 'findByIds').mockResolvedValue([]);

      const result = await ModerationApplication.enrichPostsWithModeration(posts, false);

      expect(result).toEqual([{ ...posts[0], is_moderated: false, is_blurred: false }]);
    });

    it('should return blurred when post is moderated and is_blurred is true', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Test content',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
      ];

      vi.spyOn(Core.ModerationModel, 'findByIds').mockResolvedValue([
        { id: posts[0].id, is_blurred: true, created_at: Date.now() },
      ]);

      const result = await ModerationApplication.enrichPostsWithModeration(posts, false);

      expect(result).toEqual([{ ...posts[0], is_moderated: true, is_blurred: true }]);
    });

    it('should return not blurred when post is moderated but is_blurred is false', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Test content',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
      ];

      vi.spyOn(Core.ModerationModel, 'findByIds').mockResolvedValue([
        { id: posts[0].id, is_blurred: false, created_at: Date.now() },
      ]);

      const result = await ModerationApplication.enrichPostsWithModeration(posts, false);

      expect(result).toEqual([{ ...posts[0], is_moderated: true, is_blurred: false }]);
    });

    it('should return not blurred when blur is disabled globally', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Test content',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
      ];

      vi.spyOn(Core.ModerationModel, 'findByIds').mockResolvedValue([
        { id: posts[0].id, is_blurred: true, created_at: Date.now() },
      ]);

      const result = await ModerationApplication.enrichPostsWithModeration(posts, true); // blur disabled

      expect(result).toEqual([{ ...posts[0], is_moderated: true, is_blurred: false }]);
    });

    it('should use single batch query for multiple posts', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Content 1',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
        {
          id: 'author:post2',
          content: 'Content 2',
          kind: 'short',
          indexed_at: 123457,
          uri: 'pubky://author/pub/pubky.app/posts/post2',
          attachments: [],
        },
      ];

      const findByIdsSpy = vi
        .spyOn(Core.ModerationModel, 'findByIds')
        .mockResolvedValue([{ id: 'author:post1', is_blurred: true, created_at: Date.now() }]);

      const result = await ModerationApplication.enrichPostsWithModeration(posts, false);

      expect(findByIdsSpy).toHaveBeenCalledWith(['author:post1', 'author:post2']);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ ...posts[0], is_moderated: true, is_blurred: true });
      expect(result[1]).toEqual({ ...posts[1], is_moderated: false, is_blurred: false });
    });

    it('should return empty array for empty input', async () => {
      const result = await ModerationApplication.enrichPostsWithModeration([], false);

      expect(result).toEqual([]);
    });

    it('should handle mixed moderation states', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Moderated but unblurred',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
        {
          id: 'author:post2',
          content: 'Moderated and blurred',
          kind: 'short',
          indexed_at: 123457,
          uri: 'pubky://author/pub/pubky.app/posts/post2',
          attachments: [],
        },
        {
          id: 'author:post3',
          content: 'Not moderated',
          kind: 'short',
          indexed_at: 123458,
          uri: 'pubky://author/pub/pubky.app/posts/post3',
          attachments: [],
        },
      ];

      vi.spyOn(Core.ModerationModel, 'findByIds').mockResolvedValue([
        { id: 'author:post1', is_blurred: false, created_at: Date.now() },
        { id: 'author:post2', is_blurred: true, created_at: Date.now() },
      ]);

      const result = await ModerationApplication.enrichPostsWithModeration(posts, false);

      expect(result[0].is_moderated).toBe(true);
      expect(result[0].is_blurred).toBe(false);
      expect(result[1].is_moderated).toBe(true);
      expect(result[1].is_blurred).toBe(true);
      expect(result[2].is_moderated).toBe(false);
      expect(result[2].is_blurred).toBe(false);
    });
  });
});
