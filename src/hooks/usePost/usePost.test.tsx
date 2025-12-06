import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePost } from './usePost';

// Hoist mock data and functions
const { mockCurrentUserId, setMockCurrentUserId, mockPostControllerCreate, mockToast } = vi.hoisted(() => {
  const userId = { current: 'test-user-id' as string | null };
  const postControllerCreate = vi.fn();
  const toast = vi.fn();
  return {
    mockCurrentUserId: userId,
    setMockCurrentUserId: (value: string | null) => {
      userId.current = value;
    },
    mockPostControllerCreate: postControllerCreate,
    mockToast: toast,
  };
});

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    PostController: {
      create: mockPostControllerCreate,
    },
    useAuthStore: vi.fn((selector) => {
      const state = {
        selectCurrentUserPubky: () => mockCurrentUserId.current,
      };
      return selector ? selector(state) : state;
    }),
  };
});

// Mock Molecules
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    useToast: vi.fn(() => ({
      toast: mockToast,
    })),
  };
});

// Mock console.error to avoid noise in test output
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('usePost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockCurrentUserId('test-user-id');
    mockPostControllerCreate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockConsoleError.mockClear();
  });

  describe('Initial State', () => {
    it('should return initial state with empty content', () => {
      const { result } = renderHook(() => usePost());

      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(result.current.isSubmitting).toBe(false);
      expect(typeof result.current.setContent).toBe('function');
      expect(typeof result.current.setTags).toBe('function');
      expect(typeof result.current.reply).toBe('function');
      expect(typeof result.current.post).toBe('function');
    });
  });

  describe('setContent', () => {
    it('should update content when setContent is called', () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('New content');
      });

      expect(result.current.content).toBe('New content');
    });

    it('should update content multiple times', () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('First');
      });
      expect(result.current.content).toBe('First');

      act(() => {
        result.current.setContent('Second');
      });
      expect(result.current.content).toBe('Second');
    });
  });

  describe('reply method', () => {
    it('should be an async function', () => {
      const { result } = renderHook(() => usePost());

      expect(typeof result.current.reply).toBe('function');
    });

    it('should create a reply successfully', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();

      act(() => {
        result.current.setContent('Reply content');
        result.current.setTags(['tag1', 'tag2']);
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Reply content',
        authorId: 'test-user-id',
        tags: ['tag1', 'tag2'],
      });
      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle reply with empty tags array', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Reply without tags');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Reply without tags',
        authorId: 'test-user-id',
        tags: undefined,
      });
    });

    it('should not submit reply when content is empty', async () => {
      const { result } = renderHook(() => usePost());

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit reply when content is only whitespace', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('   ');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit reply when currentUserId is null', async () => {
      setMockCurrentUserId(null);
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Reply content');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should handle reply error and show toast', async () => {
      const { result } = renderHook(() => usePost());
      const mockError = new Error('Failed to create reply');
      mockPostControllerCreate.mockRejectedValueOnce(mockError);

      act(() => {
        result.current.setContent('Reply content');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      // Toast should be called directly in catch block
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to submit reply:', mockError);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.content).toBe('Reply content'); // Content should not be cleared on error
    });

    it('should set isSubmitting to true during reply submission', async () => {
      const { result } = renderHook(() => usePost());
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockPostControllerCreate.mockReturnValueOnce(promise);

      act(() => {
        result.current.setContent('Reply content');
      });

      act(() => {
        result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      await act(async () => {
        resolvePromise!();
        await promise;
      });
    });

    it('should trim content before submitting reply', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('  Trimmed content  ');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Trimmed content',
        authorId: 'test-user-id',
        tags: undefined,
      });
    });
  });

  describe('post method', () => {
    it('should be an async function', () => {
      const { result } = renderHook(() => usePost());

      expect(typeof result.current.post).toBe('function');
    });

    it('should create a post successfully', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();

      act(() => {
        result.current.setContent('Post content');
        result.current.setTags(['tag1']);
      });

      await act(async () => {
        await result.current.post({
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        content: 'Post content',
        authorId: 'test-user-id',
        tags: ['tag1'],
      });
      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle post with empty tags array', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Post without tags');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        content: 'Post without tags',
        authorId: 'test-user-id',
        tags: undefined,
      });
    });

    it('should not submit post when content is empty', async () => {
      const { result } = renderHook(() => usePost());

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit post when content is only whitespace', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('   ');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit post when currentUserId is null', async () => {
      setMockCurrentUserId(null);
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Post content');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should handle post error and show toast', async () => {
      const { result } = renderHook(() => usePost());
      const mockError = new Error('Failed to create post');
      mockPostControllerCreate.mockRejectedValueOnce(mockError);

      act(() => {
        result.current.setContent('Post content');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      // Toast should be called directly in catch block
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to create post:', mockError);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.content).toBe('Post content'); // Content should not be cleared on error
    });

    it('should set isSubmitting to true during post submission', async () => {
      const { result } = renderHook(() => usePost());
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockPostControllerCreate.mockReturnValueOnce(promise);

      act(() => {
        result.current.setContent('Post content');
      });

      act(() => {
        result.current.post({
          onSuccess: vi.fn(),
        });
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      await act(async () => {
        resolvePromise!();
        await promise;
      });
    });

    it('should trim content before submitting post', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('  Trimmed content  ');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        content: 'Trimmed content',
        authorId: 'test-user-id',
        tags: undefined,
      });
    });
  });

  describe('Error handling and toast', () => {
    it('should display toast when error is set', async () => {
      const { result } = renderHook(() => usePost());
      mockPostControllerCreate.mockRejectedValueOnce(new Error('Test error'));

      act(() => {
        result.current.setContent('Test content');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to create post. Please try again.',
          className: 'destructive border-destructive bg-destructive text-destructive-foreground',
        });
      });
    });

    it('should display toast for reply errors', async () => {
      const { result } = renderHook(() => usePost());
      mockPostControllerCreate.mockRejectedValueOnce(new Error('Reply error'));

      act(() => {
        result.current.setContent('Reply content');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to post reply. Please try again.',
          className: 'destructive border-destructive bg-destructive text-destructive-foreground',
        });
      });
    });
  });

  describe('onSuccess callback', () => {
    it('should call onSuccess after successful reply', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();

      act(() => {
        result.current.setContent('Reply content');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess after successful post', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();

      act(() => {
        result.current.setContent('Post content');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('should not call onSuccess when reply fails', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();
      mockPostControllerCreate.mockRejectedValueOnce(new Error('Test error'));

      act(() => {
        result.current.setContent('Reply content');
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should not call onSuccess when post fails', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();
      mockPostControllerCreate.mockRejectedValueOnce(new Error('Test error'));

      act(() => {
        result.current.setContent('Post content');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle missing onSuccess callback gracefully', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Post content');
      });

      await act(async () => {
        await result.current.post({});
      });

      expect(mockPostControllerCreate).toHaveBeenCalled();
      expect(result.current.content).toBe('');
    });
  });
});
