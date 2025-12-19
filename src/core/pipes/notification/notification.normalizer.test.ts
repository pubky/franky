import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { LastReadResult } from 'pubky-app-specs';
import {
  TEST_PUBKY,
  INVALID_INPUTS,
  setupUnitTestMocks,
  setupIntegrationTestMocks,
  restoreMocks,
  buildPubkyUri,
} from '../pipes.test-utils';

describe('NotificationNormalizer', () => {
  /**
   * Tests for `to` method - Creates LastRead result (same as LastReadNormalizer)
   */
  describe('to', () => {
    const createMockBuilder = (overrides?: Partial<{ createLastRead: ReturnType<typeof vi.fn> }>) => ({
      createLastRead: vi.fn(() => {
        const mockTimestamp = BigInt(Date.now());
        return {
          last_read: {
            timestamp: mockTimestamp,
            toJson: vi.fn(() => ({ timestamp: Number(mockTimestamp) })),
          },
          meta: { url: buildPubkyUri(TEST_PUBKY.USER_1, 'last_read') },
        } as unknown as LastReadResult;
      }),
      ...overrides,
    });

    describe('Unit Tests', () => {
      let mockBuilder: ReturnType<typeof createMockBuilder>;

      beforeEach(() => {
        mockBuilder = createMockBuilder();
        setupUnitTestMocks(mockBuilder);
      });

      afterEach(restoreMocks);

      it('should create last read and log debug message', () => {
        const result = Core.NotificationNormalizer.to(TEST_PUBKY.USER_1);

        expect(result).toHaveProperty('last_read');
        expect(result).toHaveProperty('meta');
        expect(Libs.Logger.debug).toHaveBeenCalledWith('LastRead validated', { result });
      });

      it('should call PubkySpecsSingleton.get with pubky and createLastRead without params', () => {
        Core.NotificationNormalizer.to(TEST_PUBKY.USER_1);

        expect(Core.PubkySpecsSingleton.get).toHaveBeenCalledWith(TEST_PUBKY.USER_1);
        expect(mockBuilder.createLastRead).toHaveBeenCalledWith();
      });

      it.each([
        [
          'createLastRead',
          () =>
            mockBuilder.createLastRead.mockImplementation(() => {
              throw new Error('Builder error');
            }),
        ],
        [
          'PubkySpecsSingleton.get',
          () =>
            vi.spyOn(Core.PubkySpecsSingleton, 'get').mockImplementation(() => {
              throw new Error('Singleton error');
            }),
        ],
      ])('should propagate errors from %s', (_, setupError) => {
        setupError();
        expect(() => Core.NotificationNormalizer.to(TEST_PUBKY.USER_1)).toThrow();
      });
    });

    describe('Integration Tests', () => {
      beforeEach(setupIntegrationTestMocks);
      afterEach(restoreMocks);

      it('should create valid result with correct URL format', () => {
        const result = Core.NotificationNormalizer.to(TEST_PUBKY.USER_1);

        expect(result.last_read).toBeDefined();
        expect(result.meta.url).toMatch(/^pubky:\/\/.+\/pub\/pubky\.app\/last_read$/);
      });

      it('should have BigInt timestamp', () => {
        const result = Core.NotificationNormalizer.to(TEST_PUBKY.USER_1);
        expect(typeof result.last_read.timestamp).toBe('bigint');
      });

      /**
       * Note: createLastRead() takes no parameters, so validation only happens
       * at singleton initialization. Once initialized, invalid pubkys don't throw.
       */
      it.each([
        ['empty', INVALID_INPUTS.EMPTY],
        ['null', INVALID_INPUTS.NULL],
        ['undefined', INVALID_INPUTS.UNDEFINED],
      ])('should not throw for %s pubky (singleton already initialized)', (_, invalidPubky) => {
        Core.NotificationNormalizer.to(TEST_PUBKY.USER_1); // Initialize
        const result = Core.NotificationNormalizer.to(invalidPubky);
        expect(result).toBeDefined();
      });
    });
  });

  /**
   * Tests for `toFlatNotification` method - Transforms NexusNotification to FlatNotification
   */
  describe('toFlatNotification', () => {
    // Sample notification data for different types
    const createNexusNotification = (
      type: Core.NotificationType,
      body: Record<string, unknown>,
      timestamp = 1700000000000,
    ): Core.NexusNotification => ({
      timestamp,
      body: { type, ...body },
    });

    const sampleNotifications = {
      follow: createNexusNotification(Core.NotificationType.Follow, {
        followed_by: TEST_PUBKY.USER_2,
      }),
      newFriend: createNexusNotification(Core.NotificationType.NewFriend, {
        followed_by: TEST_PUBKY.USER_2,
      }),
      lostFriend: createNexusNotification(Core.NotificationType.LostFriend, {
        unfollowed_by: TEST_PUBKY.USER_2,
      }),
      reply: createNexusNotification(Core.NotificationType.Reply, {
        replied_by: TEST_PUBKY.USER_2,
        reply_uri: 'pubky://author/pub/pubky.app/posts/reply123',
      }),
      repost: createNexusNotification(Core.NotificationType.Repost, {
        reposted_by: TEST_PUBKY.USER_2,
        repost_uri: 'pubky://author/pub/pubky.app/posts/repost123',
      }),
      mention: createNexusNotification(Core.NotificationType.Mention, {
        mentioned_by: TEST_PUBKY.USER_2,
        post_uri: 'pubky://author/pub/pubky.app/posts/mention123',
      }),
      tagPost: createNexusNotification(Core.NotificationType.TagPost, {
        tagged_by: TEST_PUBKY.USER_2,
        post_uri: 'pubky://author/pub/pubky.app/posts/tagged123',
      }),
      tagProfile: createNexusNotification(Core.NotificationType.TagProfile, {
        tagged_by: TEST_PUBKY.USER_2,
        tag_label: 'developer',
      }),
    };

    describe('transformation', () => {
      it('should transform NexusNotification to FlatNotification', () => {
        const result = Core.NotificationNormalizer.toFlatNotification(sampleNotifications.follow);

        expect(result).toHaveProperty('timestamp', sampleNotifications.follow.timestamp);
        expect(result).toHaveProperty('type', Core.NotificationType.Follow);
      });

      it('should spread body properties into flat structure', () => {
        const result = Core.NotificationNormalizer.toFlatNotification(sampleNotifications.reply);

        expect(result.type).toBe(Core.NotificationType.Reply);
        expect(result).toHaveProperty('replied_by', TEST_PUBKY.USER_2);
        expect(result).toHaveProperty('reply_uri');
      });

      it.each([
        ['Follow', sampleNotifications.follow, Core.NotificationType.Follow],
        ['NewFriend', sampleNotifications.newFriend, Core.NotificationType.NewFriend],
        ['LostFriend', sampleNotifications.lostFriend, Core.NotificationType.LostFriend],
        ['Reply', sampleNotifications.reply, Core.NotificationType.Reply],
        ['Repost', sampleNotifications.repost, Core.NotificationType.Repost],
        ['Mention', sampleNotifications.mention, Core.NotificationType.Mention],
        ['TagPost', sampleNotifications.tagPost, Core.NotificationType.TagPost],
        ['TagProfile', sampleNotifications.tagProfile, Core.NotificationType.TagProfile],
      ])('should handle %s notification type', (_, notification, expectedType) => {
        const result = Core.NotificationNormalizer.toFlatNotification(notification);

        expect(result.type).toBe(expectedType);
        expect(result.timestamp).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('should handle notification with minimal body', () => {
        const minimalNotification: Core.NexusNotification = {
          timestamp: 1700000000000,
          body: { type: Core.NotificationType.Follow, followed_by: TEST_PUBKY.USER_2 },
        };

        const result = Core.NotificationNormalizer.toFlatNotification(minimalNotification);

        expect(result.timestamp).toBe(1700000000000);
        expect(result.type).toBe(Core.NotificationType.Follow);
      });

      it('should preserve all body properties in flat notification', () => {
        const notificationWithExtra: Core.NexusNotification = {
          timestamp: 1700000000000,
          body: {
            type: Core.NotificationType.Reply,
            replied_by: TEST_PUBKY.USER_2,
            reply_uri: 'pubky://uri',
            extra_field: 'extra_value',
          },
        };

        const result = Core.NotificationNormalizer.toFlatNotification(notificationWithExtra);

        expect(result).toHaveProperty('extra_field', 'extra_value');
      });
    });
  });
});
