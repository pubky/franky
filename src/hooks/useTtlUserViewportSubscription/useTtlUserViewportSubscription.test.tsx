import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTtlUserViewportSubscription } from './useTtlUserViewportSubscription';

// Mock TtlCoordinator
const mockSubscribeUser = vi.fn();
const mockUnsubscribeUser = vi.fn();

vi.mock('@/core', () => ({
  TtlCoordinator: {
    getInstance: () => ({
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

describe('useTtlUserViewportSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    intersectionCallback = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
    intersectionCallback = null;
  });

  describe('Initialization', () => {
    it('should return ref callback and visibility state', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
        }),
      );

      expect(result.current.ref).toBeDefined();
      expect(typeof result.current.ref).toBe('function');
      expect(result.current.isVisible).toBe(false);
    });

    it('should not subscribe when no pubky is provided', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: null,
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

      expect(mockSubscribeUser).not.toHaveBeenCalled();
    });

    it('should handle undefined pubky', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: undefined,
        }),
      );

      expect(result.current.ref).toBeDefined();
      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('Visibility Detection', () => {
    it('should subscribe when element becomes visible', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'user123',
      });
    });

    it('should unsubscribe when element leaves viewport', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
      expect(mockUnsubscribeUser).toHaveBeenCalledWith({
        pubky: 'user123',
      });
    });

    it('should update visibility state correctly', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
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

  describe('Configuration Options', () => {
    it('should accept default options without error', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
      mockUnsubscribeUser.mockClear();

      // Unmount
      unmount();

      expect(mockUnsubscribeUser).toHaveBeenCalledWith({
        pubky: 'user123',
      });
    });

    it('should disconnect observer on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
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

  describe('Pubky Changes', () => {
    it('should handle pubky changes while not visible', () => {
      const { result, rerender } = renderHook(
        ({ pubky }) =>
          useTtlUserViewportSubscription({
            pubky,
          }),
        {
          initialProps: { pubky: 'user1' },
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

      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'user1',
      });

      // Make not visible
      act(() => {
        simulateVisibility(false);
      });

      // Clear mocks
      mockSubscribeUser.mockClear();
      mockUnsubscribeUser.mockClear();

      // Change pubky while not visible
      rerender({ pubky: 'user2' });

      // Should not subscribe new user while not visible
      expect(mockSubscribeUser).not.toHaveBeenCalled();

      // Make visible again with new pubky
      act(() => {
        simulateVisibility(true);
      });

      // Now should subscribe new user
      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'user2',
      });
    });

    it('should handle pubky changes while visible via intersection callback', () => {
      const { result, rerender } = renderHook(
        ({ pubky }) =>
          useTtlUserViewportSubscription({
            pubky,
          }),
        {
          initialProps: { pubky: 'user1' },
        },
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      // Make visible
      act(() => {
        simulateVisibility(true);
      });

      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'user1',
      });

      // Clear mocks
      mockSubscribeUser.mockClear();
      mockUnsubscribeUser.mockClear();

      // Change pubky while visible
      rerender({ pubky: 'user2' });

      // Simulate the intersection callback firing again (e.g., scroll event)
      // This is the realistic scenario - IntersectionObserver re-evaluates
      act(() => {
        simulateVisibility(true);
      });

      // Should unsubscribe old user and subscribe new user
      expect(mockUnsubscribeUser).toHaveBeenCalledWith({
        pubky: 'user1',
      });
      expect(mockSubscribeUser).toHaveBeenCalledWith({
        pubky: 'user2',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not double-subscribe when already subscribed', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
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
      expect(mockSubscribeUser).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string pubky as falsy', () => {
      // Clear mocks explicitly before this test
      mockSubscribeUser.mockClear();
      mockUnsubscribeUser.mockClear();

      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: '',
        }),
      );

      const mockElement = document.createElement('div');
      act(() => {
        result.current.ref(mockElement);
      });

      act(() => {
        simulateVisibility(true);
      });

      // Empty string is falsy, should not subscribe
      expect(mockSubscribeUser).not.toHaveBeenCalled();
    });

    it('should handle ref being set to null', () => {
      const { result } = renderHook(() =>
        useTtlUserViewportSubscription({
          pubky: 'user123',
        }),
      );

      const mockElement = document.createElement('div');

      // Set ref to element
      act(() => {
        result.current.ref(mockElement);
      });

      // Set ref to null
      act(() => {
        result.current.ref(null);
      });

      // Should handle gracefully
      expect(result.current.isVisible).toBe(false);
    });
  });
});
