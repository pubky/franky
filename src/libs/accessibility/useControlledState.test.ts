import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useControlledState } from './useControlledState';

describe('useControlledState', () => {
  describe('Uncontrolled mode', () => {
    it('uses defaultValue when value is undefined', () => {
      const { result } = renderHook(() =>
        useControlledState({
          defaultValue: 'default',
        }),
      );

      expect(result.current.value).toBe('default');
      expect(result.current.isControlled).toBe(false);
    });

    it('updates internal state when setValue is called', () => {
      const { result } = renderHook(() =>
        useControlledState({
          defaultValue: 'default',
        }),
      );

      act(() => {
        result.current.setValue('new value');
      });

      expect(result.current.value).toBe('new value');
    });

    it('calls onChange callback when setValue is called', () => {
      const mockOnChange = vi.fn();
      const { result } = renderHook(() =>
        useControlledState({
          defaultValue: 'default',
          onChange: mockOnChange,
        }),
      );

      act(() => {
        result.current.setValue('new value');
      });

      expect(mockOnChange).toHaveBeenCalledWith('new value');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Controlled mode', () => {
    it('uses value prop when provided', () => {
      const { result } = renderHook(() =>
        useControlledState({
          value: 'controlled',
          defaultValue: 'default',
        }),
      );

      expect(result.current.value).toBe('controlled');
      expect(result.current.isControlled).toBe(true);
    });

    it('does not update internal state when setValue is called', () => {
      const { result } = renderHook(() =>
        useControlledState({
          value: 'controlled',
          defaultValue: 'default',
        }),
      );

      act(() => {
        result.current.setValue('new value');
      });

      // Value should still be the controlled value
      expect(result.current.value).toBe('controlled');
    });

    it('calls onChange callback when setValue is called', () => {
      const mockOnChange = vi.fn();
      const { result } = renderHook(() =>
        useControlledState({
          value: 'controlled',
          defaultValue: 'default',
          onChange: mockOnChange,
        }),
      );

      act(() => {
        result.current.setValue('new value');
      });

      expect(mockOnChange).toHaveBeenCalledWith('new value');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('updates value when controlled prop changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useControlledState({
            value,
            defaultValue: 'default',
          }),
        {
          initialProps: { value: 'controlled1' },
        },
      );

      expect(result.current.value).toBe('controlled1');

      rerender({ value: 'controlled2' });

      expect(result.current.value).toBe('controlled2');
    });

    it('ignores defaultValue when value is provided', () => {
      const { result } = renderHook(() =>
        useControlledState({
          value: 'controlled',
          defaultValue: 'default',
        }),
      );

      expect(result.current.value).toBe('controlled');
      expect(result.current.value).not.toBe('default');
    });
  });

  describe('Mode switching', () => {
    it('switches from uncontrolled to controlled', () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useControlledState({
            value,
            defaultValue: 'default',
          }),
        {
          initialProps: { value: undefined as string | undefined },
        },
      );

      // Initially uncontrolled
      expect(result.current.isControlled).toBe(false);
      expect(result.current.value).toBe('default');

      // Update internal state
      act(() => {
        result.current.setValue('updated');
      });

      expect(result.current.value).toBe('updated');

      // Switch to controlled
      rerender({ value: 'controlled' });

      expect(result.current.isControlled).toBe(true);
      expect(result.current.value).toBe('controlled');
    });

    it('switches from controlled to uncontrolled', () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useControlledState({
            value,
            defaultValue: 'default',
          }),
        {
          initialProps: { value: 'controlled' as string | undefined },
        },
      );

      // Initially controlled
      expect(result.current.isControlled).toBe(true);
      expect(result.current.value).toBe('controlled');

      // Switch to uncontrolled
      rerender({ value: undefined });

      expect(result.current.isControlled).toBe(false);
      // Should use the internal state (which is still the defaultValue)
      expect(result.current.value).toBe('default');
    });
  });

  describe('Edge cases', () => {
    it('handles value of 0', () => {
      const { result } = renderHook(() =>
        useControlledState({
          value: 0,
          defaultValue: 10,
        }),
      );

      expect(result.current.value).toBe(0);
      expect(result.current.isControlled).toBe(true);
    });

    it('handles value of empty string', () => {
      const { result } = renderHook(() =>
        useControlledState({
          value: '',
          defaultValue: 'default',
        }),
      );

      expect(result.current.value).toBe('');
      expect(result.current.isControlled).toBe(true);
    });

    it('handles value of false', () => {
      const { result } = renderHook(() =>
        useControlledState({
          value: false,
          defaultValue: true,
        }),
      );

      expect(result.current.value).toBe(false);
      expect(result.current.isControlled).toBe(true);
    });

    it('handles undefined onChange gracefully', () => {
      const { result } = renderHook(() =>
        useControlledState({
          defaultValue: 'default',
        }),
      );

      expect(() => {
        act(() => {
          result.current.setValue('new value');
        });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('memoizes setValue function', () => {
      const mockOnChange = vi.fn();
      const { result, rerender } = renderHook(() =>
        useControlledState({
          value: 'controlled',
          defaultValue: 'default',
          onChange: mockOnChange,
        }),
      );

      const firstSetValue = result.current.setValue;

      rerender();

      const secondSetValue = result.current.setValue;

      expect(firstSetValue).toBe(secondSetValue);
    });
  });
});
