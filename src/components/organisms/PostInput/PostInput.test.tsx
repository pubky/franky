import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostInput } from './PostInput';
import { POST_INPUT_VARIANT } from './PostInput.constants';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/components/atoms/PostThreadConnector/PostThreadConnector.constants';

vi.mock('@/atoms', async () => {
  const { POST_THREAD_CONNECTOR_VARIANTS } =
    await import('@/components/atoms/PostThreadConnector/PostThreadConnector.constants');
  return {
    Container: ({
      children,
      className,
      overrideDefaults,
      ref,
      onClick,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    }: {
      children: React.ReactNode;
      className?: string;
      overrideDefaults?: boolean;
      ref?: React.Ref<HTMLDivElement>;
      onClick?: () => void;
      onDragEnter?: (e: React.DragEvent) => void;
      onDragLeave?: (e: React.DragEvent) => void;
      onDragOver?: (e: React.DragEvent) => void;
      onDrop?: (e: React.DragEvent) => void;
    }) => (
      <div
        ref={ref}
        data-testid="container"
        className={className}
        data-override-defaults={overrideDefaults}
        onClick={onClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
      </div>
    ),
    Textarea: vi.fn(({ value, onChange, placeholder, disabled, ref, onFocus }) => (
      <textarea
        ref={ref}
        data-testid="textarea"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
      />
    )),
    PostThreadConnector: vi.fn(({ height, variant }) => (
      <div data-testid="thread-connector" data-height={height} data-variant={variant} />
    )),
    POST_THREAD_CONNECTOR_VARIANTS,
    Button: vi.fn(({ children, onClick, disabled, className, 'aria-label': ariaLabel }) => (
      <button onClick={onClick} disabled={disabled} className={className} aria-label={ariaLabel}>
        {children}
      </button>
    )),
    Typography: vi.fn(({ children, as, size, className }) => {
      const Tag = (as || 'p') as React.ElementType;
      return (
        <Tag data-testid="typography" data-as={as} data-size={size} className={className}>
          {children}
        </Tag>
      );
    }),
    Input: vi.fn(({ type, accept, multiple, onChange, ref, className, id }) => (
      <input
        ref={ref}
        type={type}
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className={className}
        id={id}
        data-testid="input"
      />
    )),
  };
});

vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId, isReplyInput, characterLimit }) => (
    <div
      data-testid="post-header"
      data-post-id={postId}
      data-is-reply={isReplyInput}
      data-count={characterLimit?.count}
      data-max={characterLimit?.max}
    />
  )),
}));

vi.mock('../TimelineFeed/TimelineFeed', () => ({
  useTimelineFeedContext: vi.fn(() => null),
}));

vi.mock('../PostInputTags', () => ({
  PostInputTags: vi.fn(({ tags, disabled }) => (
    <div data-testid="post-input-tags" data-disabled={disabled}>
      {tags.map((tag: string, index: number) => (
        <div key={index} data-testid={`tag-${tag}`}>
          {tag}
        </div>
      ))}
    </div>
  )),
}));

vi.mock('../PostInputActionBar', () => ({
  PostInputActionBar: vi.fn(({ onPostClick, onEmojiClick, onFileClick, isPostDisabled, isSubmitting }) => (
    <div data-testid="post-input-action-bar">
      <button data-testid="emoji-button" onClick={onEmojiClick} aria-label="Add emoji">
        Emoji
      </button>
      <button data-testid="file-button" onClick={onFileClick} aria-label="Add file">
        File
      </button>
      <button
        data-testid="post-button"
        onClick={onPostClick}
        disabled={isPostDisabled}
        aria-label={isSubmitting ? 'Posting...' : 'Post'}
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </div>
  )),
  POST_INPUT_ACTION_SUBMIT_MODE: { POST: 'post', REPLY: 'reply' },
}));

vi.mock('@/molecules', () => ({
  PostTagAddButton: vi.fn(({ onClick, disabled }) => (
    <button data-testid="add-tag-button" onClick={onClick} disabled={disabled}>
      +
    </button>
  )),
  TagInput: vi.fn(() => <div data-testid="tag-input" />),
  PostTag: vi.fn(({ label }) => <div data-testid={`post-tag-${label}`}>{label}</div>),
  PostPreviewCard: vi.fn(({ postId, className }: { postId: string; className?: string }) => (
    <div data-testid="post-preview-card" data-post-id={postId} className={className}>
      Original Post: {postId}
    </div>
  )),
  PostLinkEmbeds: vi.fn(({ content }: { content: string }) => {
    // Only render if content contains a URL-like pattern
    if (content.includes('http') || content.includes('youtube') || content.includes('youtu.be')) {
      return <div data-testid="post-link-embeds">Link preview</div>;
    }
    return null;
  }),
  PostInputAttachments: vi.fn(
    ({
      attachments,
      isSubmitting,
    }: {
      ref: React.RefObject<HTMLInputElement>;
      attachments: File[];
      setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
      handleFilesAdded: (files: FileList | File[]) => void;
      isSubmitting: boolean;
    }) => (
      <div data-testid="post-input-attachments" data-submitting={isSubmitting}>
        {attachments.map((file: File, index: number) => (
          <div key={index} data-testid={`attachment-${file.name}`}>
            {file.name}
          </div>
        ))}
      </div>
    ),
  ),
  EmojiPickerDialog: vi.fn(
    ({
      open,
      onOpenChange,
      onEmojiSelect,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onEmojiSelect: (emoji: { native: string }) => void;
    }) =>
      open ? (
        <div data-testid="emoji-picker-dialog">
          <button data-testid="emoji-select" onClick={() => onEmojiSelect({ native: '😀' })}>
            Select Emoji
          </button>
          <button data-testid="emoji-close" onClick={() => onOpenChange(false)}>
            Close
          </button>
        </div>
      ) : null,
  ),
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

// Mock the direct import of PostInputAttachments
vi.mock('@/molecules/PostInputAttachments/PostInputAttachments', () => ({
  PostInputAttachments: vi.fn(
    ({
      attachments,
      isSubmitting,
    }: {
      ref: React.RefObject<HTMLInputElement>;
      attachments: File[];
      setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
      handleFilesAdded: (files: FileList | File[]) => void;
      isSubmitting: boolean;
    }) => (
      <div data-testid="post-input-attachments" data-submitting={isSubmitting}>
        {attachments.map((file: File, index: number) => (
          <div key={index} data-testid={`attachment-${file.name}`}>
            {file.name}
          </div>
        ))}
      </div>
    ),
  ),
}));

// Mock the underlying hooks that usePostInput uses
const mockUsePostReturn = {
  content: '',
  setContent: vi.fn(),
  tags: [] as string[],
  setTags: vi.fn(),
  attachments: [] as File[],
  setAttachments: vi.fn(),
  isDragging: false,
  reply: vi.fn(),
  post: vi.fn(),
  isSubmitting: false,
};

vi.mock('@/hooks', () => ({
  usePost: vi.fn(() => mockUsePostReturn),
  useCurrentUserProfile: vi.fn(() => ({
    currentUserPubky: 'test-user-id:pubkey',
  })),
  useEmojiInsert: vi.fn(() => vi.fn()),
  usePostInput: vi.fn((options: { variant: string; placeholder?: string }) => ({
    textareaRef: { current: null },
    containerRef: { current: null },
    fileInputRef: { current: null },
    content: mockUsePostReturn.content,
    tags: mockUsePostReturn.tags,
    setTags: mockUsePostReturn.setTags,
    attachments: mockUsePostReturn.attachments,
    setAttachments: mockUsePostReturn.setAttachments,
    isDragging: mockUsePostReturn.isDragging,
    isExpanded: true,
    isSubmitting: mockUsePostReturn.isSubmitting,
    showEmojiPicker: false,
    setShowEmojiPicker: vi.fn(),
    hasContent: mockUsePostReturn.content.trim().length > 0,
    displayPlaceholder:
      options.placeholder ??
      (options.variant === 'reply'
        ? 'Write a reply...'
        : options.variant === 'repost'
          ? 'Optional comment'
          : "What's on your mind?"),
    currentUserPubky: 'test-user-id:pubkey',
    handleExpand: vi.fn(),
    handleSubmit: vi.fn(async () => {
      if (options.variant === 'reply') {
        await mockUsePostReturn.reply({ postId: 'test-post-123', onSuccess: vi.fn() });
      } else {
        await mockUsePostReturn.post({ onSuccess: vi.fn() });
      }
    }),
    handleChange: vi.fn((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      mockUsePostReturn.setContent(e.target.value);
    }),
    handleEmojiSelect: vi.fn(),
    handleFilesAdded: vi.fn(),
    handleDragEnter: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
  })),
}));

describe('PostInput', () => {
  const mockOnSuccess = vi.fn();
  const mockSetContent = vi.fn();
  const mockSetTags = vi.fn();
  const mockSetAttachments = vi.fn();
  const mockReply = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockReply.mockReturnValue(async () => {});
    mockPost.mockReturnValue(async () => {});

    // Update the shared mock state
    mockUsePostReturn.content = '';
    mockUsePostReturn.tags = [];
    mockUsePostReturn.attachments = [];
    mockUsePostReturn.isDragging = false;
    mockUsePostReturn.isSubmitting = false;
    mockUsePostReturn.setContent = mockSetContent;
    mockUsePostReturn.setTags = mockSetTags;
    mockUsePostReturn.setAttachments = mockSetAttachments;
    mockUsePostReturn.reply = mockReply;
    mockUsePostReturn.post = mockPost;
  });

  it('renders with post variant', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('renders with repost variant', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.REPOST} originalPostId="test-post-123" />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional comment')).toBeInTheDocument();
  });

  it('renders with reply variant', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('shows thread connector when showThreadConnector is true', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" showThreadConnector={true} />);

    const connector = screen.getByTestId('thread-connector');
    expect(connector).toBeInTheDocument();
    expect(connector).toHaveAttribute('data-variant', POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY);
  });

  it('does not show thread connector when showThreadConnector is false', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    expect(screen.queryByTestId('thread-connector')).not.toBeInTheDocument();
  });

  it('handles textarea value changes', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test content' } });

    expect(mockSetContent).toHaveBeenCalledWith('Test content');
  });

  it('handles post submission for post variant', async () => {
    mockUsePostReturn.content = 'Test post content';

    render(<PostInput variant={POST_INPUT_VARIANT.POST} onSuccess={mockOnSuccess} />);

    // Click the post button
    const postButton = screen.getByLabelText('Post');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('handles reply submission for reply variant', async () => {
    mockUsePostReturn.content = 'Test reply content';

    render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" onSuccess={mockOnSuccess} />);

    // Bottom bar is always shown, so post button should be visible
    const postButton = screen.getByLabelText('Post');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledWith(
        expect.objectContaining({
          postId: 'test-post-123',
        }),
      );
    });
  });

  it('disables post button when content is empty and no attachments', () => {
    mockUsePostReturn.content = '';
    mockUsePostReturn.attachments = [];

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Check that post button is disabled when content is empty and no attachments
    const postButton = screen.getByLabelText('Post');
    expect(postButton).toBeDisabled();
  });

  it('enables post button when content is empty but attachments are present', () => {
    mockUsePostReturn.content = '';
    const testFile = new File(['test'], 'test-image.png', { type: 'image/png' });
    mockUsePostReturn.attachments = [testFile];

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Button should be enabled when attachments are present even without content
    const postButton = screen.getByLabelText('Post');
    expect(postButton).not.toBeDisabled();
  });

  it('enables post button when content is present without attachments', () => {
    mockUsePostReturn.content = 'Test content';
    mockUsePostReturn.attachments = [];

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Button should be enabled when content is present
    const postButton = screen.getByLabelText('Post');
    expect(postButton).not.toBeDisabled();
  });

  it('enables post button when both content and attachments are present', () => {
    mockUsePostReturn.content = 'Test content';
    const testFile = new File(['test'], 'test-image.png', { type: 'image/png' });
    mockUsePostReturn.attachments = [testFile];

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Button should be enabled when both content and attachments are present
    const postButton = screen.getByLabelText('Post');
    expect(postButton).not.toBeDisabled();
  });

  it('enables post button for repost variant without content or attachments', () => {
    mockUsePostReturn.content = '';
    mockUsePostReturn.attachments = [];

    render(<PostInput variant={POST_INPUT_VARIANT.REPOST} originalPostId="test-post-123" />);

    const postButton = screen.getByLabelText('Post');
    expect(postButton).not.toBeDisabled();
  });

  it('does not show drag overlay when isDragging is false', () => {
    mockUsePostReturn.isDragging = false;

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    expect(screen.queryByText('Drop files here')).not.toBeInTheDocument();
  });
});

describe('PostInput - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostReturn.content = '';
    mockUsePostReturn.tags = [];
    mockUsePostReturn.attachments = [];
    mockUsePostReturn.isDragging = false;
    mockUsePostReturn.isSubmitting = false;
  });

  it('matches snapshot for post variant without content or attachments', () => {
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for repost variant without content or attachments', () => {
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.REPOST} originalPostId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for reply variant without content or attachments', () => {
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for post variant with content', () => {
    mockUsePostReturn.content = 'Test content';
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for post variant with attachments', () => {
    const testFile = new File(['test'], 'test-image.png', { type: 'image/png' });
    mockUsePostReturn.attachments = [testFile];

    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for post variant with custom placeholder', () => {
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} placeholder="Custom placeholder" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for reply with thread connector', () => {
    const { container } = render(
      <PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" showThreadConnector={true} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for post variant when dragging', () => {
    mockUsePostReturn.isDragging = true;

    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for post variant when submitting', () => {
    mockUsePostReturn.isSubmitting = true;

    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
