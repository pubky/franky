import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationApplication } from './moderation';
import * as Core from '@/core';
import * as Config from '@/config';
import { PubkyAppPostKind } from 'pubky-app-specs';

vi.mock('@/core/services/local/moderation', () => ({
  LocalModerationService: {
    setBlur: vi.fn(),
    isBlurred: vi.fn(),
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

  describe('getModerationState', () => {
    beforeEach(async () => {
      await Core.db.initialize();
      await Core.db.transaction('rw', [Core.PostTagsModel.table], async () => {
        await Core.PostTagsModel.table.clear();
      });
    });

    it('should return not blurred when post is not moderated', async () => {
      const postId = 'author:post1';
      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockResolvedValue(true);

      const result = await ModerationApplication.getModerationState(postId);

      expect(result).toEqual({
        is_moderated: false,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });

    it('should return blurred when post is moderated and user has not unblurred', async () => {
      const postId = 'author:post1';
      const tagCollection: Core.TagCollectionModelSchema<string> = {
        id: postId,
        tags: [
          {
            label: Config.MODERATED_TAGS[0],
            taggers: [Config.MODERATION_ID],
          },
        ],
      };

      await Core.PostTagsModel.upsert(tagCollection);

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockResolvedValue(true);

      const result = await ModerationApplication.getModerationState(postId);

      expect(result).toEqual({
        is_moderated: true,
        is_blurred: true,
      });
      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });

    it('should return not blurred when post is moderated but user unblurred it', async () => {
      const postId = 'author:post1';
      const tagCollection: Core.TagCollectionModelSchema<string> = {
        id: postId,
        tags: [
          {
            label: Config.MODERATED_TAGS[0],
            taggers: [Config.MODERATION_ID],
          },
        ],
      };

      await Core.PostTagsModel.upsert(tagCollection);

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockResolvedValue(false);

      const result = await ModerationApplication.getModerationState(postId);

      expect(result).toEqual({
        is_moderated: true,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });

    it('should return not blurred when blur is disabled globally', async () => {
      const postId = 'author:post1';
      const tagCollection: Core.TagCollectionModelSchema<string> = {
        id: postId,
        tags: [
          {
            label: Config.MODERATED_TAGS[0],
            taggers: [Config.MODERATION_ID],
          },
        ],
      };

      await Core.PostTagsModel.upsert(tagCollection);

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: false },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockResolvedValue(true);

      const result = await ModerationApplication.getModerationState(postId);

      expect(result).toEqual({
        is_moderated: true,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });
  });

  describe('enrichPostWithModeration', () => {
    beforeEach(async () => {
      await Core.db.initialize();
      await Core.db.transaction('rw', [Core.PostTagsModel.table], async () => {
        await Core.PostTagsModel.table.clear();
      });
    });

    it('should enrich post with moderation state', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: PubkyAppPostKind.Short,
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const tagCollection: Core.TagCollectionModelSchema<string> = {
        id: post.id,
        tags: [
          {
            label: Config.MODERATED_TAGS[0],
            taggers: [Config.MODERATION_ID],
          },
        ],
      };

      await Core.PostTagsModel.upsert(tagCollection);

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockResolvedValue(true);

      const result = await ModerationApplication.enrichPostWithModeration(post);

      expect(result).toEqual({
        ...post,
        is_moderated: true,
        is_blurred: true,
      });
      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });

    it('should handle post without moderation', async () => {
      const post: Core.PostDetailsModelSchema = {
        id: 'author:post1',
        content: 'Test content',
        kind: PubkyAppPostKind.Short,
        indexed_at: 123456,
        uri: 'pubky://author/pub/pubky.app/posts/post1',
        attachments: [],
      };

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockResolvedValue(true);

      const result = await ModerationApplication.enrichPostWithModeration(post);

      expect(result).toEqual({
        ...post,
        is_moderated: false,
        is_blurred: false,
      });
      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });
  });

  describe('enrichPostsWithModeration', () => {
    beforeEach(async () => {
      await Core.db.initialize();
      await Core.db.transaction('rw', [Core.PostTagsModel.table], async () => {
        await Core.PostTagsModel.table.clear();
      });
    });

    it('should enrich multiple posts in parallel', async () => {
      const posts: Core.PostDetailsModelSchema[] = [
        {
          id: 'author:post1',
          content: 'Content 1',
          kind: PubkyAppPostKind.Short,
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
        {
          id: 'author:post2',
          content: 'Content 2',
          kind: PubkyAppPostKind.Short,
          indexed_at: 123457,
          uri: 'pubky://author/pub/pubky.app/posts/post2',
          attachments: [],
        },
      ];

      const tagCollection1: Core.TagCollectionModelSchema<string> = {
        id: 'author:post1',
        tags: [
          {
            label: Config.MODERATED_TAGS[0],
            taggers: [Config.MODERATION_ID],
          },
        ],
      };

      await Core.PostTagsModel.upsert(tagCollection1);

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockImplementation(async (id) => {
        if (id === 'author:post1') return true;
        return false;
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
      isBlurredSpy.mockRestore();
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
          kind: PubkyAppPostKind.Short,
          indexed_at: 123456,
          uri: 'pubky://author/pub/pubky.app/posts/post1',
          attachments: [],
        },
        {
          id: 'author:post2',
          content: 'Moderated and blurred',
          kind: PubkyAppPostKind.Short,
          indexed_at: 123457,
          uri: 'pubky://author/pub/pubky.app/posts/post2',
          attachments: [],
        },
        {
          id: 'author:post3',
          content: 'Not moderated',
          kind: PubkyAppPostKind.Short,
          indexed_at: 123458,
          uri: 'pubky://author/pub/pubky.app/posts/post3',
          attachments: [],
        },
      ];

      const moderatedTag = {
        label: Config.MODERATED_TAGS[0],
        taggers: [Config.MODERATION_ID],
      };

      await Core.PostTagsModel.upsert({ id: 'author:post1', tags: [moderatedTag] });
      await Core.PostTagsModel.upsert({ id: 'author:post2', tags: [moderatedTag] });

      const settingsSpy = vi.spyOn(Core.useSettingsStore, 'getState').mockReturnValue({
        privacy: { blurCensored: true },
      } as Partial<Core.SettingsStore> as Core.SettingsStore);
      const isBlurredSpy = vi.spyOn(Core.LocalModerationService, 'isBlurred').mockImplementation(async (id) => {
        if (id === 'author:post1') return false;
        if (id === 'author:post2') return true;
        return true;
      });

      const result = await ModerationApplication.enrichPostsWithModeration(posts);

      expect(result[0].is_moderated).toBe(true);
      expect(result[0].is_blurred).toBe(false);

      expect(result[1].is_moderated).toBe(true);
      expect(result[1].is_blurred).toBe(true);

      expect(result[2].is_moderated).toBe(false);
      expect(result[2].is_blurred).toBe(false);

      settingsSpy.mockRestore();
      isBlurredSpy.mockRestore();
    });
  });
});
