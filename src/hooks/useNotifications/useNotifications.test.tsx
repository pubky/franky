import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { NotificationType } from '@/core';
import * as Core from '@/core';

// Hoist mock data
const { mockDbNotifications, setMockDbNotifications, mockCurrentUserPubky, setMockCurrentUserPubky } = vi.hoisted(
  () => {
    const notifications = { current: [] as Core.FlatNotification[] };
    const pubky = { current: 'test-user-pubky' as string | null };
    return {
      mockDbNotifications: notifications,
      setMockDbNotifications: (value: Core.FlatNotification[]) => {
        notifications.current = value;
      },
      mockCurrentUserPubky: pubky,
      setMockCurrentUserPubky: (value: string | null) => {
        pubky.current = value;
      },
    };
  },
);

// Mock dexie-react-hooks - execute the query function to trigger side effects
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn) => {
    if (!mockCurrentUserPubky.current) return undefined;
    // Execute the async query function to trigger side effects like setInitialLoadDone
    if (queryFn) {
      queryFn();
    }
    return mockDbNotifications.current;
  }),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    },
  };
});

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    NotificationModel: {
      getAll: vi.fn(() => Promise.resolve(mockDbNotifications.current)),
      bulkSave: vi.fn(() => Promise.resolve()),
    },
    NexusUserService: {
      notifications: vi.fn(() => Promise.resolve([])),
    },
    NotificationNormalizer: {
      toFlatNotification: vi.fn((n) => n),
    },
    NotificationController: {
      markAllAsRead: vi.fn(),
    },
    useAuthStore: vi.fn(() => ({
      currentUserPubky: mockCurrentUserPubky.current,
    })),
    useNotificationStore: vi.fn((selector) => {
      const state = { lastRead: 0, setLastRead: vi.fn() };
      return selector ? selector(state) : state;
    }),
  };
});

// Mock config
vi.mock('@/config', () => ({
  NEXUS_NOTIFICATIONS_LIMIT: 30,
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockDbNotifications([]);
    setMockCurrentUserPubky('test-user-pubky');
  });

  it('should return empty notifications array when no data', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should return empty unread notifications array when no data', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unreadNotifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should start with isLoading as true', () => {
    // Set mock to simulate not logged in (no currentUserPubky)
    setMockCurrentUserPubky(null);

    const { result } = renderHook(() => useNotifications());

    // Loading when not authenticated
    expect(result.current.isLoading).toBe(true);
  });

  it('should return isLoading as false when data is available', async () => {
    setMockDbNotifications([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return markAllAsRead function', async () => {
    setMockDbNotifications([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.markAllAsRead).toBeDefined();
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should call markAllAsRead without errors', async () => {
    setMockDbNotifications([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(() => result.current.markAllAsRead()).not.toThrow();
    expect(Core.NotificationController.markAllAsRead).toHaveBeenCalled();
  });

  it('should return consistent counts', async () => {
    setMockDbNotifications([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(result.current.notifications.length);
    expect(result.current.unreadCount).toBe(result.current.unreadNotifications.length);
  });

  it('should return isNotificationUnread function', async () => {
    setMockDbNotifications([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isNotificationUnread).toBeDefined();
    expect(typeof result.current.isNotificationUnread).toBe('function');
  });

  it('should return loadMore and refresh functions', async () => {
    setMockDbNotifications([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.loadMore).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should return notifications from database', async () => {
    const mockNotifications = [
      { id: 'test-1', type: NotificationType.Follow, timestamp: Date.now(), followed_by: 'user1' },
    ] as Core.FlatNotification[];

    setMockDbNotifications(mockNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.count).toBe(1);
  });

  it('should sort notifications by timestamp (newest first)', async () => {
    const now = Date.now();
    const mockNotifications = [
      { id: 'test-1', type: NotificationType.Follow, timestamp: now - 1000, followed_by: 'user1' },
      { id: 'test-2', type: NotificationType.Follow, timestamp: now, followed_by: 'user2' },
      { id: 'test-3', type: NotificationType.Follow, timestamp: now - 2000, followed_by: 'user3' },
    ] as Core.FlatNotification[];

    setMockDbNotifications(mockNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should be sorted newest first
    expect(result.current.notifications[0].followed_by).toBe('user2');
    expect(result.current.notifications[1].followed_by).toBe('user1');
    expect(result.current.notifications[2].followed_by).toBe('user3');
  });

  it('should call loadMore and fetch from Nexus', async () => {
    setMockDbNotifications([]);

    vi.mocked(Core.NexusUserService.notifications).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(Core.NexusUserService.notifications).toHaveBeenCalled();
  });
});
