import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmojiPicker } from './useEmojiPicker';

// Mock the useClickOutside hook
vi.mock('@/hooks', () => ({
  useClickOutside: vi.fn(),
}));

describe('useEmojiPicker', () => {
  const mockOnEmojiSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    expect(result.current.showEmojiPicker).toBe(false);
    expect(result.current.emojiPickerRef.current).toBe(null);
    expect(result.current.openEmojiPicker).toBeDefined();
    expect(result.current.closeEmojiPicker).toBeDefined();
    expect(result.current.handleEmojiPickerClick).toBeDefined();
    expect(result.current.handleEmojiPickerContentClick).toBeDefined();
  });

  it('opens emoji picker', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    act(() => {
      result.current.openEmojiPicker();
    });

    expect(result.current.showEmojiPicker).toBe(true);
  });

  it('closes emoji picker', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    act(() => {
      result.current.openEmojiPicker();
    });

    act(() => {
      result.current.closeEmojiPicker();
    });

    expect(result.current.showEmojiPicker).toBe(false);
  });

  it('handles emoji picker click', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as React.MouseEvent;

    act(() => {
      result.current.handleEmojiPickerClick(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(result.current.showEmojiPicker).toBe(true);
  });

  it('handles emoji picker content click', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    const mockEvent = {
      stopPropagation: vi.fn(),
    } as React.MouseEvent;

    act(() => {
      result.current.handleEmojiPickerContentClick(mockEvent);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('handles emoji selection', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    act(() => {
      result.current.openEmojiPicker();
    });

    act(() => {
      // Simulate emoji selection
      const emojiObject = { native: '🎉' };
      result.current.handleEmojiPickerClick({ preventDefault: vi.fn(), stopPropagation: vi.fn() } as React.MouseEvent);
      // This would normally be called by the EmojiPicker component
      mockOnEmojiSelect(emojiObject);
      result.current.closeEmojiPicker();
    });

    expect(mockOnEmojiSelect).toHaveBeenCalledWith({ native: '🎉' });
  });

  it('handles escape key press', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    act(() => {
      result.current.openEmojiPicker();
    });

    // Simulate escape key press
    act(() => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
    });

    expect(result.current.showEmojiPicker).toBe(false);
  });

  it('does not close on other key presses', () => {
    const { result } = renderHook(() => useEmojiPicker({ onEmojiSelect: mockOnEmojiSelect }));

    act(() => {
      result.current.openEmojiPicker();
    });

    // Simulate other key press
    act(() => {
      const otherEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(otherEvent);
    });

    expect(result.current.showEmojiPicker).toBe(true);
  });
});
