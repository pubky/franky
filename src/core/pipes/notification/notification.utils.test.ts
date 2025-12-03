import { describe, it, expect } from 'vitest';
import * as Core from '@/core';
import { getNotificationKey } from './notification.utils';
import { TEST_PUBKY, TEST_POST_IDS, buildPubkyUri } from '../pipes.test-utils';

describe('getNotificationKey', () => {
  const TIMESTAMP = 1700000000000;

  // Factory functions for creating test notifications
  const createFollowNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.Follow,
      timestamp: TIMESTAMP,
      followed_by: TEST_PUBKY.USER_2,
      ...overrides,
    }) as Core.FlatNotification;

  const createNewFriendNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.NewFriend,
      timestamp: TIMESTAMP,
      followed_by: TEST_PUBKY.USER_2,
      ...overrides,
    }) as Core.FlatNotification;

  const createLostFriendNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.LostFriend,
      timestamp: TIMESTAMP,
      unfollowed_by: TEST_PUBKY.USER_2,
      ...overrides,
    }) as Core.FlatNotification;

  const createTagPostNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.TagPost,
      timestamp: TIMESTAMP,
      tagged_by: TEST_PUBKY.USER_2,
      tag_label: 'technology',
      post_uri: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${TEST_POST_IDS.POST_1}`),
      ...overrides,
    }) as Core.FlatNotification;

  const createTagProfileNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.TagProfile,
      timestamp: TIMESTAMP,
      tagged_by: TEST_PUBKY.USER_2,
      tag_label: 'developer',
      ...overrides,
    }) as Core.FlatNotification;

  const createReplyNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.Reply,
      timestamp: TIMESTAMP,
      replied_by: TEST_PUBKY.USER_2,
      parent_post_uri: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${TEST_POST_IDS.POST_1}`),
      reply_uri: buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_2}`),
      ...overrides,
    }) as Core.FlatNotification;

  const createRepostNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.Repost,
      timestamp: TIMESTAMP,
      reposted_by: TEST_PUBKY.USER_2,
      embed_uri: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${TEST_POST_IDS.POST_1}`),
      repost_uri: buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_2}`),
      ...overrides,
    }) as Core.FlatNotification;

  const createMentionNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.Mention,
      timestamp: TIMESTAMP,
      mentioned_by: TEST_PUBKY.USER_2,
      post_uri: buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`),
      ...overrides,
    }) as Core.FlatNotification;

  const createPostDeletedNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.PostDeleted,
      timestamp: TIMESTAMP,
      delete_source: Core.PostChangedSource.Reply,
      deleted_by: TEST_PUBKY.USER_2,
      deleted_uri: buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`),
      linked_uri: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${TEST_POST_IDS.POST_2}`),
      ...overrides,
    }) as Core.FlatNotification;

  const createPostEditedNotification = (overrides?: Partial<Core.FlatNotification>): Core.FlatNotification =>
    ({
      id: 'temp-id',
      type: Core.NotificationType.PostEdited,
      timestamp: TIMESTAMP,
      edit_source: Core.PostChangedSource.Reply,
      edited_by: TEST_PUBKY.USER_2,
      edited_uri: buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`),
      linked_uri: buildPubkyUri(TEST_PUBKY.USER_1, `posts/${TEST_POST_IDS.POST_2}`),
      ...overrides,
    }) as Core.FlatNotification;

  describe('key format', () => {
    it('should generate key with type:timestamp:actor format for Follow', () => {
      const notification = createFollowNotification();
      const key = getNotificationKey(notification);

      expect(key).toBe(`${Core.NotificationType.Follow}:${TIMESTAMP}:${TEST_PUBKY.USER_2}`);
    });

    it('should generate key with type:timestamp:actor format for NewFriend', () => {
      const notification = createNewFriendNotification();
      const key = getNotificationKey(notification);

      expect(key).toBe(`${Core.NotificationType.NewFriend}:${TIMESTAMP}:${TEST_PUBKY.USER_2}`);
    });

    it('should generate key with type:timestamp:actor format for LostFriend', () => {
      const notification = createLostFriendNotification();
      const key = getNotificationKey(notification);

      expect(key).toBe(`${Core.NotificationType.LostFriend}:${TIMESTAMP}:${TEST_PUBKY.USER_2}`);
    });
  });

  describe('notification type handling', () => {
    it.each([
      ['Follow', createFollowNotification, `follow:${TIMESTAMP}:${TEST_PUBKY.USER_2}`],
      ['NewFriend', createNewFriendNotification, `new_friend:${TIMESTAMP}:${TEST_PUBKY.USER_2}`],
      ['LostFriend', createLostFriendNotification, `lost_friend:${TIMESTAMP}:${TEST_PUBKY.USER_2}`],
    ])('should handle %s notification', (_, createNotification, expectedKey) => {
      const notification = createNotification();
      expect(getNotificationKey(notification)).toBe(expectedKey);
    });

    it('should include tagged_by and post_uri for TagPost', () => {
      const notification = createTagPostNotification();
      const key = getNotificationKey(notification);

      expect(key).toContain(Core.NotificationType.TagPost);
      expect(key).toContain(TEST_PUBKY.USER_2);
      expect(key).toContain('posts/');
    });

    it('should include tagged_by and tag_label for TagProfile', () => {
      const notification = createTagProfileNotification();
      const key = getNotificationKey(notification);

      expect(key).toBe(`${Core.NotificationType.TagProfile}:${TIMESTAMP}:${TEST_PUBKY.USER_2}:developer`);
    });

    it('should include replied_by and reply_uri for Reply', () => {
      const notification = createReplyNotification();
      const key = getNotificationKey(notification);

      expect(key).toContain(Core.NotificationType.Reply);
      expect(key).toContain(TEST_PUBKY.USER_2);
      expect(key).toContain(TEST_POST_IDS.POST_2);
    });

    it('should include reposted_by and repost_uri for Repost', () => {
      const notification = createRepostNotification();
      const key = getNotificationKey(notification);

      expect(key).toContain(Core.NotificationType.Repost);
      expect(key).toContain(TEST_PUBKY.USER_2);
      expect(key).toContain(TEST_POST_IDS.POST_2);
    });

    it('should include mentioned_by and post_uri for Mention', () => {
      const notification = createMentionNotification();
      const key = getNotificationKey(notification);

      expect(key).toContain(Core.NotificationType.Mention);
      expect(key).toContain(TEST_PUBKY.USER_2);
    });

    it('should include deleted_by and deleted_uri for PostDeleted', () => {
      const notification = createPostDeletedNotification();
      const key = getNotificationKey(notification);

      expect(key).toContain(Core.NotificationType.PostDeleted);
      expect(key).toContain(TEST_PUBKY.USER_2);
      expect(key).toContain(TEST_POST_IDS.POST_1);
    });

    it('should include edited_by and edited_uri for PostEdited', () => {
      const notification = createPostEditedNotification();
      const key = getNotificationKey(notification);

      expect(key).toContain(Core.NotificationType.PostEdited);
      expect(key).toContain(TEST_PUBKY.USER_2);
      expect(key).toContain(TEST_POST_IDS.POST_1);
    });
  });

  describe('uniqueness', () => {
    it('should generate unique keys for different notification types with same timestamp', () => {
      const notifications = [
        createFollowNotification(),
        createNewFriendNotification(),
        createReplyNotification(),
        createRepostNotification(),
        createMentionNotification(),
        createTagPostNotification(),
        createTagProfileNotification(),
        createPostDeletedNotification(),
        createPostEditedNotification(),
      ];

      const keys = notifications.map(getNotificationKey);
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(notifications.length);
    });

    it('should generate unique keys for same type with different actors', () => {
      const notification1 = createFollowNotification({
        followed_by: TEST_PUBKY.USER_1,
      } as Partial<Core.FlatNotification>);
      const notification2 = createFollowNotification({
        followed_by: TEST_PUBKY.USER_2,
      } as Partial<Core.FlatNotification>);

      const key1 = getNotificationKey(notification1);
      const key2 = getNotificationKey(notification2);

      expect(key1).not.toBe(key2);
    });

    it('should generate unique keys for same type with different timestamps', () => {
      const notification1 = createFollowNotification({ timestamp: 1700000000000 } as Partial<Core.FlatNotification>);
      const notification2 = createFollowNotification({ timestamp: 1700000001000 } as Partial<Core.FlatNotification>);

      const key1 = getNotificationKey(notification1);
      const key2 = getNotificationKey(notification2);

      expect(key1).not.toBe(key2);
    });

    it('should generate identical keys for identical notifications', () => {
      const notification1 = createFollowNotification();
      const notification2 = createFollowNotification();

      expect(getNotificationKey(notification1)).toBe(getNotificationKey(notification2));
    });
  });

  describe('TagPost vs TagProfile differentiation', () => {
    it('should generate different keys for TagPost and TagProfile from same tagger', () => {
      const tagPost = createTagPostNotification({
        tagged_by: TEST_PUBKY.USER_2,
        tag_label: 'tech',
      } as Partial<Core.FlatNotification>);

      const tagProfile = createTagProfileNotification({
        tagged_by: TEST_PUBKY.USER_2,
        tag_label: 'tech',
      } as Partial<Core.FlatNotification>);

      const keyPost = getNotificationKey(tagPost);
      const keyProfile = getNotificationKey(tagProfile);

      expect(keyPost).not.toBe(keyProfile);
      expect(keyPost).toContain('tag_post');
      expect(keyProfile).toContain('tag_profile');
    });
  });

  describe('PostDeleted vs PostEdited differentiation', () => {
    it('should generate different keys for PostDeleted and PostEdited for same URI', () => {
      const uri = buildPubkyUri(TEST_PUBKY.USER_2, `posts/${TEST_POST_IDS.POST_1}`);

      const deleted = createPostDeletedNotification({
        deleted_uri: uri,
      } as Partial<Core.FlatNotification>);

      const edited = createPostEditedNotification({
        edited_uri: uri,
      } as Partial<Core.FlatNotification>);

      const keyDeleted = getNotificationKey(deleted);
      const keyEdited = getNotificationKey(edited);

      expect(keyDeleted).not.toBe(keyEdited);
      expect(keyDeleted).toContain('post_deleted');
      expect(keyEdited).toContain('post_edited');
    });
  });

  describe('default case', () => {
    it('should return base key (type:timestamp) for unknown notification types', () => {
      const unknownNotification = {
        id: 'temp-id',
        type: 'unknown_type' as Core.NotificationType,
        timestamp: TIMESTAMP,
      } as Core.FlatNotification;

      const key = getNotificationKey(unknownNotification);

      expect(key).toBe(`unknown_type:${TIMESTAMP}`);
    });
  });

  describe('edge cases', () => {
    it('should handle zero timestamp', () => {
      const notification = createFollowNotification({ timestamp: 0 } as Partial<Core.FlatNotification>);
      const key = getNotificationKey(notification);

      expect(key).toBe(`follow:0:${TEST_PUBKY.USER_2}`);
    });

    it('should handle very large timestamp', () => {
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      const notification = createFollowNotification({ timestamp: largeTimestamp } as Partial<Core.FlatNotification>);
      const key = getNotificationKey(notification);

      expect(key).toBe(`follow:${largeTimestamp}:${TEST_PUBKY.USER_2}`);
    });

    it('should handle empty string tag_label for TagProfile', () => {
      const notification = createTagProfileNotification({ tag_label: '' } as Partial<Core.FlatNotification>);
      const key = getNotificationKey(notification);

      expect(key).toBe(`tag_profile:${TIMESTAMP}:${TEST_PUBKY.USER_2}:`);
    });
  });
});
