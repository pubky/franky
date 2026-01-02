import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationController } from './moderation';
import * as Core from '@/core';

vi.mock('@/core/application/moderation', () => ({
  ModerationApplication: {
    setUnblur: vi.fn(),
    enrichPostsWithModeration: vi.fn(),
  },
}));

describe('ModerationController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unblurPost', () => {
    it('should call ModerationApplication.setUnblur', async () => {
      const postId = 'author:post1';
      const spy = vi.spyOn(Core.ModerationApplication, 'setUnblur').mockResolvedValue(undefined);

      await ModerationController.unblurPost(postId);

      expect(spy).toHaveBeenCalledWith(postId);
    });
  });

  describe('enrichPosts', () => {
    it('should pass isBlurDisabledGlobally from settings store', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Content 1',
          kind: 'short',
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
      ];

      const enrichedPosts: Core.EnrichedPostDetails[] = [{ ...posts[0], is_moderated: true, is_blurred: true }];

      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const enrichSpy = vi
        .spyOn(Core.ModerationApplication, 'enrichPostsWithModeration')
        .mockResolvedValue(enrichedPosts);

      const result = await ModerationController.enrichPosts(posts);

      expect(result).toEqual(enrichedPosts);
      expect(enrichSpy).toHaveBeenCalledWith(posts, false); // blurCensored: true means isBlurDisabledGlobally: false
    });

    it('should handle empty array', async () => {
      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const enrichSpy = vi.spyOn(Core.ModerationApplication, 'enrichPostsWithModeration').mockResolvedValue([]);

      const result = await ModerationController.enrichPosts([]);

      expect(result).toEqual([]);
      expect(enrichSpy).toHaveBeenCalledWith([], false);
    });
  });
});
