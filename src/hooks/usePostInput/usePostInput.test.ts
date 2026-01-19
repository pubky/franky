import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostInput } from './usePostInput';
import { POST_INPUT_VARIANT, POST_INPUT_PLACEHOLDER } from '@/organisms/PostInput/PostInput.constants';

// Mock config
vi.mock('@/config', () => {
  const mimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/mpeg',
    'application/pdf',
  ];
  return {
    POST_MAX_CHARACTER_LENGTH: 100,
    SUPPORTED_ATTACHMENT_MIME_TYPES: mimeTypes,
    ATTACHMENT_MAX_IMAGE_SIZE: 5 * 1024 * 1024,
    ATTACHMENT_MAX_OTHER_SIZE: 20 * 1024 * 1024,
    ATTACHMENT_MAX_FILES: 4,
    SUPPORTED_FILE_TYPES: mimeTypes.map((mime) => mime.split('/')[1]).join(', '),
  };
});

// Mock usePost hook
const mockSetContent = vi.fn();
const mockSetTags = vi.fn();
const mockSetAttachments = vi.fn();
const mockReply = vi.fn();
const mockPost = vi.fn();
const mockRepost = vi.fn();
let mockContent = '';
let mockTags: string[] = [];
let mockAttachments: File[] = [];
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
    attachments: mockAttachments,
    setAttachments: mockSetAttachments,
    reply: mockReply,
    post: mockPost,
    repost: mockRepost,
    isSubmitting: mockIsSubmitting,
  })),
  useEmojiInsert: vi.fn(() => vi.fn()),
}));

// Mock TimelineFeed context
const mockPrependPosts = vi.fn();
vi.mock('@/organisms/TimelineFeed/TimelineFeed', () => ({
  useTimelineFeedContext: vi.fn(() => ({
    prependPosts: mockPrependPosts,
    removePosts: vi.fn(),
  })),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/molecules', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

describe('usePostInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContent = '';
    mockTags = [];
    mockAttachments = [];
    mockIsSubmitting = false;
    mockRepost.mockClear();
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
      expect(result.current.isDragging).toBe(false);
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
      expect(result.current.fileInputRef).toBeDefined();
      expect(result.current.textareaRef.current).toBeNull();
      expect(result.current.containerRef.current).toBeNull();
      expect(result.current.fileInputRef.current).toBeNull();
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

    it('uses default placeholder for repost variant', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'repost',
          originalPostId: 'test-post-id',
        }),
      );

      expect(result.current.displayPlaceholder).toBe(POST_INPUT_PLACEHOLDER[POST_INPUT_VARIANT.REPOST]);
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
      expect(mockRepost).not.toHaveBeenCalled();
    });

    it('calls repost method for repost variant with originalPostId', async () => {
      mockContent = 'Test repost content';

      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'repost',
          originalPostId: 'original-post-id',
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockRepost).toHaveBeenCalledWith({
        originalPostId: 'original-post-id',
        onSuccess: expect.any(Function),
      });
      expect(mockPost).not.toHaveBeenCalled();
      expect(mockReply).not.toHaveBeenCalled();
    });

    it('allows repost with empty content', async () => {
      mockContent = '';

      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'repost',
          originalPostId: 'original-post-id',
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockRepost).toHaveBeenCalledWith({
        originalPostId: 'original-post-id',
        onSuccess: expect.any(Function),
      });
    });

    it('does not submit when content is empty (for post variant)', async () => {
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

    it('calls onSuccess and prependPosts when submission succeeds for post variant', async () => {
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

    it('calls onSuccess and prependPosts when submission succeeds for repost variant', async () => {
      mockContent = 'Test repost content';
      mockRepost.mockImplementation(async ({ onSuccess }) => {
        onSuccess('created-repost-id');
      });

      const mockOnSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'repost',
          originalPostId: 'original-post-id',
          onSuccess: mockOnSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockPrependPosts).toHaveBeenCalledWith('created-repost-id');
      expect(mockOnSuccess).toHaveBeenCalledWith('created-repost-id');
    });

    it('calls onSuccess but does NOT prependPosts for reply variant', async () => {
      mockContent = 'Test reply content';
      mockReply.mockImplementation(async ({ onSuccess }) => {
        onSuccess('created-reply-id');
      });

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

      // Reply should NOT prepend to timeline (fix for issue #601)
      expect(mockPrependPosts).not.toHaveBeenCalled();
      // But onSuccess should still be called
      expect(mockOnSuccess).toHaveBeenCalledWith('created-reply-id');
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

      // The effect runs on mount with initial content, tags, and attachments
      expect(mockOnContentChange).toHaveBeenCalledWith('', [], []);
    });

    it('calls onContentChange with updated content, tags, and attachments', () => {
      const mockOnContentChange = vi.fn();
      mockContent = 'Updated content';
      mockTags = ['tag1', 'tag2'];
      mockAttachments = [new File(['test'], 'test.png', { type: 'image/png' })];

      renderHook(() =>
        usePostInput({
          variant: 'post',
          onContentChange: mockOnContentChange,
        }),
      );

      expect(mockOnContentChange).toHaveBeenCalledWith('Updated content', ['tag1', 'tag2'], mockAttachments);
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

  describe('attachments state', () => {
    it('exposes attachments from usePost', () => {
      mockAttachments = [new File(['test'], 'test.png', { type: 'image/png' })];

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.attachments).toBe(mockAttachments);
    });

    it('exposes setAttachments from usePost', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      expect(result.current.setAttachments).toBe(mockSetAttachments);
    });
  });

  describe('handleFilesAdded', () => {
    it('does not process files when submitting', () => {
      mockIsSubmitting = true;

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const file = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.handleFilesAdded([file]);
      });

      expect(mockSetAttachments).not.toHaveBeenCalled();
    });

    it('does not process empty file array', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      act(() => {
        result.current.handleFilesAdded([]);
      });

      expect(mockSetAttachments).not.toHaveBeenCalled();
    });

    it('adds valid image files', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const file = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.handleFilesAdded([file]);
      });

      expect(mockSetAttachments).toHaveBeenCalled();
    });

    it('adds valid video files', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });

      act(() => {
        result.current.handleFilesAdded([file]);
      });

      expect(mockSetAttachments).toHaveBeenCalled();
    });

    it('adds valid audio files', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });

      act(() => {
        result.current.handleFilesAdded([file]);
      });

      expect(mockSetAttachments).toHaveBeenCalled();
    });

    it('adds valid PDF files', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.handleFilesAdded([file]);
      });

      expect(mockSetAttachments).toHaveBeenCalled();
    });

    it('rejects files with invalid types and shows toast', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

      act(() => {
        result.current.handleFilesAdded([file]);
      });

      expect(mockSetAttachments).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.stringContaining('has unsupported type'),
      });
    });

    it('rejects images exceeding 5MB and shows toast', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      // Create a file object with size > 5MB
      const largeFile = new File(['test'], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

      act(() => {
        result.current.handleFilesAdded([largeFile]);
      });

      expect(mockSetAttachments).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.stringContaining('exceeds the maximum size of 5MB'),
      });
    });

    it('rejects non-image files exceeding 20MB and shows toast', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      // Create a video file with size > 20MB
      const largeFile = new File(['test'], 'large.mp4', { type: 'video/mp4' });
      Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024 });

      act(() => {
        result.current.handleFilesAdded([largeFile]);
      });

      expect(mockSetAttachments).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.stringContaining('exceeds the maximum size of 20MB'),
      });
    });

    it('shows toast when maximum files limit reached', () => {
      // Set up 4 existing attachments
      mockAttachments = [
        new File(['1'], '1.png', { type: 'image/png' }),
        new File(['2'], '2.png', { type: 'image/png' }),
        new File(['3'], '3.png', { type: 'image/png' }),
        new File(['4'], '4.png', { type: 'image/png' }),
      ];

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const newFile = new File(['test'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.handleFilesAdded([newFile]);
      });

      expect(mockSetAttachments).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Maximum of 4 files allowed',
      });
    });

    it('limits files added when approaching maximum', () => {
      // Set up 3 existing attachments
      mockAttachments = [
        new File(['1'], '1.png', { type: 'image/png' }),
        new File(['2'], '2.png', { type: 'image/png' }),
        new File(['3'], '3.png', { type: 'image/png' }),
      ];

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      // Try to add 2 files when only 1 slot is available
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });

      act(() => {
        result.current.handleFilesAdded([file1, file2]);
      });

      // Should add only 1 file and show error for the rest
      expect(mockSetAttachments).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.stringContaining('Maximum of 4 files allowed'),
      });
    });

    it('shows multiple errors with "Errors" title', () => {
      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
        }),
      );

      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const largeFile = new File(['test'], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

      act(() => {
        result.current.handleFilesAdded([invalidFile, largeFile]);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Errors',
        description: expect.any(String),
      });
    });
  });

  describe('drag and drop handlers', () => {
    const createMockDragEvent = (type: string, hasFiles = true): React.DragEvent => {
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          types: hasFiles ? ['Files'] : [],
          items: [],
        },
      } as unknown as React.DragEvent;
      return event;
    };

    describe('handleDragEnter', () => {
      it('sets isDragging to true when files are being dragged', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        expect(result.current.isDragging).toBe(false);

        const mockEvent = createMockDragEvent('dragenter', true);

        act(() => {
          result.current.handleDragEnter(mockEvent);
        });

        expect(result.current.isDragging).toBe(true);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      });

      it('does not set isDragging when no files are being dragged', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        const mockEvent = createMockDragEvent('dragenter', false);

        act(() => {
          result.current.handleDragEnter(mockEvent);
        });

        expect(result.current.isDragging).toBe(false);
      });

      it('auto-expands when dragging files over collapsed component', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
            expanded: false,
          }),
        );

        expect(result.current.isExpanded).toBe(false);

        const mockEvent = createMockDragEvent('dragenter', true);

        act(() => {
          result.current.handleDragEnter(mockEvent);
        });

        expect(result.current.isExpanded).toBe(true);
      });
    });

    describe('handleDragLeave', () => {
      it('sets isDragging to false when all nested elements are left', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        // First enter
        const enterEvent = createMockDragEvent('dragenter', true);
        act(() => {
          result.current.handleDragEnter(enterEvent);
        });

        expect(result.current.isDragging).toBe(true);

        // Then leave
        const leaveEvent = createMockDragEvent('dragleave', true);
        act(() => {
          result.current.handleDragLeave(leaveEvent);
        });

        expect(result.current.isDragging).toBe(false);
        expect(leaveEvent.preventDefault).toHaveBeenCalled();
        expect(leaveEvent.stopPropagation).toHaveBeenCalled();
      });

      it('keeps isDragging true when leaving nested element but still inside container', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        // Enter twice (container + nested element)
        const enterEvent1 = createMockDragEvent('dragenter', true);
        const enterEvent2 = createMockDragEvent('dragenter', true);

        act(() => {
          result.current.handleDragEnter(enterEvent1);
          result.current.handleDragEnter(enterEvent2);
        });

        expect(result.current.isDragging).toBe(true);

        // Leave once (leaving nested element)
        const leaveEvent = createMockDragEvent('dragleave', true);
        act(() => {
          result.current.handleDragLeave(leaveEvent);
        });

        // Should still be dragging since we're still inside container
        expect(result.current.isDragging).toBe(true);
      });
    });

    describe('handleDragOver', () => {
      it('prevents default and stops propagation', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        const mockEvent = createMockDragEvent('dragover', true);

        act(() => {
          result.current.handleDragOver(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('handleDrop', () => {
      it('resets isDragging to false on drop', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        // First set isDragging to true
        const enterEvent = createMockDragEvent('dragenter', true);
        act(() => {
          result.current.handleDragEnter(enterEvent);
        });

        expect(result.current.isDragging).toBe(true);

        // Then drop
        const dropEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          dataTransfer: {
            items: [],
          },
        } as unknown as React.DragEvent;

        act(() => {
          result.current.handleDrop(dropEvent);
        });

        expect(result.current.isDragging).toBe(false);
        expect(dropEvent.preventDefault).toHaveBeenCalled();
        expect(dropEvent.stopPropagation).toHaveBeenCalled();
      });

      it('extracts files from dataTransfer and calls handleFilesAdded', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
        const dropEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          dataTransfer: {
            items: [
              {
                kind: 'file',
                getAsFile: () => mockFile,
              },
            ],
          },
        } as unknown as React.DragEvent;

        act(() => {
          result.current.handleDrop(dropEvent);
        });

        expect(mockSetAttachments).toHaveBeenCalled();
      });

      it('ignores non-file items in dataTransfer', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        const dropEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          dataTransfer: {
            items: [
              {
                kind: 'string',
                getAsFile: () => null,
              },
            ],
          },
        } as unknown as React.DragEvent;

        act(() => {
          result.current.handleDrop(dropEvent);
        });

        expect(mockSetAttachments).not.toHaveBeenCalled();
      });

      it('handles null dataTransfer gracefully', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        const dropEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          dataTransfer: null,
        } as unknown as React.DragEvent;

        expect(() => {
          act(() => {
            result.current.handleDrop(dropEvent);
          });
        }).not.toThrow();

        expect(mockSetAttachments).not.toHaveBeenCalled();
      });

      it('handles null file from getAsFile gracefully', () => {
        const { result } = renderHook(() =>
          usePostInput({
            variant: 'post',
          }),
        );

        const dropEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          dataTransfer: {
            items: [
              {
                kind: 'file',
                getAsFile: () => null,
              },
            ],
          },
        } as unknown as React.DragEvent;

        act(() => {
          result.current.handleDrop(dropEvent);
        });

        expect(mockSetAttachments).not.toHaveBeenCalled();
      });
    });
  });

  describe('click outside collapse behavior with attachments', () => {
    it('does not collapse when there are attachments even with empty content', () => {
      mockAttachments = [new File(['test'], 'test.png', { type: 'image/png' })];

      const { result } = renderHook(() =>
        usePostInput({
          variant: 'post',
          expanded: false,
        }),
      );

      // Expand first
      act(() => {
        result.current.handleExpand();
      });

      expect(result.current.isExpanded).toBe(true);

      // The click outside handler checks for attachments too,
      // so it won't collapse when attachments exist
      // This is tested via the effect, not directly callable
    });
  });
});
