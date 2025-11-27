import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileConnections, CONNECTION_TYPE } from './useProfileConnections';

describe('useProfileConnections', () => {
  it('returns followers connections when type is FOLLOWERS', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    expect(result.current.connections).toHaveLength(3);
    expect(result.current.connections[0].name).toBe('Matt Jones');
    expect(result.current.connections[1].name).toBe('Carl Smith');
    expect(result.current.connections[2].name).toBe('Username');
    expect(result.current.count).toBe(3);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.onFollow).toBe('function');
  });

  it('returns following connections when type is FOLLOWING', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWING));

    expect(result.current.connections).toHaveLength(4);
    expect(result.current.connections[0].name).toBe('Satoshi Nakamoto');
    expect(result.current.connections[1].name).toBe('Vitalik Buterin');
    expect(result.current.connections[2].name).toBe('Hal Finney');
    expect(result.current.connections[3].name).toBe('Nick Szabo');
    expect(result.current.count).toBe(4);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.onFollow).toBe('function');
  });

  it('returns friends connections when type is FRIENDS', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FRIENDS));

    expect(result.current.connections).toHaveLength(2);
    expect(result.current.connections[0].name).toBe('Alice Crypto');
    expect(result.current.connections[1].name).toBe('Bob Hodler');
    expect(result.current.count).toBe(2);
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

  it('returns connections with required properties', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    result.current.connections.forEach((connection) => {
      expect(connection).toHaveProperty('id');
      expect(connection).toHaveProperty('name');
      expect(connection).toHaveProperty('bio');
      expect(connection).toHaveProperty('status');
      expect(connection).toHaveProperty('indexed_at');
    });
  });

  it('returns connections with optional tags and stats', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    result.current.connections.forEach((connection) => {
      if (connection.tags) {
        expect(Array.isArray(connection.tags)).toBe(true);
      }
      if (connection.stats) {
        expect(connection.stats).toHaveProperty('tags');
        expect(connection.stats).toHaveProperty('posts');
      }
    });
  });

  it('calls onFollow callback when provided', () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));
    const testUserId = result.current.connections[0].id;
    const consoleSpy = vi.spyOn(console, 'log');
    result.current.onFollow(testUserId);
    expect(consoleSpy).toHaveBeenCalledWith(`Follow/Unfollow user: ${testUserId}`);
    consoleSpy.mockRestore();
  });
});
