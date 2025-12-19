import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSearchInput } from './useSearchInput';

describe('useSearchInput', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useSearchInput());

    expect(result.current.inputValue).toBe('');
    expect(result.current.isFocused).toBe(false);
    expect(result.current.containerRef.current).toBe(null);
  });

  it('initializes expanded when defaultExpanded is true', () => {
    const { result } = renderHook(() => useSearchInput({ defaultExpanded: true }));

    expect(result.current.isFocused).toBe(true);
  });

  it('updates input value on change', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleInputChange({ target: { value: 'new value' } } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('new value');
  });

  it('sets isFocused to true on focus', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleFocus();
    });

    expect(result.current.isFocused).toBe(true);
  });

  it('logs search on Enter key', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleInputChange({ target: { value: 'test query' } } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleKeyDown({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Search:', 'test query');
    consoleSpy.mockRestore();
  });

  it('closes on Escape key', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleFocus();
    });
    expect(result.current.isFocused).toBe(true);

    act(() => {
      result.current.handleKeyDown({ key: 'Escape' } as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.isFocused).toBe(false);
  });

  it('handles tag click correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleFocus();
    });

    act(() => {
      result.current.handleTagClick('bitcoin');
    });

    expect(result.current.inputValue).toBe('bitcoin');
    expect(consoleSpy).toHaveBeenCalledWith('Search tag:', 'bitcoin');
    expect(result.current.isFocused).toBe(false);
    consoleSpy.mockRestore();
  });
});
