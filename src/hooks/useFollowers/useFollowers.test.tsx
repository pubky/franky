import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFollowers } from './useFollowers';
import * as Core from '@/core';

// Mock core
vi.mock('@/core', () => ({
  generateTestUserId: vi.fn((index: number) => `test-user-${index}`),
}));

describe('useFollowers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return followers array with mock data', () => {
    const { result } = renderHook(() => useFollowers());

    expect(result.current.followers).toBeDefined();
    expect(Array.isArray(result.current.followers)).toBe(true);
    expect(result.current.followers.length).toBeGreaterThan(0);
  });

  it('should return correct count', () => {
    const { result } = renderHook(() => useFollowers());

    expect(result.current.count).toBe(result.current.followers.length);
    expect(result.current.count).toBe(5);
  });

  it('should return isLoading as false', () => {
    const { result } = renderHook(() => useFollowers());

    expect(result.current.isLoading).toBe(false);
  });

  it('should return onFollow function', () => {
    const { result } = renderHook(() => useFollowers());

    expect(result.current.onFollow).toBeDefined();
    expect(typeof result.current.onFollow).toBe('function');
  });

  it('should return followers with correct structure', () => {
    const { result } = renderHook(() => useFollowers());

    const firstFollower = result.current.followers[0];
    expect(firstFollower).toHaveProperty('id');
    expect(firstFollower).toHaveProperty('name');
    expect(firstFollower).toHaveProperty('bio');
    expect(firstFollower).toHaveProperty('image');
    expect(firstFollower).toHaveProperty('status');
    expect(firstFollower).toHaveProperty('indexed_at');
    expect(firstFollower).toHaveProperty('tags');
    expect(firstFollower).toHaveProperty('stats');
  });

  it('should return followers with tags and stats', () => {
    const { result } = renderHook(() => useFollowers());

    const firstFollower = result.current.followers[0];
    expect(firstFollower.tags).toBeDefined();
    expect(Array.isArray(firstFollower.tags)).toBe(true);
    expect(firstFollower.stats).toBeDefined();
    expect(firstFollower.stats).toHaveProperty('tags');
    expect(firstFollower.stats).toHaveProperty('posts');
  });

  it('should call onFollow without errors', () => {
    const { result } = renderHook(() => useFollowers());
    const testUserId = 'test-user-1' as Core.Pubky;

    expect(() => result.current.onFollow(testUserId)).not.toThrow();
  });

  it('should return consistent counts', () => {
    const { result } = renderHook(() => useFollowers());

    expect(result.current.count).toBe(result.current.followers.length);
  });

  it('should return followers with null images for initials fallback', () => {
    const { result } = renderHook(() => useFollowers());

    result.current.followers.forEach((follower) => {
      expect(follower.image).toBeNull();
    });
  });

  it('should return followers with hardcoded indexed_at', () => {
    const { result } = renderHook(() => useFollowers());

    result.current.followers.forEach((follower) => {
      expect(follower.indexed_at).toBe(1704067200000);
    });
  });
});
