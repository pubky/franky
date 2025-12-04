import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostInput } from './PostInput';
import { POST_INPUT_VARIANT } from './PostInput.constants';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

vi.mock('@/config', () => ({
  POST_MAX_CHARACTER_LENGTH: 2000,
  POST_MAX_TAGS: 5,
}));

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
  Textarea: vi.fn(({ value, onChange, onFocus, onBlur, placeholder, disabled, ref }) => (
    <textarea
      ref={ref}
      data-testid="textarea"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
    />
  )),
  DialogPostReplyThreadConnector: vi.fn(() => <div data-testid="thread-connector" />),
  Button: vi.fn(({ children, onClick, disabled, className, 'aria-label': ariaLabel }) => (
    <button onClick={onClick} disabled={disabled} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  )),
  Typography: vi.fn(({ children, as, size, className }) => {
    const Tag = (as || 'p') as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid="typography" data-as={as} data-size={size} className={className}>
        {children}
      </Tag>
    );
  }),
}));

vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId, isReplyInput, characterCount, maxLength }) => (
    <div
      data-testid="post-header"
      data-post-id={postId}
      data-is-reply={isReplyInput}
      data-count={characterCount}
      data-max={maxLength}
    />
  )),
}));

vi.mock('@/molecules', () => ({
  PostTagAddButton: vi.fn(({ onClick, disabled }) => (
    <button data-testid="add-tag-button" onClick={onClick} disabled={disabled}>
      +
    </button>
  )),
  TagInput: vi.fn(() => <div data-testid="tag-input" />),
  PostTag: vi.fn(({ label }) => <div data-testid={`post-tag-${label}`}>{label}</div>),
  PostLinkEmbeds: vi.fn(({ content }: { content: string }) => {
    // Only render if content contains a URL-like pattern
    if (content.includes('http') || content.includes('youtube') || content.includes('youtu.be')) {
      return <div data-testid="post-link-embeds">Link preview</div>;
    }
    return null;
  }),
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

vi.mock('@/hooks', () => ({
  usePost: vi.fn(),
  useCurrentUserProfile: vi.fn(() => ({
    currentUserPubky: 'test-user-id:pubkey',
  })),
  useEmojiInsert: vi.fn(() => vi.fn()),
}));

vi.mock('@/core', () => ({
  PostController: {
    create: vi.fn(),
  },
  useAuthStore: vi.fn(() => (state: { selectCurrentUserPubky: () => string | null }) => state.selectCurrentUserPubky()),
}));

const mockUsePost = vi.mocked(Hooks.usePost);
const mockPostControllerCreate = vi.mocked(Core.PostController.create);

describe('PostInput', () => {
  const mockOnSuccess = vi.fn();
  const mockSetContent = vi.fn();
  const mockReply = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostControllerCreate.mockResolvedValue(undefined);
    mockReply.mockReturnValue(async () => {});
    mockPost.mockReturnValue(async () => {});

    mockUsePost.mockReturnValue({
      content: '',
      setContent: mockSetContent,
      reply: mockReply,
      post: mockPost,
      isSubmitting: false,
      error: null,
    });
  });

  it('renders with reply variant', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('renders with post variant', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('shows thread connector when showThreadConnector is true', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" showThreadConnector={true} />);

    expect(screen.getByTestId('thread-connector')).toBeInTheDocument();
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

  it('shows bottom bar when textarea is focused', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.focus(textarea);

    // Bottom bar should be rendered when focused - check for rendered elements
    expect(screen.getByTestId('add-tag-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Add emoji')).toBeInTheDocument();
    expect(screen.getByLabelText('Post reply')).toBeInTheDocument();
  });

  it('shows bottom bar when content exists', () => {
    mockUsePost.mockReturnValue({
      content: 'Some content',
      setContent: mockSetContent,
      reply: mockReply,
      post: mockPost,
      isSubmitting: false,
      error: null,
    });

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Bottom bar should be rendered when content exists - check for rendered elements
    expect(screen.getByTestId('add-tag-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Add emoji')).toBeInTheDocument();
    expect(screen.getByLabelText('Post reply')).toBeInTheDocument();
  });

  it('hides bottom bar when not focused and no content', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Bottom bar should not be visible when not focused and no content
    expect(screen.queryByTestId('add-tag-button')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Add emoji')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Post reply')).not.toBeInTheDocument();
  });

  it('handles post submission for post variant', async () => {
    const mockSubmitHandler = vi.fn().mockResolvedValue(undefined);
    mockPost.mockReturnValue(mockSubmitHandler);

    mockUsePost.mockReturnValue({
      content: 'Test post content',
      setContent: mockSetContent,
      reply: mockReply,
      post: mockPost,
      isSubmitting: false,
      error: null,
    });

    render(<PostInput variant={POST_INPUT_VARIANT.POST} onSuccess={mockOnSuccess} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.focus(textarea);

    // Click the post button
    const postButton = screen.getByLabelText('Post reply');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('handles reply submission for reply variant', async () => {
    const mockSubmitHandler = vi.fn().mockResolvedValue(undefined);
    mockReply.mockReturnValue(mockSubmitHandler);

    mockUsePost.mockReturnValue({
      content: 'Test reply content',
      setContent: mockSetContent,
      reply: mockReply,
      post: mockPost,
      isSubmitting: false,
      error: null,
    });

    render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" onSuccess={mockOnSuccess} />);

    // For reply variant, bottom bar is always shown, so post button should be visible
    const postButton = screen.getByLabelText('Post reply');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledWith(
        expect.objectContaining({
          postId: 'test-post-123',
          tags: expect.any(Array),
        }),
      );
    });
  });

  it('disables post button when content is empty', () => {
    mockUsePost.mockReturnValue({
      content: '',
      setContent: mockSetContent,
      reply: mockReply,
      post: mockPost,
      isSubmitting: false,
      error: null,
    });

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.focus(textarea);

    // Check that post button is disabled when content is empty
    const postButton = screen.getByLabelText('Post reply');
    expect(postButton).toBeDisabled();
  });

  it('disables post button when submitting', () => {
    mockUsePost.mockReturnValue({
      content: 'Test content',
      setContent: mockSetContent,
      reply: mockReply,
      post: mockPost,
      isSubmitting: true,
      error: null,
    });

    render(<PostInput variant={POST_INPUT_VARIANT.POST} />);

    // Bottom bar shows when content exists, so post button should be visible but disabled
    const postButton = screen.getByLabelText('Posting...');
    expect(postButton).toBeDisabled();
  });

  it('uses custom placeholder when provided', () => {
    render(<PostInput variant={POST_INPUT_VARIANT.POST} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });
});

describe('PostInput - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePost.mockReturnValue({
      content: '',
      setContent: vi.fn(),
      reply: vi.fn(),
      post: vi.fn(),
      isSubmitting: false,
      error: null,
    });
  });

  it('matches snapshot for post variant', () => {
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.POST} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for reply variant', () => {
    const { container } = render(<PostInput variant={POST_INPUT_VARIANT.REPLY} postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
