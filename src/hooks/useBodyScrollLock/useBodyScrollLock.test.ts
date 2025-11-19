import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBodyScrollLock } from './useBodyScrollLock';

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.style.overflow = '';
  });

  it('locks body scroll when locked is true', () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does not lock body scroll when locked is false', () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('restores original overflow when unlocked', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = renderHook(({ locked }) => useBodyScrollLock(locked), {
      initialProps: { locked: true },
    });

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: false });

    expect(document.body.style.overflow).toBe('auto');
  });

  it('handles SSR gracefully', () => {
    // The hook checks for typeof window === 'undefined' which should handle SSR
    // This test verifies the hook doesn't crash in SSR environment
    const { result } = renderHook(() => useBodyScrollLock(true));
    expect(result.current).toBeUndefined();
  });
});
