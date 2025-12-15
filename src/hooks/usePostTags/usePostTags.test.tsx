import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePostTags } from './usePostTags';

// Mock Core module
vi.mock('@/core', () => ({
  useAuthStore: vi.fn(() => vi.fn(() => 'mock-user-id')),
  PostController: {
    getPostTags: vi.fn().mockResolvedValue([]),
  },
  TagController: {
    commitCreate: vi.fn().mockResolvedValue(undefined),
    commitDelete: vi.fn().mockResolvedValue(undefined),
  },
  TagKind: {
    POST: 'post',
    USER: 'user',
  },
  FileController: {
    getAvatarUrl: vi.fn((id: string) => `https://avatar.test/${id}`),
  },
}));

// Mock dexie-react-hooks - returns undefined for loading state
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => undefined),
}));

// Mock toast
vi.mock('@/molecules/Toaster/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock tag transformation utilities
vi.mock('@/molecules/TaggedItem/TaggedItem.utils', () => ({
  transformTagWithAvatars: vi.fn((tag) => ({
    ...tag,
    taggers: tag.taggers?.map((id: string) => ({ id, avatarUrl: `https://avatar.test/${id}` })) ?? [],
  })),
  transformTagsForViewer: vi.fn((tags) =>
    tags
      .filter((tag: { label?: string }) => tag.label)
      .map((tag: { label: string; taggers?: string[] }) => ({
        ...tag,
        taggers: tag.taggers?.map((id: string) => ({ id, avatarUrl: `https://avatar.test/${id}` })) ?? [],
      })),
  ),
}));

describe('usePostTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return loading state initially', () => {
      const { result } = renderHook(() => usePostTags('author:post123'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.tags).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it('should return empty tags when postId is null', () => {
      const { result } = renderHook(() => usePostTags(null));

      expect(result.current.tags).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it('should return empty tags when postId is undefined', () => {
      const { result } = renderHook(() => usePostTags(undefined));

      expect(result.current.tags).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it('should return empty tags when no tags exist', async () => {
      const { result } = renderHook(() => usePostTags('author:post123'));

      await waitFor(() => {
        expect(result.current.tags).toEqual([]);
        expect(result.current.count).toBe(0);
      });
    });
  });

  describe('handleTagAdd', () => {
    it('should return error for empty tag label', async () => {
      const { result } = renderHook(() => usePostTags('author:post123'));

      const response = await result.current.handleTagAdd('');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Tag label cannot be empty');
    });

    it('should return error when not logged in', async () => {
      // Mock useAuthStore to return null (not logged in)
      const dexieHooks = await import('dexie-react-hooks');
      const Core = await import('@/core');

      vi.mocked(Core.useAuthStore).mockImplementation(() => null);
      vi.mocked(dexieHooks.useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => usePostTags('author:post123'));

      const response = await result.current.handleTagAdd('test-tag');

      expect(response.success).toBe(false);
      expect(response.error).toBe('You must be logged in to add tags');
    });
  });

  describe('handleTagToggle', () => {
    it('should not throw when postId is null', async () => {
      const { result } = renderHook(() => usePostTags(null));

      await expect(result.current.handleTagToggle({ label: 'test' })).resolves.not.toThrow();
    });
  });
});
