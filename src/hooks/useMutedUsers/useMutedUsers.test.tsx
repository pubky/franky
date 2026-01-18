import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMutedUsers } from './useMutedUsers';

const { mockUseLiveQuery } = vi.hoisted(() => ({
  mockUseLiveQuery: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => mockUseLiveQuery(...args),
}));

describe('useMutedUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state when stream is undefined', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useMutedUsers());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.mutedUserIds).toEqual([]);
    expect(result.current.isMuted('user-1')).toBe(false);
  });

  it('returns empty list when stream is null', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { result } = renderHook(() => useMutedUsers());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.mutedUserIds).toEqual([]);
  });

  it('returns muted ids and isMuted lookup', () => {
    mockUseLiveQuery.mockReturnValue({ stream: ['user-1', 'user-2'] });

    const { result } = renderHook(() => useMutedUsers());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.mutedUserIds).toEqual(['user-1', 'user-2']);
    expect(result.current.isMuted('user-1')).toBe(true);
    expect(result.current.isMuted('user-3')).toBe(false);
  });
});
