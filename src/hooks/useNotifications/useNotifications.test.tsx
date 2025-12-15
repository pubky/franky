import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { NotificationType } from '@/core';
import * as Core from '@/core';

// Hoist mock data
const { mockCurrentUserPubky, setMockCurrentUserPubky } = vi.hoisted(() => {
  const pubky = { current: 'test-user-pubky' as string | null };
  return {
    mockCurrentUserPubky: pubky,
    setMockCurrentUserPubky: (value: string | null) => {
      pubky.current = value;
    },
  };
});

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
    NotificationController: {
      getOrFetchNotifications: vi.fn(() =>
        Promise.resolve({
          flatNotifications: [],
          olderThan: undefined,
        }),
      ),
      markAllAsRead: vi.fn(),
    },
    useAuthStore: vi.fn(() => ({
      currentUserPubky: mockCurrentUserPubky.current,
    })),
    useNotificationStore: vi.fn((selector) => {
      const state = { lastRead: 0, setLastRead: vi.fn() };
      return selector ? selector(state) : state.lastRead;
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

  it('should not fetch when no user is authenticated', async () => {
    setMockCurrentUserPubky(null);

    const { result } = renderHook(() => useNotifications());

    // Should not be loading since there's no user
    expect(result.current.isLoading).toBe(false);
    expect(Core.NotificationController.getOrFetchNotifications).not.toHaveBeenCalled();
  });

  it('should return isLoading as false when data is available', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return markAllAsRead function', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.markAllAsRead).toBeDefined();
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should call markAllAsRead without errors', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(() => result.current.markAllAsRead()).not.toThrow();
    expect(Core.NotificationController.markAllAsRead).toHaveBeenCalled();
  });

  it('should return consistent counts', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(result.current.notifications.length);
    expect(result.current.unreadCount).toBe(result.current.unreadNotifications.length);
  });

  it('should return isNotificationUnread function', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isNotificationUnread).toBeDefined();
    expect(typeof result.current.isNotificationUnread).toBe('function');
  });

  it('should return loadMore and refresh functions', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.loadMore).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should return notifications from controller', async () => {
    const mockNotifications = [
      { id: 'test-1', type: NotificationType.Follow, timestamp: Date.now(), followed_by: 'user1' },
    ] as Core.FlatNotification[];

    vi.mocked(Core.NotificationController.getOrFetchNotifications).mockResolvedValueOnce({
      flatNotifications: mockNotifications,
      olderThan: mockNotifications[0].timestamp - 1,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.count).toBe(1);
  });

  it('should call loadMore with olderThan parameter', async () => {
    const mockNotifications = [
      { id: 'test-1', type: NotificationType.Follow, timestamp: 1000, followed_by: 'user1' },
    ] as Core.FlatNotification[];

    vi.mocked(Core.NotificationController.getOrFetchNotifications)
      .mockResolvedValueOnce({
        flatNotifications: mockNotifications,
        olderThan: 999,
      })
      .mockResolvedValueOnce({
        flatNotifications: [],
        olderThan: undefined,
      });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(Core.NotificationController.getOrFetchNotifications).toHaveBeenCalledWith({
      olderThan: 999,
    });
  });
});
