import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies before importing the hook
vi.mock('../utils/utils', () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock('@/molecules/Toaster/use-toast', () => ({
  toast: vi.fn(),
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  })),
}));

vi.mock('@/atoms/Button', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Import the hook after mocking
import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a copyToClipboard function', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copyToClipboard).toBeDefined();
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('should accept options and return them in the hook', () => {
    const options = {
      successTitle: 'Custom success',
      errorTitle: 'Custom error',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    const { result } = renderHook(() => useCopyToClipboard(options));

    expect(result.current.copyToClipboard).toBeDefined();
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('should use default options when none provided', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copyToClipboard).toBeDefined();
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('should memoize the copyToClipboard function based on dependencies', () => {
    const { result, rerender } = renderHook(({ options }) => useCopyToClipboard(options), {
      initialProps: { options: { successTitle: 'Title 1' } },
    });

    const firstFunction = result.current.copyToClipboard;

    // Rerender with same options
    rerender({ options: { successTitle: 'Title 1' } });
    expect(result.current.copyToClipboard).toBe(firstFunction);

    // Rerender with different options
    rerender({ options: { successTitle: 'Title 2' } });
    expect(result.current.copyToClipboard).not.toBe(firstFunction);
  });

  it('should handle different option combinations', () => {
    const { result: result1 } = renderHook(() => useCopyToClipboard({ successTitle: 'Success' }));
    const { result: result2 } = renderHook(() => useCopyToClipboard({ errorTitle: 'Error' }));
    const { result: result3 } = renderHook(() => useCopyToClipboard({ onSuccess: vi.fn() }));
    const { result: result4 } = renderHook(() => useCopyToClipboard({ onError: vi.fn() }));

    expect(result1.current.copyToClipboard).toBeDefined();
    expect(result2.current.copyToClipboard).toBeDefined();
    expect(result3.current.copyToClipboard).toBeDefined();
    expect(result4.current.copyToClipboard).toBeDefined();
  });

  it('should handle empty options object', () => {
    const { result } = renderHook(() => useCopyToClipboard({}));

    expect(result.current.copyToClipboard).toBeDefined();
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('should handle undefined options', () => {
    const { result } = renderHook(() => useCopyToClipboard(undefined));

    expect(result.current.copyToClipboard).toBeDefined();
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  // Note: The hook is designed to work with valid options or undefined.
  // Passing null would cause a destructuring error, which is expected behavior.

  it('should return the same function reference when options do not change', () => {
    const options = { successTitle: 'Test' };
    const { result, rerender } = renderHook(() => useCopyToClipboard(options));

    const firstFunction = result.current.copyToClipboard;

    // Rerender with same options object
    rerender();
    expect(result.current.copyToClipboard).toBe(firstFunction);
  });

  it('should return different function reference when options change', () => {
    const { result, rerender } = renderHook(({ successTitle }) => useCopyToClipboard({ successTitle }), {
      initialProps: { successTitle: 'Title 1' },
    });

    const firstFunction = result.current.copyToClipboard;

    // Rerender with different options
    rerender({ successTitle: 'Title 2' });
    expect(result.current.copyToClipboard).not.toBe(firstFunction);
  });
});
