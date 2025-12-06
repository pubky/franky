import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnreadPosts } from './useUnreadPosts';
import type * as Core from '@/core';

// Hoist mock data
const { mockUnreadStream, setMockUnreadStream } = vi.hoisted(() => {
  const stream = { current: null as { stream: string[] } | null };
  return {
    mockUnreadStream: stream,
    setMockUnreadStream: (value: { stream: string[] } | null) => {
      stream.current = value;
    },
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => mockUnreadStream.current),
}));

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    UnreadPostStreamModel: {
      findById: vi.fn(() => Promise.resolve(mockUnreadStream.current)),
    },
  };
});

describe('useUnreadPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockUnreadStream(null);
  });

  it('should return empty arrays when streamId is null', () => {
    const { result } = renderHook(() => useUnreadPosts({ streamId: null }));

    expect(result.current.unreadPostIds).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should return empty arrays when no unread stream exists', () => {
    setMockUnreadStream(null);

    const { result } = renderHook(() => useUnreadPosts({ streamId: 'timeline:all:all' as Core.PostStreamId }));

    expect(result.current.unreadPostIds).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should return unread post IDs when stream exists', () => {
    const mockPostIds = ['post-1', 'post-2', 'post-3'];
    setMockUnreadStream({ stream: mockPostIds });

    const { result } = renderHook(() => useUnreadPosts({ streamId: 'timeline:all:all' as Core.PostStreamId }));

    expect(result.current.unreadPostIds).toEqual(mockPostIds);
    expect(result.current.unreadCount).toBe(3);
  });

  it('should return correct count for single post', () => {
    setMockUnreadStream({ stream: ['post-1'] });

    const { result } = renderHook(() => useUnreadPosts({ streamId: 'timeline:all:all' as Core.PostStreamId }));

    expect(result.current.unreadCount).toBe(1);
  });

  it('should return correct count for many posts', () => {
    const manyPosts = Array.from({ length: 100 }, (_, i) => `post-${i}`);
    setMockUnreadStream({ stream: manyPosts });

    const { result } = renderHook(() => useUnreadPosts({ streamId: 'timeline:all:all' as Core.PostStreamId }));

    expect(result.current.unreadCount).toBe(100);
  });

  it('should handle empty stream array', () => {
    setMockUnreadStream({ stream: [] });

    const { result } = renderHook(() => useUnreadPosts({ streamId: 'timeline:all:all' as Core.PostStreamId }));

    expect(result.current.unreadPostIds).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });
});
