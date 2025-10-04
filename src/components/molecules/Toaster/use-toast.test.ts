import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToast, toast } from './use-toast';

// Mock sonner
vi.mock('sonner', () => {
  const mockToast = vi.fn();
  mockToast.dismiss = vi.fn();
  return {
    toast: mockToast,
  };
});

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useToast hook', () => {
    it('should return toast and dismiss functions', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.toast).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
    });

    it('should not throw when calling toast function', () => {
      const { result } = renderHook(() => useToast());

      expect(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'Test description',
        });
      }).not.toThrow();
    });

    it('should not throw when calling dismiss function', () => {
      const { result } = renderHook(() => useToast());

      expect(() => {
        result.current.dismiss('toast-id');
      }).not.toThrow();

      // The dismiss function should not throw
    });
  });

  describe('toast function', () => {
    it('should not throw when calling toast function directly', () => {
      expect(() => {
        toast({
          title: 'Test Toast',
          description: 'Test description',
          action: {
            label: 'Undo',
            onClick: vi.fn(),
          },
        });
      }).not.toThrow();
    });
  });
});
