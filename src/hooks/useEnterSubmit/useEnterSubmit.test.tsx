import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnterSubmit } from './useEnterSubmit';

describe('useEnterSubmit', () => {
  const createKeyboardEvent = (key: string, isComposing: boolean = false): React.KeyboardEvent =>
    ({
      key,
      nativeEvent: { isComposing } as KeyboardEvent,
      preventDefault: vi.fn(),
    }) as unknown as React.KeyboardEvent;

  it('calls onSubmit when Enter is pressed and form is valid', () => {
    const mockOnSubmit = vi.fn();
    const mockIsValid = vi.fn(() => true);

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when form is invalid', () => {
    const mockOnSubmit = vi.fn();
    const mockIsValid = vi.fn(() => false);

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when key is not Enter', () => {
    const mockOnSubmit = vi.fn();
    const mockIsValid = vi.fn(() => true);

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    act(() => {
      result.current(createKeyboardEvent('Space'));
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('guards against IME composition', () => {
    const mockOnSubmit = vi.fn();
    const mockIsValid = vi.fn(() => true);

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    act(() => {
      result.current(createKeyboardEvent('Enter', true));
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('guards against double-submit for async functions', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    const mockOnSubmit = vi.fn(() => submitPromise);
    const mockIsValid = vi.fn(() => true);

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    // First Enter press
    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    // Second Enter press while first is still pending
    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    // Resolve the promise
    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });

    // Now a third press should work
    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(2);
  });

  it('prevents default behavior when Enter is pressed with valid form', () => {
    const mockOnSubmit = vi.fn();
    const mockIsValid = vi.fn(() => true);
    const mockPreventDefault = vi.fn();

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    const event = createKeyboardEvent('Enter');
    event.preventDefault = mockPreventDefault;

    act(() => {
      result.current(event);
    });

    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
  });

  it('does not prevent default when form is invalid', () => {
    const mockOnSubmit = vi.fn();
    const mockIsValid = vi.fn(() => false);
    const mockPreventDefault = vi.fn();

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    const event = createKeyboardEvent('Enter');
    event.preventDefault = mockPreventDefault;

    act(() => {
      result.current(event);
    });

    expect(mockPreventDefault).not.toHaveBeenCalled();
  });

  it('works with synchronous submit functions', () => {
    const mockOnSubmit = vi.fn(); // Synchronous function
    const mockIsValid = vi.fn(() => true);

    const { result } = renderHook(() => useEnterSubmit(mockIsValid, mockOnSubmit));

    // First press
    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    // Second press should also work (no async lock)
    act(() => {
      result.current(createKeyboardEvent('Enter'));
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(2);
  });
});
