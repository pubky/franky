import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePost } from './usePost';

// Hoist mock data and functions
const { mockCurrentUserId, setMockCurrentUserId, mockPostControllerCreate, mockToast, mockLoggerError } = vi.hoisted(
  () => {
    const userId = { current: 'test-user-id' as string | null };
    const postControllerCreate = vi.fn();
    const toast = vi.fn();
    const loggerError = vi.fn();
    return {
      mockCurrentUserId: userId,
      setMockCurrentUserId: (value: string | null) => {
        userId.current = value;
      },
      mockPostControllerCreate: postControllerCreate,
      mockToast: toast,
      mockLoggerError: loggerError,
    };
  },
);

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    PostController: {
      commitCreate: mockPostControllerCreate,
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

// Mock Libs
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return {
    ...actual,
    Logger: {
      ...actual.Logger,
      error: mockLoggerError,
    },
  };
});

describe('usePost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockCurrentUserId('test-user-id');
    mockPostControllerCreate.mockResolvedValue(undefined);
  });

  describe('Initial State', () => {
    it('should return initial state with empty content', () => {
      const { result } = renderHook(() => usePost());

      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(result.current.attachments).toEqual([]);
      expect(result.current.isSubmitting).toBe(false);
      expect(typeof result.current.setContent).toBe('function');
      expect(typeof result.current.setTags).toBe('function');
      expect(typeof result.current.setAttachments).toBe('function');
      expect(typeof result.current.reply).toBe('function');
      expect(typeof result.current.post).toBe('function');
      expect(typeof result.current.repost).toBe('function');
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

  describe('setAttachments', () => {
    it('should update attachments when setAttachments is called', () => {
      const { result } = renderHook(() => usePost());
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.setAttachments([mockFile]);
      });

      expect(result.current.attachments).toEqual([mockFile]);
    });

    it('should update attachments multiple times', () => {
      const { result } = renderHook(() => usePost());
      const mockFile1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const mockFile2 = new File(['test2'], 'test2.png', { type: 'image/png' });

      act(() => {
        result.current.setAttachments([mockFile1]);
      });
      expect(result.current.attachments).toEqual([mockFile1]);

      act(() => {
        result.current.setAttachments([mockFile1, mockFile2]);
      });
      expect(result.current.attachments).toEqual([mockFile1, mockFile2]);
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
        attachments: undefined,
      });
      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(result.current.attachments).toEqual([]);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Reply posted',
        description: 'Your reply has been posted successfully.',
      });
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
        attachments: undefined,
      });
    });

    it('should create a reply with attachments successfully', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.setContent('Reply with attachment');
        result.current.setAttachments([mockFile]);
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Reply with attachment',
        authorId: 'test-user-id',
        tags: undefined,
        attachments: [mockFile],
      });
      expect(result.current.attachments).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should not submit reply when content is empty and no attachments', async () => {
      const { result } = renderHook(() => usePost());

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit reply when content is only whitespace and no attachments', async () => {
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

    it('should create a reply with attachments but no content', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.setContent('');
        result.current.setAttachments([mockFile]);
      });

      await act(async () => {
        await result.current.reply({
          postId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: '',
        authorId: 'test-user-id',
        tags: undefined,
        attachments: [mockFile],
      });
      expect(result.current.attachments).toEqual([]);
      expect(result.current.content).toBe('');
      expect(mockOnSuccess).toHaveBeenCalled();
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

      expect(mockLoggerError).toHaveBeenCalledWith('[usePost] Failed to submit reply:', mockError);
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

    it('should trim whitespace from content before submitting reply', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('\n\n  Trimmed content  \n\n');
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
        attachments: undefined,
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
        attachments: undefined,
      });
      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(result.current.attachments).toEqual([]);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Post created',
        description: 'Your post has been created successfully.',
      });
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
        attachments: undefined,
      });
    });

    it('should create a post with attachments successfully', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();
      const mockFile1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const mockFile2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.setContent('Post with attachments');
        result.current.setAttachments([mockFile1, mockFile2]);
      });

      await act(async () => {
        await result.current.post({
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        content: 'Post with attachments',
        authorId: 'test-user-id',
        tags: undefined,
        attachments: [mockFile1, mockFile2],
      });
      expect(result.current.attachments).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should not submit post when content is empty and no attachments', async () => {
      const { result } = renderHook(() => usePost());

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit post when content is only whitespace and no attachments', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('   \n\n');
      });

      await act(async () => {
        await result.current.post({
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should create a post with attachments but no content', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.setContent('');
        result.current.setAttachments([mockFile]);
      });

      await act(async () => {
        await result.current.post({
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        content: '',
        authorId: 'test-user-id',
        tags: undefined,
        attachments: [mockFile],
      });
      expect(result.current.attachments).toEqual([]);
      expect(result.current.content).toBe('');
      expect(mockOnSuccess).toHaveBeenCalled();
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

      expect(mockLoggerError).toHaveBeenCalledWith('[usePost] Failed to create post:', mockError);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.content).toBe('Post content'); // Content should not be cleared on error
    });

    it('should set isSubmitting to true during post submission and set to false after submission', async () => {
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

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
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
        attachments: undefined,
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

  describe('repost method', () => {
    it('should be an async function', () => {
      const { result } = renderHook(() => usePost());

      expect(typeof result.current.repost).toBe('function');
    });

    it('should create a repost successfully with content (quote repost)', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();

      act(() => {
        result.current.setContent('This is great!');
        result.current.setTags(['tag1']);
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        originalPostId: 'test-post-123',
        content: 'This is great!',
        authorId: 'test-user-id',
        tags: ['tag1'],
      });
      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should create a repost successfully without content (simple repost)', async () => {
      const { result } = renderHook(() => usePost());
      const mockOnSuccess = vi.fn();

      act(() => {
        result.current.setContent('');
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: 'test-post-123',
          onSuccess: mockOnSuccess,
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        originalPostId: 'test-post-123',
        content: '',
        authorId: 'test-user-id',
        tags: undefined,
      });
      expect(result.current.content).toBe('');
      expect(result.current.tags).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle repost with empty tags array', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Repost comment');
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        originalPostId: 'test-post-123',
        content: 'Repost comment',
        authorId: 'test-user-id',
        tags: undefined,
      });
    });

    it('should not submit repost when originalPostId is missing', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Repost content');
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: '',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should not submit repost when currentUserId is null', async () => {
      setMockCurrentUserId(null);
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('Repost content');
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).not.toHaveBeenCalled();
    });

    it('should handle repost error and show toast', async () => {
      const { result } = renderHook(() => usePost());
      const mockError = new Error('Failed to create repost');
      mockPostControllerCreate.mockRejectedValueOnce(mockError);

      act(() => {
        result.current.setContent('Repost content');
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      // Toast should be called directly in catch block
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to repost. Please try again.',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });

      expect(mockLoggerError).toHaveBeenCalledWith('[usePost] Failed to repost:', mockError);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.content).toBe('Repost content'); // Content should not be cleared on error
    });

    it('should set isSubmitting to true during repost submission', async () => {
      const { result } = renderHook(() => usePost());
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockPostControllerCreate.mockReturnValueOnce(promise);

      act(() => {
        result.current.setContent('Repost content');
      });

      act(() => {
        result.current.repost({
          originalPostId: 'test-post-123',
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

    it('should trim content before submitting repost', async () => {
      const { result } = renderHook(() => usePost());

      act(() => {
        result.current.setContent('  Trimmed repost content  ');
      });

      await act(async () => {
        await result.current.repost({
          originalPostId: 'test-post-123',
          onSuccess: vi.fn(),
        });
      });

      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        originalPostId: 'test-post-123',
        content: 'Trimmed repost content',
        authorId: 'test-user-id',
        tags: undefined,
      });
    });
  });
});
