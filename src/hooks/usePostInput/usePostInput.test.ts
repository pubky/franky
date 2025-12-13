import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostInput } from './usePostInput';
import { POST_INPUT_VARIANT, POST_INPUT_PLACEHOLDER } from '@/organisms/PostInput/PostInput.constants';

// Mock config
vi.mock('@/config', () => ({
  POST_MAX_CHARACTER_LENGTH: 100,
}));

// Mock usePost hook
const mockSetContent = vi.fn();
const mockSetTags = vi.fn();
const mockReply = vi.fn();
const mockPost = vi.fn();
let mockContent = '';
let mockTags: string[] = [];
let mockIsSubmitting = false;

vi.mock('@/hooks', () => ({
  useCurrentUserProfile: vi.fn(() => ({
    currentUserPubky: 'test-user-pubky',
  })),
  usePost: vi.fn(() => ({
    content: mockContent,
    setContent: mockSetContent,
    tags: mockTags,
    setTags: mockSetTags,
    reply: mockReply,
    post: mockPost,
    isSubmitting: mockIsSubmitting,
  })),
  useEmojiInsert: vi.fn(() => vi.fn()),
}));

// Mock TimelineFeed context
const mockPrependPosts = vi.fn();
vi.mock('@/organisms/TimelineFeed/TimelineFeed', () => ({
  useTimelineFeedContext: vi.fn(() => ({
    prependPosts: mockPrependPosts,
  })),
}));

describe('usePostInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContent = '';
    mockTags = [];
    mockIsSubmitting = false;
  });

  describe('initial state', () => {
    it('returns initial state with collapsed mode by default', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.isExpanded).toBe(false);
      expect(result.current.showEmojiPicker).toBe(false);
      expect(result.current.hasContent).toBe(false);
      expect(result.current.currentUserPubky).toBe('test-user-pubky');
    });

    it('returns initial state with expanded mode when expanded=true', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
          expanded: true,
        }),
      );

      expect(result.current.isExpanded).toBe(true);
    });

    it('returns correct refs', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.textareaRef).toBeDefined();
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.textareaRef.current).toBeNull();
      expect(result.current.containerRef.current).toBeNull();
    });
  });

  describe('displayPlaceholder', () => {
    it('uses default placeholder for post variant', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.displayPlaceholder).toBe(POST_INPUT_PLACEHOLDER[POST_INPUT_VARIANT.POST]);
    });

    it('uses default placeholder for reply variant', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'reply',
          postId: 'test-post-id',
        }),
      );

      expect(result.current.displayPlaceholder).toBe(POST_INPUT_PLACEHOLDER[POST_INPUT_VARIANT.REPLY]);
    });

    it('uses custom placeholder when provided', () => {
      const customPlaceholder = 'Custom placeholder text';
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
          placeholder: customPlaceholder,
        }),
      );

      expect(result.current.displayPlaceholder).toBe(customPlaceholder);
    });
  });

  describe('handleExpand', () => {
    it('expands when not already expanded', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.isExpanded).toBe(false);

      act(() => {
        result.current.handleExpand();
      });

      expect(result.current.isExpanded).toBe(true);
    });

    it('does not change state when already expanded', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
          expanded: true,
        }),
      );

      expect(result.current.isExpanded).toBe(true);

      act(() => {
        result.current.handleExpand();
      });

      expect(result.current.isExpanded).toBe(true);
    });
  });

  describe('handleChange', () => {
    it('calls setContent when value is within character limit', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const mockEvent = {
        target: { value: 'Hello world' },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(mockSetContent).toHaveBeenCalledWith('Hello world');
    });

    it('does not call setContent when value exceeds character limit', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      // Create a string longer than 100 characters (mocked limit)
      const longText = 'a'.repeat(101);
      const mockEvent = {
        target: { value: longText },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(mockSetContent).not.toHaveBeenCalled();
    });

    it('allows exactly at the character limit', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      // Create a string exactly 100 characters (mocked limit)
      const exactLimitText = 'a'.repeat(100);
      const mockEvent = {
        target: { value: exactLimitText },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(mockSetContent).toHaveBeenCalledWith(exactLimitText);
    });
  });

  describe('handleSubmit', () => {
    it('calls post method for post variant', async () => {
      mockContent = 'Test post content';

      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPost).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
      });
      expect(mockReply).not.toHaveBeenCalled();
    });

    it('calls reply method for reply variant with postId', async () => {
      mockContent = 'Test reply content';

      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'reply',
          postId: 'parent-post-id',
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockReply).toHaveBeenCalledWith({
        postId: 'parent-post-id',
        onSuccess: expect.any(Function),
      });
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('does not submit when content is empty', async () => {
      mockContent = '';

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPost).not.toHaveBeenCalled();
      expect(mockReply).not.toHaveBeenCalled();
    });

    it('does not submit when content is only whitespace', async () => {
      mockContent = '   \n\t  ';

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('does not submit when already submitting', async () => {
      mockContent = 'Test content';
      mockIsSubmitting = true;

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('calls onSuccess and prependPosts when submission succeeds', async () => {
      mockContent = 'Test content';
      mockPost.mockImplementation(async ({ onSuccess }) => {
        onSuccess('created-post-id');
      });

      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPrependPosts).toHaveBeenCalledWith('created-post-id');
      expect(mockOnSuccess).toHaveBeenCalledWith('created-post-id');
    });
  });

  describe('onContentChange callback', () => {
    it('calls onContentChange when content changes', () => {
      const mockOnContentChange = vi.fn();

      renderHook(() =>
        usePostInput({
          variant: 'post',
          onContentChange: mockOnContentChange,
        }),
      );

      // The effect runs on mount with initial content and tags
      expect(mockOnContentChange).toHaveBeenCalledWith('', []);
    });

    it('calls onContentChange with updated content and tags', () => {
      const mockOnContentChange = vi.fn();
      mockContent = 'Updated content';
      mockTags = ['tag1', 'tag2'];

      renderHook(() =>
        usePostInput({
          variant: 'post',
          onContentChange: mockOnContentChange,
        }),
      );

      expect(mockOnContentChange).toHaveBeenCalledWith('Updated content', ['tag1', 'tag2']);
    });

    it('does not throw when onContentChange is not provided', () => {
      expect(() => {
        renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );
      }).not.toThrow();
    });
  });

  describe('hasContent derived value', () => {
    it('returns false when content is empty', () => {
      mockContent = '';

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.hasContent).toBe(false);
    });

    it('returns false when content is only whitespace', () => {
      mockContent = '   \n\t  ';

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.hasContent).toBe(false);
    });

    it('returns true when content has non-whitespace characters', () => {
      mockContent = 'Hello';

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.hasContent).toBe(true);
    });
  });

  describe('showEmojiPicker state', () => {
    it('can toggle emoji picker visibility', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.showEmojiPicker).toBe(false);

      act(() => {
        result.current.setShowEmojiPicker(true);
      });

      expect(result.current.showEmojiPicker).toBe(true);

      act(() => {
        result.current.setShowEmojiPicker(false);
      });

      expect(result.current.showEmojiPicker).toBe(false);
    });
  });

  describe('click outside collapse behavior', () => {
    it('adds event listener when expanded prop is false', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() =>
        usePostInput({
          variant: 'post',
          expanded: false,
        }),
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('does not add event listener when expanded prop is true', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() =>
        usePostInput({
          variant: 'post',
          expanded: true,
        }),
      );

      // Should not have mousedown listener for click outside
      const mousedownCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === 'mousedown');
      expect(mousedownCalls).toHaveLength(0);

      addEventListenerSpy.mockRestore();
    });

    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        usePostInput({
          variant: 'post',
          expanded: false,
        }),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('setTags passthrough', () => {
    it('exposes setTags from usePost', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.setTags).toBe(mockSetTags);
    });
  });
});
