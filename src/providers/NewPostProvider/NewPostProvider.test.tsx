import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { NewPostProvider, useNewPostContext } from './NewPostProvider';

describe('NewPostProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <NewPostProvider>
        <div data-testid="child">Child Content</div>
      </NewPostProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('provides signalNewPost function via context', () => {
    const { result } = renderHook(() => useNewPostContext(), {
      wrapper: NewPostProvider,
    });

    expect(result.current).not.toBeNull();
    expect(typeof result.current.signalNewPost).toBe('function');
    expect(typeof result.current.subscribeToNewPosts).toBe('function');
  });

  it('signalNewPost calls all subscribers with the post ID', () => {
    const subscriber1 = vi.fn();
    const subscriber2 = vi.fn();

    const { result } = renderHook(() => useNewPostContext(), {
      wrapper: NewPostProvider,
    });

    // Subscribe both callbacks
    act(() => {
      result.current.subscribeToNewPosts(subscriber1);
      result.current.subscribeToNewPosts(subscriber2);
    });

    // Signal a new post
    act(() => {
      result.current.signalNewPost('test-post-id');
    });

    expect(subscriber1).toHaveBeenCalledTimes(1);
    expect(subscriber1).toHaveBeenCalledWith('test-post-id');
    expect(subscriber2).toHaveBeenCalledTimes(1);
    expect(subscriber2).toHaveBeenCalledWith('test-post-id');
  });

  it('subscribeToNewPosts returns working unsubscribe function', () => {
    const subscriber = vi.fn();

    const { result } = renderHook(() => useNewPostContext(), {
      wrapper: NewPostProvider,
    });

    // Subscribe and get unsubscribe function
    let unsubscribe: (() => void) | undefined;
    act(() => {
      unsubscribe = result.current.subscribeToNewPosts(subscriber);
    });

    // Signal should call subscriber
    act(() => {
      result.current.signalNewPost('post-1');
    });
    expect(subscriber).toHaveBeenCalledTimes(1);

    // Unsubscribe
    act(() => {
      unsubscribe?.();
    });

    // Signal should NOT call subscriber after unsubscribe
    act(() => {
      result.current.signalNewPost('post-2');
    });
    expect(subscriber).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it('handles multiple signals to the same subscriber', () => {
    const subscriber = vi.fn();

    const { result } = renderHook(() => useNewPostContext(), {
      wrapper: NewPostProvider,
    });

    act(() => {
      result.current.subscribeToNewPosts(subscriber);
    });

    act(() => {
      result.current.signalNewPost('post-1');
      result.current.signalNewPost('post-2');
      result.current.signalNewPost('post-3');
    });

    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenNthCalledWith(1, 'post-1');
    expect(subscriber).toHaveBeenNthCalledWith(2, 'post-2');
    expect(subscriber).toHaveBeenNthCalledWith(3, 'post-3');
  });

  it('signalNewPost with no subscribers does not throw', () => {
    const { result } = renderHook(() => useNewPostContext(), {
      wrapper: NewPostProvider,
    });

    // Should not throw when signaling with no subscribers
    expect(() => {
      act(() => {
        result.current.signalNewPost('orphan-post-id');
      });
    }).not.toThrow();
  });
});

describe('useNewPostContext outside provider', () => {
  it('returns default no-op functions when used outside provider', () => {
    // Render WITHOUT provider wrapper
    const { result } = renderHook(() => useNewPostContext());

    expect(result.current).not.toBeNull();
    expect(typeof result.current.signalNewPost).toBe('function');
    expect(typeof result.current.subscribeToNewPosts).toBe('function');

    // Calling functions should not throw
    expect(() => {
      result.current.signalNewPost('test-id');
    }).not.toThrow();

    const unsubscribe = result.current.subscribeToNewPosts(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => {
      unsubscribe?.();
    }).not.toThrow();
  });
});

describe('NewPostProvider - Snapshots', () => {
  it('matches snapshot with children', () => {
    const { container } = render(
      <NewPostProvider>
        <div>Child Content</div>
      </NewPostProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
