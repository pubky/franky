import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRadiogroupKeyboard } from './useRadiogroupKeyboard';

describe('useRadiogroupKeyboard', () => {
  const mockItems = ['item1', 'item2', 'item3', 'item4'];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('returns listRef and handleKeyDown', () => {
    const { result } = renderHook(() =>
      useRadiogroupKeyboard({
        items: mockItems,
        onSelect: mockOnSelect,
      }),
    );

    expect(result.current.listRef).toBeDefined();
    expect(result.current.listRef.current).toBeNull();
    expect(typeof result.current.handleKeyDown).toBe('function');
  });

  describe('handleKeyDown - ArrowDown', () => {
    it('moves focus to next item on ArrowDown', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      // Create mock DOM elements
      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      // Mock the listRef and querySelectorAll
      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRadios[1].focus).toHaveBeenCalled();
    });

    it('wraps to first item when on last item', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 3);
      });

      expect(mockRadios[0].focus).toHaveBeenCalled();
    });
  });

  describe('handleKeyDown - ArrowUp', () => {
    it('moves focus to previous item on ArrowUp', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 2);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRadios[1].focus).toHaveBeenCalled();
    });

    it('wraps to last item when on first item', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });

      expect(mockRadios[3].focus).toHaveBeenCalled();
    });
  });

  describe('handleKeyDown - ArrowRight/ArrowLeft', () => {
    it('ArrowRight behaves like ArrowDown', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });

      expect(mockRadios[1].focus).toHaveBeenCalled();
    });

    it('ArrowLeft behaves like ArrowUp', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 2);
      });

      expect(mockRadios[1].focus).toHaveBeenCalled();
    });
  });

  describe('handleKeyDown - Home/End', () => {
    it('Home key focuses first item', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'Home',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 3);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRadios[0].focus).toHaveBeenCalled();
    });

    it('End key focuses last item', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'End',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRadios[3].focus).toHaveBeenCalled();
    });
  });

  describe('handleKeyDown - Space/Enter', () => {
    it('Space key calls onSelect with current item', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(mockEvent, 1);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSelect).toHaveBeenCalledWith('item2', 1);
    });

    it('Enter key calls onSelect with current item', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(mockEvent, 2);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSelect).toHaveBeenCalledWith('item3', 2);
    });
  });

  describe('handleKeyDown - isDisabled', () => {
    it('skips disabled items when navigating with ArrowDown', () => {
      const isDisabled = (item: string) => item === 'item2';
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
          isDisabled,
        }),
      );

      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      const mockRadios = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }];

      result.current.listRef.current = {
        querySelectorAll: vi.fn().mockReturnValue(mockRadios),
      } as unknown as HTMLDivElement;

      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });

      // Should skip item2 (index 1) and focus item3 (index 2)
      expect(mockRadios[2].focus).toHaveBeenCalled();
    });

    it('does not call onSelect for disabled item on Space key', () => {
      const isDisabled = (_item: string, index: number) => index === 1;
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
          isDisabled,
        }),
      );

      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(mockEvent, 1);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('handleKeyDown - other keys', () => {
    it('does nothing for other keys', () => {
      const { result } = renderHook(() =>
        useRadiogroupKeyboard({
          items: mockItems,
          onSelect: mockOnSelect,
        }),
      );

      const mockEvent = {
        key: 'Tab',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });
});
