import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationController } from './moderation';
import * as Core from '@/core';

vi.mock('@/core/application/moderation', () => ({
  ModerationApplication: {
    setBlur: vi.fn(),
    enrichPostWithModeration: vi.fn(),
    enrichPostsWithModeration: vi.fn(),
  },
}));

describe('ModerationController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setPostBlur', () => {
    it('should call ModerationApplication.setBlur with correct parameters', async () => {
      const postId = 'author:post1';
      const setBlurSpy = vi.spyOn(Core.ModerationApplication, 'setBlur').mockResolvedValue(undefined);

      await ModerationController.setPostBlur({ postId, blur: true });

      expect(setBlurSpy).toHaveBeenCalledWith(postId, true);
    });

    it('should handle blur: false', async () => {
      const postId = 'author:post1';
      const setBlurSpy = vi.spyOn(Core.ModerationApplication, 'setBlur').mockResolvedValue(undefined);

      await ModerationController.setPostBlur({ postId, blur: false });

      expect(setBlurSpy).toHaveBeenCalledWith(postId, false);
    });
  });

  describe('enrichPost', () => {
    it('should delegate to ModerationApplication.enrichPostWithModeration', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: 'short',
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const enrichedPost: Core.EnrichedPostDetails = {
        ...post,
        is_moderated: true,
        is_blurred: true,
      };

      const enrichSpy = vi
        .spyOn(Core.ModerationApplication, 'enrichPostWithModeration')
        .mockResolvedValue(enrichedPost);

      const result = await ModerationController.enrichPost({ post });

      expect(result).toEqual(enrichedPost);
      expect(enrichSpy).toHaveBeenCalledWith(post);
    });
  });

  describe('enrichPosts', () => {
    it('should delegate to ModerationApplication.enrichPostsWithModeration', async () => {
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

      const enrichedPosts: Core.EnrichedPostDetails[] = [
        { ...posts[0], is_moderated: true, is_blurred: true },
        { ...posts[1], is_moderated: false, is_blurred: false },
      ];

      const enrichSpy = vi
        .spyOn(Core.ModerationApplication, 'enrichPostsWithModeration')
        .mockResolvedValue(enrichedPosts);

      const result = await ModerationController.enrichPosts({ posts });

      expect(result).toEqual(enrichedPosts);
      expect(enrichSpy).toHaveBeenCalledWith(posts);
    });

    it('should handle empty array', async () => {
      const enrichSpy = vi.spyOn(Core.ModerationApplication, 'enrichPostsWithModeration').mockResolvedValue([]);

      const result = await ModerationController.enrichPosts({ posts: [] });

      expect(result).toEqual([]);
      expect(enrichSpy).toHaveBeenCalledWith([]);
    });
  });
});
