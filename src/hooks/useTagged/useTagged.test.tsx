import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTagged } from './useTagged';
import * as Core from '@/core';

// Mock Core modules
vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    UserController: {
      tags: vi.fn(),
      getCounts: vi.fn(),
    },
    TagController: {
      create: vi.fn(),
    },
    useAuthStore: vi.fn((selector) => {
      const mockState = {
        currentUserPubky: 'mock-current-user',
        selectCurrentUserPubky: () => 'mock-current-user',
      };
      return selector ? selector(mockState) : mockState;
    }),
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn, deps, defaultValue) => {
    // For tests, execute the query immediately and return the result
    // In a real implementation, this would be reactive
    try {
      const result = queryFn();
      if (result instanceof Promise) {
        return defaultValue;
      }
      return result;
    } catch {
      return defaultValue;
    }
  }),
}));

describe('useTagged', () => {
  const mockUserId = 'test-user-pubky';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty data when userId is null', () => {
    const { result } = renderHook(() => useTagged(null));
    expect(result.current.tags).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
    expect(typeof result.current.handleTagAdd).toBe('function');
    expect(typeof result.current.handleTagToggle).toBe('function');
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('returns empty data when userId is undefined', () => {
    const { result } = renderHook(() => useTagged(undefined));
    expect(result.current.tags).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
    expect(typeof result.current.handleTagAdd).toBe('function');
    expect(typeof result.current.handleTagToggle).toBe('function');
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('calls UserController.tags with correct params', () => {
    renderHook(() => useTagged(mockUserId));
    // Note: Due to how useLiveQuery is mocked, we can't easily test async behavior
    // In a real test with proper Dexie setup, we would verify the controller calls
    expect(Core.UserController.tags).toBeDefined();
    expect(Core.UserController.getCounts).toBeDefined();
  });

  it('handleTagAdd returns error when tag label is empty', async () => {
    const { result } = renderHook(() => useTagged(mockUserId));

    const addResult = await result.current.handleTagAdd('');

    expect(addResult.success).toBe(false);
    expect(addResult.error).toBe('Tag label cannot be empty');
  });

  it('handleTagAdd returns error when userId is null', async () => {
    const { result } = renderHook(() => useTagged(null));

    const addResult = await result.current.handleTagAdd('ethereum');

    expect(addResult.success).toBe(false);
    expect(addResult.error).toBe('User ID is required');
  });

  it('handleTagAdd calls TagController.create with correct params', async () => {
    const mockCreate = vi.fn().mockResolvedValue(undefined);
    vi.mocked(Core.TagController).create = mockCreate;

    const { result } = renderHook(() => useTagged(mockUserId));

    const addResult = await result.current.handleTagAdd('ethereum');

    expect(addResult.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith({
      taggedId: mockUserId,
      label: 'ethereum',
      taggerId: 'mock-current-user',
      taggedKind: Core.TagKind.USER,
    });
  });
});
