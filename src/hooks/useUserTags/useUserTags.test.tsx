import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserTags } from './useUserTags';
import * as Core from '@/core';

// Mock dependencies
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn, deps, defaultValue) => {
    // Execute the query function immediately for testing
    const result = queryFn();
    if (result instanceof Promise) {
      return defaultValue;
    }
    return result;
  }),
}));

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    UserController: {
      tags: vi.fn(),
    },
  };
});

describe('useUserTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when userId is null', () => {
    const { result } = renderHook(() => useUserTags(null));
    expect(result.current).toEqual([]);
  });

  it('should return empty array when userId is undefined', () => {
    const { result } = renderHook(() => useUserTags(undefined));
    expect(result.current).toEqual([]);
  });

  it('should call UserController.tags with correct userId', async () => {
    const mockUserId = 'test-user-id';
    const mockTags = [
      { label: 'developer', taggers_count: 5, taggers: [], relationship: false },
      { label: 'designer', taggers_count: 3, taggers: [], relationship: false },
    ];

    vi.mocked(Core.UserController.tags).mockResolvedValue(mockTags as Core.TagModel[]);

    renderHook(() => useUserTags(mockUserId));

    await waitFor(() => {
      expect(Core.UserController.tags).toHaveBeenCalledWith({ user_id: mockUserId });
    });
  });

  it('should return empty array as default value', () => {
    const { result } = renderHook(() => useUserTags('test-user'));

    // Before query resolves, should return empty array
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toEqual([]);
  });
});
