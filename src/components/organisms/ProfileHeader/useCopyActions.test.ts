import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCopyActions } from './useCopyActions';

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
  },
  writable: true,
});

describe('useCopyActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides copy functions', () => {
    const { result } = renderHook(() => useCopyActions({ handle: 'testhandle' }));

    expect(result.current.handleCopyPubky).toBeDefined();
    expect(result.current.handleCopyLink).toBeDefined();
  });

  it('copies pubky handle successfully', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCopyActions({ handle: 'testhandle' }));

    await result.current.handleCopyPubky();

    expect(mockWriteText).toHaveBeenCalledWith('testhandle');
  });

  it('copies profile link successfully', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCopyActions({ handle: 'testhandle' }));

    await result.current.handleCopyLink();

    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/profile/testhandle');
  });

  it('handles copy errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Copy failed'));

    const { result } = renderHook(() => useCopyActions({ handle: 'testhandle' }));

    await result.current.handleCopyPubky();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy pubky:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('handles link copy errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Copy failed'));

    const { result } = renderHook(() => useCopyActions({ handle: 'testhandle' }));

    await result.current.handleCopyLink();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy link:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
