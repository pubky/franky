import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationApplication } from './moderation';
import * as Core from '@/core';

vi.mock('@/core/services/local/moderation', () => ({
  LocalModerationService: {
    setBlur: vi.fn(),
    getModerationRecord: vi.fn(),
  },
}));

describe('ModerationApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setBlur', () => {
    it('should delegate to LocalModerationService', async () => {
      const postId = 'author:post1';
      const setBlurSpy = vi.spyOn(Core.LocalModerationService, 'setBlur').mockResolvedValue(undefined);

      await ModerationApplication.setBlur(postId, true);

      expect(setBlurSpy).toHaveBeenCalledWith(postId, true);
    });
  });

  describe('enrichPostWithModeration', () => {
    it('should return not moderated when no record exists', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: 'short',
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const getModerationRecordSpy = vi
        .spyOn(Core.LocalModerationService, 'getModerationRecord')
        .mockResolvedValue(null);

      const result = await ModerationApplication.enrichPostWithModeration(post);

      expect(result).toEqual({
        ...post,
        is_moderated: false,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      getModerationRecordSpy.mockRestore();
    });

    it('should return blurred when post is moderated and is_blurred is true', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: 'short',
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const getModerationRecordSpy = vi
        .spyOn(Core.LocalModerationService, 'getModerationRecord')
        .mockResolvedValue({ id: post.id, is_blurred: true, created_at: Date.now() });

      const result = await ModerationApplication.enrichPostWithModeration(post);

      expect(result).toEqual({
        ...post,
        is_moderated: true,
        is_blurred: true,
      });
      settingsSpy.mockRestore();
      getModerationRecordSpy.mockRestore();
    });

    it('should return not blurred when post is moderated but is_blurred is false', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: 'short',
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const getModerationRecordSpy = vi
        .spyOn(Core.LocalModerationService, 'getModerationRecord')
        .mockResolvedValue({ id: post.id, is_blurred: false, created_at: Date.now() });

      const result = await ModerationApplication.enrichPostWithModeration(post);

      expect(result).toEqual({
        ...post,
        is_moderated: true,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      getModerationRecordSpy.mockRestore();
    });

    it('should return not blurred when blur is disabled globally', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: 'short',
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: false },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const getModerationRecordSpy = vi
        .spyOn(Core.LocalModerationService, 'getModerationRecord')
        .mockResolvedValue({ id: post.id, is_blurred: true, created_at: Date.now() });

      const result = await ModerationApplication.enrichPostWithModeration(post);

      expect(result).toEqual({
        ...post,
        is_moderated: true,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      getModerationRecordSpy.mockRestore();
    });
  });

  describe('enrichPostsWithModeration', () => {
    it('should enrich multiple posts in parallel', async () => {
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

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const getModerationRecordSpy = vi
        .spyOn(Core.LocalModerationService, 'getModerationRecord')
        .mockImplementation(async (id) => {
          if (id === 'author:post1') return { id, is_blurred: true, created_at: Date.now() };
          return null;
        });

      const result = await ModerationApplication.enrichPostsWithModeration(posts);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...posts[0],
        is_moderated: true,
        is_blurred: true,
      });
      expect(result[1]).toEqual({
        ...posts[1],
        is_moderated: false,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      getModerationRecordSpy.mockRestore();
    });

    it('should return empty array for empty input', async () => {
      const result = await ModerationApplication.enrichPostsWithModeration([]);

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

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const getModerationRecordSpy = vi
        .spyOn(Core.LocalModerationService, 'getModerationRecord')
        .mockImplementation(async (id) => {
          if (id === 'author:post1') return { id, is_blurred: false, created_at: Date.now() };
          if (id === 'author:post2') return { id, is_blurred: true, created_at: Date.now() };
          return null;
        });

      const result = await ModerationApplication.enrichPostsWithModeration(posts);

      expect(result[0].is_moderated).toBe(true);
      expect(result[0].is_blurred).toBe(false);

      expect(result[1].is_moderated).toBe(true);
      expect(result[1].is_blurred).toBe(true);

      expect(result[2].is_moderated).toBe(false);
      expect(result[2].is_blurred).toBe(false);

      settingsSpy.mockRestore();
      getModerationRecordSpy.mockRestore();
    });
  });
});
