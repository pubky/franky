import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStatusManager } from './useStatusManager';

describe('useStatusManager', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useStatusManager());

    expect(result.current.currentStatus).toBe('Vacationing');
    expect(result.current.customStatus).toBe('');
    expect(result.current.selectedEmoji).toBe('😊');
    expect(result.current.showStatusMenu).toBe(false);
    expect(result.current.showEmojiPicker).toBe(false);
  });

  it('initializes with custom initial status', () => {
    const { result } = renderHook(() => useStatusManager({ initialStatus: 'Working' }));

    expect(result.current.currentStatus).toBe('Working');
  });

  it('updates current status', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.setCurrentStatus('Available');
    });

    expect(result.current.currentStatus).toBe('Available');
  });

  it('updates custom status', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.setCustomStatus('Custom status');
    });

    expect(result.current.customStatus).toBe('Custom status');
  });

  it('updates selected emoji', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.setSelectedEmoji('🎉');
    });

    expect(result.current.selectedEmoji).toBe('🎉');
  });

  it('handles status selection', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.handleStatusSelect('Away');
    });

    expect(result.current.currentStatus).toBe('Away');
    expect(result.current.showStatusMenu).toBe(false);
  });

  it('handles custom status save', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.setCustomStatus('Custom status');
    });

    act(() => {
      result.current.handleCustomStatusSave();
    });

    expect(result.current.currentStatus).toBe('Custom status');
    expect(result.current.showStatusMenu).toBe(false);
  });

  it('handles emoji selection', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.handleEmojiSelect({ native: '🎉' });
    });

    expect(result.current.selectedEmoji).toBe('🎉');
    expect(result.current.showEmojiPicker).toBe(false);
  });

  it('handles emoji selection with invalid emoji', () => {
    const { result } = renderHook(() => useStatusManager());
    const initialEmoji = result.current.selectedEmoji;

    act(() => {
      result.current.handleEmojiSelect({ native: '' });
    });

    expect(result.current.selectedEmoji).toBe(initialEmoji);
  });

  it('handles status menu change when emoji picker is closed', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.handleStatusMenuChange(false);
    });

    expect(result.current.showStatusMenu).toBe(false);
  });

  it('prevents status menu close when emoji picker is open', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.setShowEmojiPicker(true);
    });

    act(() => {
      result.current.handleStatusMenuChange(false);
    });

    expect(result.current.showStatusMenu).toBe(false); // Should remain unchanged
  });
});
