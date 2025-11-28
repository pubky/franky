import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileConnections, CONNECTION_TYPE } from './useProfileConnections';
import type { Pubky } from '@/core';

describe('useProfileConnections', () => {
  it('returns empty connections array when type is FOLLOWERS', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.onFollow).toBe('function');
  });

  it('returns empty connections array when type is FOLLOWING', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWING));

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.onFollow).toBe('function');
  });

  it('returns empty connections array when type is FRIENDS', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FRIENDS));

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.onFollow).toBe('function');
  });

  it('returns correct count matching connections length', () => {
    const { result: followersResult } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));
    const { result: followingResult } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWING));
    const { result: friendsResult } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FRIENDS));

    expect(followersResult.current.count).toBe(followersResult.current.connections.length);
    expect(followingResult.current.count).toBe(followingResult.current.connections.length);
    expect(friendsResult.current.count).toBe(friendsResult.current.connections.length);
  });

  it('returns empty array regardless of connection type', () => {
    const { result: followersResult } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));
    const { result: followingResult } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWING));
    const { result: friendsResult } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FRIENDS));

    expect(followersResult.current.connections).toEqual([]);
    expect(followingResult.current.connections).toEqual([]);
    expect(friendsResult.current.connections).toEqual([]);
  });

  it('calls onFollow callback with userId', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));
    const testUserId = 'test-user-id' as Pubky;
    const consoleSpy = vi.spyOn(console, 'log');
    result.current.onFollow(testUserId);
    expect(consoleSpy).toHaveBeenCalledWith(`Follow/Unfollow user: ${testUserId}`);
    consoleSpy.mockRestore();
  });
});
