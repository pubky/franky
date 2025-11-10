import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostAction } from './usePostAction';
import { POST_ACTION_VARIANT } from '@/shared/postActionVariants';
import * as Core from '@/core';

vi.mock('@/core', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { selectCurrentUserPubky: () => 'test-user-id:pubkey' };
    return selector(state);
  }),
  PostController: {
    create: vi.fn(),
  },
}));

const mockUseAuthStore = vi.mocked(Core.useAuthStore);
const mockPostControllerCreate = vi.mocked(Core.PostController.create);

describe('usePostAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue('test-user-id:pubkey');
    mockPostControllerCreate.mockResolvedValue(undefined);
  });

  describe('Initial state', () => {
    it('returns initial state with empty content', () => {
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW }));

      expect(result.current.content).toBe('');
      expect(typeof result.current.setContent).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('Content management', () => {
    it('updates content when setContent is called', () => {
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW }));

      act(() => {
        result.current.setContent('Test content');
      });

      expect(result.current.content).toBe('Test content');
    });
  });

  describe('Reply variant', () => {
    it('submits reply when handleSubmit is called with valid content', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostAction({ variant: POST_ACTION_VARIANT.REPLY, postId: 'test-post-123', onSuccess }),
      );

      act(() => {
        result.current.setContent('Test reply content');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockPostControllerCreate).toHaveBeenCalledWith({
          parentPostId: 'test-post-123',
          content: 'Test reply content',
          authorId: 'test-user-id:pubkey',
        });
      });

      expect(result.current.content).toBe('');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('does not submit when content is empty', async () => {
      const { result } = renderHook(() =>
        usePostAction({ variant: POST_ACTION_VARIANT.REPLY, postId: 'test-post-123' }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('does not submit when postId is missing', async () => {
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.REPLY }));

      act(() => {
        result.current.setContent('Test reply');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });
  });

  describe('Repost variant', () => {
    it('submits repost when handleSubmit is called', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostAction({ variant: POST_ACTION_VARIANT.REPOST, postId: 'test-post-123', onSuccess }),
      );

      act(() => {
        result.current.setContent('Test repost comment');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockPostControllerCreate).toHaveBeenCalledWith({
          originalPostId: 'test-post-123',
          content: 'Test repost comment',
          authorId: 'test-user-id:pubkey',
        });
      });

      expect(result.current.content).toBe('');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('allows empty content for repost', async () => {
      const { result } = renderHook(() =>
        usePostAction({ variant: POST_ACTION_VARIANT.REPOST, postId: 'test-post-123' }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockPostControllerCreate).toHaveBeenCalledWith({
          originalPostId: 'test-post-123',
          content: '',
          authorId: 'test-user-id:pubkey',
        });
      });
    });

    it('does not submit when postId is missing', async () => {
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.REPOST }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });
  });

  describe('New post variant', () => {
    it('submits new post when handleSubmit is called with valid content', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW, onSuccess }));

      act(() => {
        result.current.setContent('Test post content');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockPostControllerCreate).toHaveBeenCalledWith({
          content: 'Test post content',
          authorId: 'test-user-id:pubkey',
        });
      });

      expect(result.current.content).toBe('');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('does not submit when content is empty', async () => {
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });
  });

  describe('Common behavior', () => {
    it('does not submit when currentUserId is null', async () => {
      mockUseAuthStore.mockReturnValue(null);
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW }));

      act(() => {
        result.current.setContent('Test content');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('trims whitespace from content before submission', async () => {
      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW }));

      act(() => {
        result.current.setContent('  Test content  ');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockPostControllerCreate).toHaveBeenCalledWith({
          content: 'Test content',
          authorId: 'test-user-id:pubkey',
        });
      });
    });

    it('handles submission errors', async () => {
      const error = new Error('Submission failed');
      mockPostControllerCreate.mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => usePostAction({ variant: POST_ACTION_VARIANT.NEW }));

      act(() => {
        result.current.setContent('Test content');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to submit new:', error);
      });

      // Content should not be cleared on error
      expect(result.current.content).toBe('Test content');

      consoleSpy.mockRestore();
    });
  });
});
