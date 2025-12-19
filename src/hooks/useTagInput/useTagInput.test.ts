import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTagInput } from './useTagInput';

// Mock useEmojiInsert
vi.mock('../useEmojiInsert', () => ({
  useEmojiInsert: vi.fn(() => vi.fn()),
}));

describe('useTagInput', () => {
  const mockOnTagAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state with empty input', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    expect(result.current.inputValue).toBe('');
    expect(result.current.showEmojiPicker).toBe(false);
    expect(result.current.isAtLimit).toBe(false);
    expect(result.current.limitReached).toBe(false);
    expect(result.current.isDisabled).toBe(false);
  });

  it('updates input value on change', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    act(() => {
      result.current.handleInputChange({
        target: { value: 'new-tag' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('new-tag');
  });

  it('calls onTagAdd and clears input on submit', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    act(() => {
      result.current.setInputValue('new-tag');
    });

    act(() => {
      result.current.handleTagSubmit();
    });

    expect(mockOnTagAdd).toHaveBeenCalledWith('new-tag');
    expect(result.current.inputValue).toBe('');
  });

  it('does not add duplicate tags (case-insensitive)', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
        existingTags: ['existing-tag'],
      }),
    );

    act(() => {
      result.current.setInputValue('EXISTING-TAG');
    });

    act(() => {
      result.current.handleTagSubmit();
    });

    expect(mockOnTagAdd).not.toHaveBeenCalled();
    expect(result.current.inputValue).toBe('');
  });

  it('does not submit empty tags', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    act(() => {
      result.current.setInputValue('   ');
    });

    act(() => {
      result.current.handleTagSubmit();
    });

    expect(mockOnTagAdd).not.toHaveBeenCalled();
  });

  it('respects maxTags limit', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
        existingTags: ['tag1', 'tag2', 'tag3'],
        maxTags: 3,
      }),
    );

    expect(result.current.isAtLimit).toBe(true);
    expect(result.current.isDisabled).toBe(true);

    act(() => {
      result.current.setInputValue('new-tag');
    });

    act(() => {
      result.current.handleTagSubmit();
    });

    expect(mockOnTagAdd).not.toHaveBeenCalled();
    expect(result.current.limitReached).toBe(true);
  });

  it('sets limitReached when trying to add beyond limit', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
        existingTags: ['tag1', 'tag2'],
        maxTags: 2,
      }),
    );

    act(() => {
      result.current.handleTagSubmit();
    });

    expect(result.current.limitReached).toBe(true);
  });

  it('clears limitReached when typing', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
        existingTags: ['tag1', 'tag2'],
        maxTags: 2,
      }),
    );

    // Trigger limit reached
    act(() => {
      result.current.handleTagSubmit();
    });

    expect(result.current.limitReached).toBe(true);

    // Type something
    act(() => {
      result.current.handleInputChange({
        target: { value: 'x' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.limitReached).toBe(false);
  });

  it('respects disabled prop', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
        disabled: true,
      }),
    );

    expect(result.current.isDisabled).toBe(true);
  });

  it('toggles emoji picker visibility', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    expect(result.current.showEmojiPicker).toBe(false);

    act(() => {
      result.current.setShowEmojiPicker(true);
    });

    expect(result.current.showEmojiPicker).toBe(true);

    act(() => {
      result.current.setShowEmojiPicker(false);
    });

    expect(result.current.showEmojiPicker).toBe(false);
  });

  it('clears input on clearInput call', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    act(() => {
      result.current.setInputValue('some-value');
    });

    expect(result.current.inputValue).toBe('some-value');

    act(() => {
      result.current.clearInput();
    });

    expect(result.current.inputValue).toBe('');
  });

  it('trims tag before adding', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    act(() => {
      result.current.setInputValue('  spaced-tag  ');
    });

    act(() => {
      result.current.handleTagSubmit();
    });

    expect(mockOnTagAdd).toHaveBeenCalledWith('spaced-tag');
  });

  it('provides inputRef for external use', () => {
    const { result } = renderHook(() =>
      useTagInput({
        onTagAdd: mockOnTagAdd,
      }),
    );

    expect(result.current.inputRef).toBeDefined();
    expect(result.current.inputRef.current).toBeNull();
  });
});
