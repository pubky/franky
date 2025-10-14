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
  });

  it('initializes with custom initial status', () => {
    const { result } = renderHook(() => useStatusManager({ initialStatus: 'Working' }));

    expect(result.current.currentStatus).toBe('Working');
  });

  it('updates current status and updates emoji to predefined', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.handleStatusSelect('Away');
    });

    expect(result.current.currentStatus).toBe('Away');
    expect(result.current.selectedEmoji).toBe('🕓');
    expect(result.current.showStatusMenu).toBe(false);
  });

  it('updates custom status', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.setCustomStatus('Custom status');
    });

    expect(result.current.customStatus).toBe('Custom status');
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

  it('handles emoji selection to set custom emoji', () => {
    const { result } = renderHook(() => useStatusManager());

    act(() => {
      result.current.handleEmojiSelect({ native: '🎉' });
    });

    expect(result.current.selectedEmoji).toBe('🎉');
  });
});
