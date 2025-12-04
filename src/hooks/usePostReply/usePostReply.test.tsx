import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostReply } from './usePostReply';
import * as Core from '@/core';

vi.mock('@/core', () => ({
  useAuthStore: vi.fn(),
  PostController: {
    create: vi.fn(),
  },
}));

const mockUseAuthStore = vi.mocked(Core.useAuthStore);
const mockPostControllerCreate = vi.mocked(Core.PostController.create);

describe('usePostReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue('test-user-id:pubkey');
    mockPostControllerCreate.mockResolvedValue(undefined);
  });

  it('returns initial state with empty replyContent, isSubmitting false, and error null', () => {
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    expect(result.current.replyContent).toBe('');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.setReplyContent).toBe('function');
    expect(typeof result.current.handleReplySubmit).toBe('function');
  });

  it('updates replyContent when setReplyContent is called', () => {
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    expect(result.current.replyContent).toBe('Test reply');
  });

  it('submits reply when handleReplySubmit is called with valid content', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123', onSuccess }));

    act(() => {
      result.current.setReplyContent('Test reply content');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    await waitFor(() => {
      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Test reply content',
        authorId: 'test-user-id:pubkey',
      });
    });

    expect(result.current.replyContent).toBe('');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('does not submit when content is empty', async () => {
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('does not submit when content is only whitespace', async () => {
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('   ');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('does not submit when postId is empty', async () => {
    const { result } = renderHook(() => usePostReply({ postId: '' }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('does not submit when currentUserId is null', async () => {
    mockUseAuthStore.mockReturnValue(null);
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('trims whitespace from content before submission', async () => {
    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('  Test reply content  ');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    await waitFor(() => {
      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Test reply content',
        authorId: 'test-user-id:pubkey',
      });
    });
  });

  it('handles submission errors and sets error state', async () => {
    const error = new Error('Submission failed');
    mockPostControllerCreate.mockRejectedValueOnce(error);
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to submit reply:', error);
      expect(result.current.error).toBe('Failed to post reply. Please try again.');
      expect(result.current.isSubmitting).toBe(false);
    });

    mockConsoleError.mockRestore();
  });

  it('does not call onSuccess when submission fails', async () => {
    const error = new Error('Submission failed');
    mockPostControllerCreate.mockRejectedValueOnce(error);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123', onSuccess }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('sets isSubmitting to true during submission and false after', async () => {
    let resolvePromise: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockPostControllerCreate.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    expect(result.current.isSubmitting).toBe(false);

    // Start submission but don't await
    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleReplySubmit();
    });

    // isSubmitting should be true while the request is pending
    expect(result.current.isSubmitting).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!();
      await submitPromise;
    });

    // isSubmitting should be false after completion
    expect(result.current.isSubmitting).toBe(false);
  });

  it('clears error state on new submission attempt', async () => {
    const error = new Error('Submission failed');
    mockPostControllerCreate.mockRejectedValueOnce(error);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => usePostReply({ postId: 'test-post-123' }));

    act(() => {
      result.current.setReplyContent('Test reply');
    });

    // First submission fails
    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(result.current.error).toBe('Failed to post reply. Please try again.');

    // Set content for second attempt
    act(() => {
      result.current.setReplyContent('Second attempt');
    });

    // Mock successful second attempt
    mockPostControllerCreate.mockResolvedValueOnce(undefined);

    // Second submission should clear error
    await act(async () => {
      await result.current.handleReplySubmit();
    });

    expect(result.current.error).toBeNull();
  });
});
