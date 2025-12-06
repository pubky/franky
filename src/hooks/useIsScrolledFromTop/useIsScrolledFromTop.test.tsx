import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsScrolledFromTop } from './useIsScrolledFromTop';

describe('useIsScrolledFromTop', () => {
  const originalScrollY = window.scrollY;

  beforeEach(() => {
    // Reset scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original scrollY
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
      writable: true,
      configurable: true,
    });
  });

  it('should return false when at top of page', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop());

    expect(result.current).toBe(false);
  });

  it('should return false when scroll is below threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop(100));

    expect(result.current).toBe(false);
  });

  it('should return true when scroll exceeds default threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop());

    // Simulate scroll event to trigger update
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('should use custom threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 250, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop(200));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('should return false when scroll equals threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop(100));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });

  it('should update when user scrolls down', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop(100));

    expect(result.current).toBe(false);

    // Simulate scrolling down
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 150, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('should update when user scrolls back to top', () => {
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true, configurable: true });

    const { result } = renderHook(() => useIsScrolledFromTop(100));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);

    // Simulate scrolling back to top
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIsScrolledFromTop());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
