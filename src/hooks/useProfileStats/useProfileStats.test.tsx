import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileStats } from './useProfileStats';
import * as Core from '@/core';

// Hoist mock data using vi.hoisted
const { mockUserCounts, setMockUserCounts } = vi.hoisted(() => {
  const data = { current: null as Core.UserCountsModelSchema | null };
  return {
    mockUserCounts: data,
    setMockUserCounts: (value: Core.UserCountsModelSchema | null) => {
      data.current = value;
    },
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn) => {
    // Execute the query function to return mock data
    if (queryFn) {
      void queryFn();
    }
    return mockUserCounts.current;
  }),
}));

// Mock Core controllers
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    UserController: {
      getCounts: vi.fn().mockImplementation(() => Promise.resolve(mockUserCounts.current)),
    },
  };
});

describe('useProfileStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockUserCounts(null);
  });

  describe('Stats fetching', () => {
    it('returns zero stats when user counts are not available', () => {
      const { result } = renderHook(() => useProfileStats('test-user-id'));

      expect(result.current.stats.posts).toBe(0);
      expect(result.current.stats.replies).toBe(0);
      expect(result.current.stats.followers).toBe(0);
      expect(result.current.stats.following).toBe(0);
      expect(result.current.stats.friends).toBe(0);
      expect(result.current.stats.uniqueTags).toBe(0);
      expect(result.current.stats.notifications).toBe(0);
      expect(result.current.isLoading).toBe(true);
    });

    it('returns correct stats when user counts exist', () => {
      setMockUserCounts({
        id: 'test-user-id',
        posts: 10,
        replies: 5,
        followers: 20,
        following: 15,
        friends: 8,
        uniqueTags: 0,
        tagged: 0,
        tags: 0,
        unique_tags: 3,
        bookmarks: 0,
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      // Backend sends posts including replies, UI calculates: 10 - 5 = 5 actual posts
      expect(result.current.stats.posts).toBe(5);
      expect(result.current.stats.replies).toBe(5);
      expect(result.current.stats.followers).toBe(20);
      expect(result.current.stats.following).toBe(15);
      expect(result.current.stats.friends).toBe(8);
      expect(result.current.stats.uniqueTags).toBe(3);
      expect(result.current.isLoading).toBe(false);
    });

    it('handles zero counts', () => {
      setMockUserCounts({
        id: 'test-user-id',
        posts: 0,
        replies: 0,
        followers: 0,
        following: 0,
        friends: 0,
        tagged: 0,
        uniqueTags: 0,
        tags: 0,
        unique_tags: 0,
        bookmarks: 0,
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      expect(result.current.stats.posts).toBe(0);
      expect(result.current.stats.replies).toBe(0);
      expect(result.current.stats.followers).toBe(0);
      expect(result.current.stats.following).toBe(0);
      expect(result.current.stats.friends).toBe(0);
      expect(result.current.stats.uniqueTags).toBe(0);
    });

    it('calculates posts correctly when user only has replies', () => {
      // User with 27 replies and no posts (backend counts posts including replies)
      setMockUserCounts({
        id: 'test-user-id',
        posts: 27, // Backend: includes replies in count
        replies: 27,
        followers: 0,
        following: 0,
        friends: 0,
        tagged: 0,
        tags: 0,
        unique_tags: 7,
        bookmarks: 0,
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      // UI calculates: 27 - 27 = 0 actual posts
      expect(result.current.stats.posts).toBe(0);
      expect(result.current.stats.replies).toBe(27);
      expect(result.current.stats.uniqueTags).toBe(7);
    });
  });

  describe('Notifications stat', () => {
    it('always returns 0 for notifications (not implemented yet)', () => {
      setMockUserCounts({
        id: 'test-user-id',
        posts: 10,
        replies: 5,
        followers: 20,
        following: 15,
        friends: 8,
        uniqueTags: 0,
        tagged: 0,
        tags: 0,
        unique_tags: 3,
        bookmarks: 0,
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      expect(result.current.stats.notifications).toBe(0);
    });
  });

  describe('Loading state', () => {
    it('isLoading is true when user counts are null', () => {
      const { result } = renderHook(() => useProfileStats('test-user-id'));

      expect(result.current.isLoading).toBe(true);
    });

    it('isLoading is false when user counts are available', () => {
      setMockUserCounts({
        id: 'test-user-id',
        posts: 10,
        replies: 5,
        followers: 20,
        following: 15,
        friends: 8,
        uniqueTags: 0,
        tagged: 0,
        tags: 0,
        unique_tags: 3,
        bookmarks: 0,
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles empty userId', () => {
      const { result } = renderHook(() => useProfileStats(''));

      expect(result.current.stats.posts).toBe(0);
      expect(result.current.isLoading).toBe(true);
    });

    it('handles large count values', () => {
      setMockUserCounts({
        id: 'test-user-id',
        posts: 999999,
        replies: 888888,
        followers: 777777,
        following: 666666,
        friends: 555555,
        uniqueTags: 0,
        tagged: 0,
        tags: 0,
        unique_tags: 444444,
        bookmarks: 0,
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      // UI calculates: 999999 - 888888 = 111111 actual posts
      expect(result.current.stats.posts).toBe(111111);
      expect(result.current.stats.replies).toBe(888888);
      expect(result.current.stats.followers).toBe(777777);
      expect(result.current.stats.following).toBe(666666);
      expect(result.current.stats.friends).toBe(555555);
      expect(result.current.stats.uniqueTags).toBe(444444);
    });

    it('handles partial user counts', () => {
      setMockUserCounts({
        id: 'test-user-id',
        posts: 10,
        // Missing other fields
      } as Core.UserCountsModelSchema);

      const { result } = renderHook(() => useProfileStats('test-user-id'));

      expect(result.current.stats.posts).toBe(10);
      expect(result.current.stats.replies).toBe(0);
      expect(result.current.stats.followers).toBe(0);
    });
  });

  describe('Controller integration', () => {
    it('calls UserController.getCounts with correct userId', () => {
      renderHook(() => useProfileStats('test-user-id'));

      // UserController.getCounts should be called
      expect(Core.UserController.getCounts).toHaveBeenCalledWith('test-user-id');
    });
  });
});
