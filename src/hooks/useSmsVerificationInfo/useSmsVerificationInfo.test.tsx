import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSmsVerificationInfo } from './useSmsVerificationInfo';

// Mock @/core
const mockGetSmsVerificationInfo = vi.fn();
const mockGetQueryData = vi.fn();
vi.mock('@/core', () => ({
  HomegateController: {
    getSmsVerificationInfo: () => mockGetSmsVerificationInfo(),
  },
  homegateQueryClient: {
    getQueryData: () => mockGetQueryData(),
  },
}));

describe('useSmsVerificationInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetQueryData.mockReturnValue(undefined); // No cached data by default
  });

  it('returns null initially while loading when no cached data', () => {
    mockGetSmsVerificationInfo.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useSmsVerificationInfo());

    expect(result.current).toBeNull();
  });

  it('returns cached data immediately when available', () => {
    mockGetQueryData.mockReturnValue({ available: true });
    mockGetSmsVerificationInfo.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useSmsVerificationInfo());

    // Should return cached data synchronously, no need to wait
    expect(result.current).toEqual({ available: true });
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

  it('returns available: false when API call fails', async () => {
    mockGetSmsVerificationInfo.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSmsVerificationInfo());

    // Wait for the effect to complete and return unavailable
    await waitFor(() => {
      expect(result.current).toEqual({ available: false });
    });
  });

  it('calls HomegateController.getSmsVerificationInfo on mount', async () => {
    mockGetSmsVerificationInfo.mockResolvedValue({ available: true });

    renderHook(() => useSmsVerificationInfo());

    await waitFor(() => {
      expect(mockGetSmsVerificationInfo).toHaveBeenCalledTimes(1);
    });
  });
});
