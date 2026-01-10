import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationController } from './moderation';
import * as Core from '@/core';

vi.mock('@/core/application/moderation', () => ({
  ModerationApplication: {
    setUnblur: vi.fn(),
    enrichPostsWithModeration: vi.fn(),
    enrichUsersWithModeration: vi.fn(),
    getModerationStatus: vi.fn(),
  },
}));

describe('ModerationController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unblur', () => {
    it('should call ModerationApplication.setUnblur', async () => {
      const id = 'author:post1';
      const spy = vi.spyOn(Core.ModerationApplication, 'setUnblur').mockResolvedValue(undefined);

      await ModerationController.unblur(id);

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should work for both posts and profiles', async () => {
      const spy = vi.spyOn(Core.ModerationApplication, 'setUnblur').mockResolvedValue(undefined);

      await ModerationController.unblur('author:post1');
      await ModerationController.unblur('pk:user1');

      expect(spy).toHaveBeenCalledWith('author:post1');
      expect(spy).toHaveBeenCalledWith('pk:user1');
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

  describe('enrichUsers', () => {
    it('should pass isBlurDisabledGlobally from settings store', async () => {
      const users: Core.UserDetailsModelSchema[] = [
        {
          id: 'pk:user1' as Core.Pubky,
          name: 'Test User',
          bio: 'Test bio',
          image: null,
          links: [],
          status: null,
          indexed_at: 123456,
        },
      ];

      const enrichedUsers: Core.EnrichedUserDetails[] = [{ ...users[0], is_moderated: true, is_blurred: true }];

      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const enrichSpy = vi
        .spyOn(Core.ModerationApplication, 'enrichUsersWithModeration')
        .mockResolvedValue(enrichedUsers);

      const result = await ModerationController.enrichUsers(users);

      expect(result).toEqual(enrichedUsers);
      expect(enrichSpy).toHaveBeenCalledWith(users, false); // blurCensored: true means isBlurDisabledGlobally: false
    });

    it('should handle blur disabled globally', async () => {
      const users: Core.UserDetailsModelSchema[] = [
        {
          id: 'pk:user1' as Core.Pubky,
          name: 'Test User',
          bio: 'Test bio',
          image: null,
          links: [],
          status: null,
          indexed_at: 123456,
        },
      ];

      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: false },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const enrichSpy = vi.spyOn(Core.ModerationApplication, 'enrichUsersWithModeration').mockResolvedValue([]);

      await ModerationController.enrichUsers(users);

      expect(enrichSpy).toHaveBeenCalledWith(users, true); // blurCensored: false means isBlurDisabledGlobally: true
    });

    it('should handle empty array', async () => {
      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const enrichSpy = vi.spyOn(Core.ModerationApplication, 'enrichUsersWithModeration').mockResolvedValue([]);

      const result = await ModerationController.enrichUsers([]);

      expect(result).toEqual([]);
      expect(enrichSpy).toHaveBeenCalledWith([], false);
    });
  });

  describe('getModerationStatus', () => {
    it('should call ModerationApplication.getModerationStatus with correct params for POST', async () => {
      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const spy = vi
        .spyOn(Core.ModerationApplication, 'getModerationStatus')
        .mockResolvedValue({ is_moderated: true, is_blurred: true });

      const result = await ModerationController.getModerationStatus('author:post1', Core.ModerationType.POST);

      expect(spy).toHaveBeenCalledWith('author:post1', Core.ModerationType.POST, false);
      expect(result).toEqual({ is_moderated: true, is_blurred: true });
    });

    it('should call ModerationApplication.getModerationStatus with correct params for PROFILE', async () => {
      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: false },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const spy = vi
        .spyOn(Core.ModerationApplication, 'getModerationStatus')
        .mockResolvedValue({ is_moderated: true, is_blurred: false });

      const result = await ModerationController.getModerationStatus('pk:user1', Core.ModerationType.PROFILE);

      expect(spy).toHaveBeenCalledWith('pk:user1', Core.ModerationType.PROFILE, true);
      expect(result).toEqual({ is_moderated: true, is_blurred: false });
    });

    it('should return not moderated status', async () => {
      vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      vi.spyOn(Core.ModerationApplication, 'getModerationStatus').mockResolvedValue({
        is_moderated: false,
        is_blurred: false,
      });

      const result = await ModerationController.getModerationStatus('pk:user1', Core.ModerationType.PROFILE);

      expect(result).toEqual({ is_moderated: false, is_blurred: false });
    });
  });
});
