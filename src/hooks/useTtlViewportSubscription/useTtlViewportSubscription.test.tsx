import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTtlViewportSubscription } from './useTtlViewportSubscription';

// Mock TtlCoordinator
const mockSubscribePost = vi.fn();
const mockUnsubscribePost = vi.fn();
const mockSubscribeUser = vi.fn();
const mockUnsubscribeUser = vi.fn();

vi.mock('@/core', () => ({
  TtlCoordinator: {
    getInstance: () => ({
      subscribePost: mockSubscribePost,
      unsubscribePost: mockUnsubscribePost,
      subscribeUser: mockSubscribeUser,
      unsubscribeUser: mockUnsubscribeUser,
    }),
  },
}));

// Mock IntersectionObserver
let intersectionCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    intersectionCallback = callback;
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Helper to simulate visibility changes
function simulateVisibility(isIntersecting: boolean) {
  if (intersectionCallback) {
    intersectionCallback([{ isIntersecting } as IntersectionObserverEntry]);
  }
}

describe('useTtlViewportSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return ref callback and visibility state', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
        }),
      );

      expect(result.current.ref).toBeDefined();
      expect(typeof result.current.ref).toBe('function');
      expect(result.current.isVisible).toBe(false);
    });

    it('should not subscribe when no postId is provided', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: null,
        }),
      );

      // Attach ref to a mock element
      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Simulate visibility
      act(() => {
        simulateVisibility(true);
      });

      expect(mockSubscribePost).not.toHaveBeenCalled();
    });

    it('should handle undefined postId', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: undefined,
        }),
      );

      expect(result.current.ref).toBeDefined();
      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('Visibility Detection', () => {
    it('should subscribe when element becomes visible', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          subscribeAuthor: true,
        }),
      );

      // Attach ref to a mock element
      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Simulate element becoming visible
      act(() => {
        simulateVisibility(true);
      });

      expect(result.current.isVisible).toBe(true);
      expect(mockSubscribePost).toHaveBeenCalledWith({
        compositePostId: 'author123:post456',
      });
      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'author123',
      });
    });

    it('should unsubscribe when element leaves viewport', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          subscribeAuthor: true,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // First make visible
      act(() => {
        simulateVisibility(true);
      });

      // Then make not visible
      act(() => {
        simulateVisibility(false);
      });

      expect(result.current.isVisible).toBe(false);
      expect(mockUnsubscribePost).toHaveBeenCalledWith({
        compositePostId: 'author123:post456',
      });
      expect(mockUnsubscribeUser).toHaveBeenCalledWith({
        pubky: 'author123',
      });
    });

    it('should update visibility state correctly', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      expect(result.current.isVisible).toBe(false);

      act(() => {
        simulateVisibility(true);
      });
      expect(result.current.isVisible).toBe(true);

      act(() => {
        simulateVisibility(false);
      });
      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('Author Subscription', () => {
    it('should subscribe author when subscribeAuthor is true', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          subscribeAuthor: true,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      act(() => {
        simulateVisibility(true);
      });

      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'author123',
      });
    });

    it('should not subscribe author when subscribeAuthor is false', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          subscribeAuthor: false,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      act(() => {
        simulateVisibility(true);
      });

      expect(mockSubscribePost).toHaveBeenCalled();
      expect(mockSubscribeUser).not.toHaveBeenCalled();
    });

    it('should extract author from composite ID correctly', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'pk1abc123xyz:0000000123',
          subscribeAuthor: true,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      act(() => {
        simulateVisibility(true);
      });

      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'pk1abc123xyz',
      });
    });
  });

  describe('Configuration Options', () => {
    it('should accept default options without error', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Should not throw and observer should be set up
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should accept custom rootMargin without error', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          rootMargin: '100px 0px',
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Should not throw and observer should be set up
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should accept custom threshold without error', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          threshold: 0.5,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Should not throw and observer should be set up
      expect(mockObserve).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
          subscribeAuthor: true,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Make visible and subscribe
      act(() => {
        simulateVisibility(true);
      });

      // Clear mocks to verify unmount calls
      mockUnsubscribePost.mockClear();
      mockUnsubscribeUser.mockClear();

      // Unmount
      unmount();

      expect(mockUnsubscribePost).toHaveBeenCalledWith({
        compositePostId: 'author123:post456',
      });
      expect(mockUnsubscribeUser).toHaveBeenCalledWith({
        pubky: 'author123',
      });
    });

    it('should disconnect observer on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      unmount();

      expect(mockUnobserve).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('PostId Changes', () => {
    it('should handle postId changes while not visible', () => {
      const { result, rerender } = renderHook(
        ({ postId }) =>
          useTtlViewportSubscription({
            compositePostId: postId,
            subscribeAuthor: true,
          }),
        {
          initialProps: { postId: 'author1:post1' },
        },
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Make visible first
      act(() => {
        simulateVisibility(true);
      });

      expect(mockSubscribePost).toHaveBeenCalledWith({
        compositePostId: 'author1:post1',
      });

      // Make not visible
      act(() => {
        simulateVisibility(false);
      });

      // Clear mocks
      mockSubscribePost.mockClear();
      mockUnsubscribePost.mockClear();
      mockSubscribeUser.mockClear();
      mockUnsubscribeUser.mockClear();

      // Change postId while not visible
      rerender({ postId: 'author2:post2' });

      // Should not subscribe new post while not visible
      expect(mockSubscribePost).not.toHaveBeenCalled();

      // Make visible again with new postId
      act(() => {
        simulateVisibility(true);
      });

      // Now should subscribe new post
      expect(mockSubscribePost).toHaveBeenCalledWith({
        compositePostId: 'author2:post2',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed composite ID (no colon)', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'malformed-id-without-colon',
          subscribeAuthor: true,
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      act(() => {
        simulateVisibility(true);
      });

      // Should still subscribe the post
      expect(mockSubscribePost).toHaveBeenCalledWith({
        compositePostId: 'malformed-id-without-colon',
      });
      // But not subscribe user (can't extract author)
      expect(mockSubscribeUser).not.toHaveBeenCalled();
    });

    it('should not double-subscribe when already subscribed', () => {
      const { result } = renderHook(() =>
        useTtlViewportSubscription({
          compositePostId: 'author123:post456',
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Make visible twice
      act(() => {
        simulateVisibility(true);
      });
      act(() => {
        simulateVisibility(true);
      });

      // Should only subscribe once
      expect(mockSubscribePost).toHaveBeenCalledTimes(1);
    });
  });
});
