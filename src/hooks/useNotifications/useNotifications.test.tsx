import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { NotificationType } from '@/core';
import * as Core from '@/core';

// Mock dexie-react-hooks
let mockDbNotifications: Core.FlatNotification[] = [];
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => {
    // Return the mock notifications
    return mockDbNotifications;
  }),
}));

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
    isAppError: vi.fn(() => false),
    Logger: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    },
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

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    NotificationController: {
      getOrFetchNotifications: vi.fn(() =>
        Promise.resolve({
          notifications: [],
          olderThan: undefined,
        }),
      ),
      markAllAsRead: vi.fn(),
      getAllFromCache: vi.fn(() => Promise.resolve(mockDbNotifications)),
    },
    useNotificationStore: vi.fn((selector) => {
      const state = { lastRead: 0, setLastRead: vi.fn() };
      return selector ? selector(state) : state;
    }),
  };
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbNotifications = [];
  });

  it('should return empty notifications array after loading', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should return empty unread notifications array after loading', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unreadNotifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should start with isLoading as true when db returns undefined', () => {
    // Set mock to return undefined (still loading from db)
    mockDbNotifications = undefined as unknown as Core.FlatNotification[];

    const { result } = renderHook(() => useNotifications());

    // Loading when db returns undefined
    expect(result.current.isLoading).toBe(true);
  });

  it('should return isLoading as false when db returns data', async () => {
    mockDbNotifications = [];

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return markAllAsRead function', async () => {
    mockDbNotifications = [];

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.markAllAsRead).toBeDefined();
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should call markAllAsRead without errors', async () => {
    mockDbNotifications = [];

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(() => result.current.markAllAsRead()).not.toThrow();
  });

  it('should return consistent counts', async () => {
    mockDbNotifications = [];

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(result.current.notifications.length);
    expect(result.current.unreadCount).toBe(result.current.unreadNotifications.length);
  });

  it('should return isNotificationUnread function', async () => {
    mockDbNotifications = [];

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isNotificationUnread).toBeDefined();
    expect(typeof result.current.isNotificationUnread).toBe('function');
  });

  it('should return loadMore and refresh functions', async () => {
    mockDbNotifications = [];

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.loadMore).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should return notifications from database', async () => {
    const mockNotifications = [
      { type: NotificationType.Follow, timestamp: Date.now(), followed_by: 'user1' },
    ] as Core.FlatNotification[];

    mockDbNotifications = mockNotifications;

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.count).toBe(1);
  });

  it('should deduplicate notifications with same key', async () => {
    const timestamp = Date.now();
    const mockNotifications = [
      { type: NotificationType.Follow, timestamp, followed_by: 'user1' },
      { type: NotificationType.Follow, timestamp, followed_by: 'user1' }, // duplicate
      { type: NotificationType.Follow, timestamp, followed_by: 'user2' }, // different user
    ] as Core.FlatNotification[];

    mockDbNotifications = mockNotifications;

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have 2 unique notifications (user1 and user2)
    expect(result.current.notifications).toHaveLength(2);
  });

  it('should call loadMore and fetch more notifications', async () => {
    mockDbNotifications = [
      { type: NotificationType.Follow, timestamp: 3000, followed_by: 'user1' },
    ] as Core.FlatNotification[];

    vi.mocked(Core.NotificationController.getOrFetchNotifications).mockResolvedValueOnce({
      notifications: [],
      olderThan: undefined,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(Core.NotificationController.getOrFetchNotifications).toHaveBeenCalled();
  });
});
