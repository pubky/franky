import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSmsVerificationInfo } from './useSmsVerificationInfo';

// Mock @/core
const mockGetSmsVerificationInfo = vi.fn();
vi.mock('@/core', () => ({
  HomegateController: {
    getSmsVerificationInfo: () => mockGetSmsVerificationInfo(),
  },
}));

describe('useSmsVerificationInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null initially while loading', () => {
    mockGetSmsVerificationInfo.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useSmsVerificationInfo());

    expect(result.current).toBeNull();
  });

  it('returns available: true when SMS verification is available', async () => {
    mockGetSmsVerificationInfo.mockResolvedValue({ available: true });

    const { result } = renderHook(() => useSmsVerificationInfo());

    await waitFor(() => {
      expect(result.current).toEqual({ available: true });
    });
  });

  it('returns available: false when SMS verification is geoblocked', async () => {
    mockGetSmsVerificationInfo.mockResolvedValue({ available: false });

    const { result } = renderHook(() => useSmsVerificationInfo());

    await waitFor(() => {
      expect(result.current).toEqual({ available: false });
    });
  });

  it('returns null when API call fails', async () => {
    mockGetSmsVerificationInfo.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSmsVerificationInfo());

    // Wait for the effect to complete
    await waitFor(() => {
      expect(mockGetSmsVerificationInfo).toHaveBeenCalled();
    });

    // Should remain null on error
    expect(result.current).toBeNull();
  });

  it('calls HomegateController.getSmsVerificationInfo on mount', async () => {
    mockGetSmsVerificationInfo.mockResolvedValue({ available: true });

    renderHook(() => useSmsVerificationInfo());

    await waitFor(() => {
      expect(mockGetSmsVerificationInfo).toHaveBeenCalledTimes(1);
    });
  });
});
