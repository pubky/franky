import { describe, it, expect } from 'vitest';
import { NotificationModel } from './notification';
import { NotificationType, FlatNotification } from './notification.types';

describe('NotificationModel', () => {
  it('should save an array of notifications to IndexedDB', async () => {
    const notifications: FlatNotification[] = [
      { type: NotificationType.Follow, timestamp: Date.now(), followed_by: 'user1' } as FlatNotification,
      {
        type: NotificationType.Reply,
        timestamp: Date.now() + 1000,
        replied_by: 'user2',
        parent_post_uri: 'post123',
        reply_uri: 'reply456',
      } as FlatNotification,
      {
        type: NotificationType.TagPost,
        timestamp: Date.now() + 2000,
        tagged_by: 'user3',
        tag_label: 'awesome',
        post_uri: 'post789',
      } as FlatNotification,
    ];

    await NotificationModel.bulkSave(notifications);

    const saved = await NotificationModel.table.toArray();
    expect(saved).toHaveLength(3);
    expect(saved.map((n) => n.type)).toEqual([
      NotificationType.Follow,
      NotificationType.Reply,
      NotificationType.TagPost,
    ]);
  });

  it('should create individual notification instances', async () => {
    const data: FlatNotification = {
      type: NotificationType.Mention,
      timestamp: Date.now(),
      mentioned_by: 'user4',
      post_uri: 'post999',
    } as FlatNotification;

    const notification = new NotificationModel(data);

    expect(notification.type).toBe(NotificationType.Mention);
    expect(notification.mentioned_by).toBe('user4');
    expect(notification.post_uri).toBe('post999');
  });

  it('should get recent notifications ordered by timestamp', async () => {
    const baseTime = Date.now();
    const notifications: FlatNotification[] = [
      { type: NotificationType.Follow, timestamp: baseTime - 2000, followed_by: 'user1' } as FlatNotification,
      {
        type: NotificationType.Reply,
        timestamp: baseTime - 1000,
        replied_by: 'user2',
        parent_post_uri: 'post123',
        reply_uri: 'reply456',
      } as FlatNotification,
      {
        type: NotificationType.TagPost,
        timestamp: baseTime,
        tagged_by: 'user3',
        tag_label: 'awesome',
        post_uri: 'post789',
      } as FlatNotification,
    ];

    await NotificationModel.bulkSave(notifications);

    const recent = await NotificationModel.getRecent(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].type).toBe(NotificationType.TagPost);
    expect(recent[1].type).toBe(NotificationType.Reply);
  });

  it('should get notifications by type', async () => {
    const notifications: FlatNotification[] = [
      { type: NotificationType.Follow, timestamp: Date.now(), followed_by: 'user1' } as FlatNotification,
      {
        type: NotificationType.Reply,
        timestamp: Date.now(),
        replied_by: 'user2',
        parent_post_uri: 'post123',
        reply_uri: 'reply456',
      } as FlatNotification,
      { type: NotificationType.Follow, timestamp: Date.now(), followed_by: 'user3' } as FlatNotification,
    ];

    await NotificationModel.bulkSave(notifications);

    const follows = await NotificationModel.getByType(NotificationType.Follow);
    expect(follows).toHaveLength(2);
    expect(follows.every((n) => n.type === NotificationType.Follow)).toBe(true);

    const replies = await NotificationModel.getByType(NotificationType.Reply);
    expect(replies).toHaveLength(1);
    expect(replies[0].type).toBe(NotificationType.Reply);
  });

  it('should get recent notifications by type', async () => {
    const baseTime = Date.now();
    const notifications: FlatNotification[] = [
      { type: NotificationType.Follow, timestamp: baseTime - 3000, followed_by: 'user1' } as FlatNotification,
      { type: NotificationType.Follow, timestamp: baseTime - 1000, followed_by: 'user2' } as FlatNotification,
      { type: NotificationType.Follow, timestamp: baseTime, followed_by: 'user3' } as FlatNotification,
      {
        type: NotificationType.Reply,
        timestamp: baseTime - 2000,
        replied_by: 'user4',
        parent_post_uri: 'post123',
        reply_uri: 'reply456',
      } as FlatNotification,
    ];

    await NotificationModel.bulkSave(notifications);

    const recentFollows = await NotificationModel.getRecentByType(NotificationType.Follow, 2);
    expect(recentFollows).toHaveLength(2);
    expect((recentFollows[0] as FlatNotification & { followed_by: string }).followed_by).toBe('user3');
    expect((recentFollows[1] as FlatNotification & { followed_by: string }).followed_by).toBe('user2');
    expect(recentFollows.every((n) => n.type === NotificationType.Follow)).toBe(true);
  });
});
