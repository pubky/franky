import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications, getNotificationUserData, getNotificationDisplayData } from './useNotifications';
import { NotificationType } from '@/core';

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    formatNotificationTime: vi.fn((timestamp: number) => {
      const diffMs = Date.now() - timestamp;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      return '1h';
    }),
  };
});

// Mock NotificationItem utils
vi.mock('@/components/molecules/NotificationItem/NotificationItem.utils', () => ({
  getNotificationText: vi.fn((notification, userName) => `${userName} did something`),
  getUserIdFromNotification: vi.fn((notification) => {
    if ('followed_by' in notification) return notification.followed_by;
    if ('replied_by' in notification) return notification.replied_by;
    return '';
  }),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty notifications array', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should return empty unread notifications array', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.unreadNotifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should return isLoading as false', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.isLoading).toBe(false);
  });

  it('should return markAllAsRead function', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.markAllAsRead).toBeDefined();
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should call markAllAsRead without errors', () => {
    const { result } = renderHook(() => useNotifications());

    expect(() => result.current.markAllAsRead()).not.toThrow();
  });

  it('should return consistent counts', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.count).toBe(result.current.notifications.length);
    expect(result.current.unreadCount).toBe(result.current.unreadNotifications.length);
  });
});

describe('getNotificationUserData', () => {
  it('should return null for any userId', () => {
    expect(getNotificationUserData('user1')).toBeNull();
    expect(getNotificationUserData('user2')).toBeNull();
    expect(getNotificationUserData('')).toBeNull();
  });
});

describe('getNotificationDisplayData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return display data with default userName when userData is null', () => {
    const notification = {
      type: NotificationType.Follow,
      timestamp: Date.now() - 1000 * 60 * 30,
      followed_by: 'user1',
    };

    const result = getNotificationDisplayData(notification);

    expect(result.userName).toBe('User');
    expect(result.avatarUrl).toBeUndefined();
    expect(result.notificationText).toBe('User did something');
    expect(result.timestamp).toBeDefined();
  });

  it('should return display data with formatted timestamp', () => {
    const notification = {
      type: NotificationType.Follow,
      timestamp: Date.now() - 1000 * 60 * 30,
      followed_by: 'user1',
    };

    const result = getNotificationDisplayData(notification);

    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
  });

  it('should handle different notification types', () => {
    const followNotification = {
      type: NotificationType.Follow,
      timestamp: Date.now(),
      followed_by: 'user1',
    };

    const replyNotification = {
      type: NotificationType.Reply,
      timestamp: Date.now(),
      replied_by: 'user2',
      parent_post_uri: 'user1:post123',
      reply_uri: 'user2:reply456',
    };

    const followResult = getNotificationDisplayData(followNotification);
    const replyResult = getNotificationDisplayData(replyNotification);

    expect(followResult).toHaveProperty('userName');
    expect(followResult).toHaveProperty('notificationText');
    expect(followResult).toHaveProperty('timestamp');

    expect(replyResult).toHaveProperty('userName');
    expect(replyResult).toHaveProperty('notificationText');
    expect(replyResult).toHaveProperty('timestamp');
  });

  it('should return all required properties', () => {
    const notification = {
      type: NotificationType.Follow,
      timestamp: Date.now(),
      followed_by: 'user1',
    };

    const result = getNotificationDisplayData(notification);

    expect(result).toHaveProperty('userName');
    expect(result).toHaveProperty('avatarUrl');
    expect(result).toHaveProperty('notificationText');
    expect(result).toHaveProperty('timestamp');
  });
});
