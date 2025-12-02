import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyInput } from './DialogReplyInput';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';
import { DialogReplyActionBar } from '../DialogReplyActionBar';
import { DialogReplyTags } from '../DialogReplyTags';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('@/atoms', () => ({
  Avatar: vi.fn(({ children, size }) => (
    <div data-testid="avatar" data-size={size}>
      {children}
    </div>
  )),
  AvatarImage: vi.fn(() => <img data-testid="avatar-image" alt="" />),
  AvatarFallback: vi.fn(({ children }) => <div data-testid="avatar-fallback">{children}</div>),
  PostReplyConnector: vi.fn(() => <div data-testid="post-reply-connector" />),
  Textarea: vi.fn(({ value, onChange, onKeyDown, placeholder, className }) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
    />
  )),
  Button: vi.fn(({ children, onClick, disabled, className, 'aria-label': ariaLabel }) => (
    <button
      data-testid={ariaLabel ? `button-${ariaLabel.replace(/\s+/g, '-').toLowerCase()}` : 'button'}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )),
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
}));

vi.mock('@/molecules', () => ({
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
}));

vi.mock('../DialogReplyActionBar', () => ({
  DialogReplyActionBar: vi.fn(({ onPostClick, isPostDisabled }) => (
    <div data-testid="dialog-reply-action-bar">
      <button data-testid="post-button" onClick={onPostClick} disabled={isPostDisabled} aria-label="Post reply">
        Post
      </button>
    </div>
  )),
}));

vi.mock('../DialogReplyTags', () => ({
  DialogReplyTags: vi.fn(({ tags, onTagsChange }) => (
    <div data-testid="dialog-reply-tags">
      {tags.map((tag: string, index: number) => (
        <div key={index} data-testid={`tag-${tag}`}>
          {tag}
          <button
            data-testid={`tag-close-${index}`}
            onClick={() => onTagsChange(tags.filter((_: string, i: number) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        data-testid="add-tag-button"
        onClick={() => {
          onTagsChange([...tags, 'new-tag']);
        }}
      >
        +
      </button>
    </div>
  )),
}));

vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId, hideTime }) => (
    <div data-testid="post-header" data-post-id={postId} data-hide-time={hideTime}>
      PostHeader {postId}
    </div>
  )),
}));

vi.mock('@/core', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { selectCurrentUserPubky: () => 'test-user-id:pubkey' };
    return selector(state);
  }),
  filesApi: {
    getAvatar: vi.fn(() => 'https://example.com/avatar.png'),
  },
  PostController: {
    create: vi.fn(),
  },
  ProfileController: {
    read: vi.fn(),
  },
}));

vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({ ref: { current: null } })),
  usePostReply: vi.fn(),
  useCurrentUserProfile: vi.fn(() => ({ currentUserPubky: 'test-user-id:pubkey' })),
}));

// Use real libs, only stub cn to a deterministic join
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    extractInitials: vi.fn(({ name }) => name?.substring(0, 2).toUpperCase() || ''),
    formatPublicKey: vi.fn(({ key, length }) => key?.substring(0, length) || ''),
  };
});

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockPostControllerCreate = vi.mocked(Core.PostController.create);
const mockUsePostReply = vi.mocked(Hooks.usePostReply);
const mockUseCurrentUserProfile = vi.mocked(Hooks.useCurrentUserProfile);

describe('DialogReplyInput', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLiveQuery.mockReturnValue({ name: 'Test User' });
    mockPostControllerCreate.mockResolvedValue(undefined);
    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'test-user-id:pubkey',
      userDetails: { name: 'Test User' },
    });
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
  });

  it('renders with required postId prop', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('renders PostHeader with correct props', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    expect(Organisms.PostHeader).toHaveBeenCalledWith(
      {
        postId: 'test-user-id:pubkey',
        hideTime: true,
        characterCount: 0,
        maxLength: 2000,
      },
      undefined,
    );
  });

  it('renders DialogReplyTags with correct props', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    expect(DialogReplyTags).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [],
        onTagsChange: expect.any(Function),
      }),
      undefined,
    );
  });

  it('handles textarea value changes', () => {
    const setReplyContent = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent,
      handleReplySubmit: vi.fn(),
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });

    expect(setReplyContent).toHaveBeenCalledWith('Test reply content');
  });

  it('handles Post button click submission', async () => {
    const handleReplySubmit = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postButton = screen.getByTestId('post-button');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(handleReplySubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('renders textarea correctly', () => {
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test reply content');
  });

  it('does not submit empty content', async () => {
    const handleReplySubmit = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: '   ',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postButton = screen.getByTestId('post-button');
    expect(postButton).toBeDisabled();
    // Button is disabled, so clicking won't trigger submission
    fireEvent.click(postButton);
    expect(handleReplySubmit).not.toHaveBeenCalled();
  });

  it('clears textarea after successful submission', async () => {
    const setReplyContent = vi.fn();
    const handleReplySubmit = vi.fn(async () => {
      setReplyContent('');
    });
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent,
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postButton = screen.getByTestId('post-button');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(handleReplySubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onSuccess callback after successful submission', async () => {
    const onSuccess = vi.fn();
    const handleReplySubmit = vi.fn(async () => {
      onSuccess();
    });
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={onSuccess} />);

    const postButton = screen.getByTestId('post-button');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(handleReplySubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('disables Post button when content is empty', () => {
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postButton = screen.getByTestId('post-button');
    expect(postButton).toBeDisabled();
    expect(DialogReplyActionBar).toHaveBeenCalled();
    const callArgs = (DialogReplyActionBar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.isPostDisabled).toBe(true);
    expect(callArgs.onPostClick).toBeDefined();
  });

  it('enables Post button when content is not empty', () => {
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postButton = screen.getByTestId('post-button');
    expect(postButton).not.toBeDisabled();
    expect(DialogReplyActionBar).toHaveBeenCalled();
    const callArgs = (DialogReplyActionBar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.isPostDisabled).toBe(false);
    expect(callArgs.onPostClick).toBeDefined();
  });

  it('handles tag addition', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);

    expect(screen.getByTestId('tag-new-tag')).toBeInTheDocument();
  });

  it('handles tag removal', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    // Add a tag first
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);

    // Remove the tag
    const closeButton = screen.getByTestId('tag-close-0');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('tag-new-tag')).not.toBeInTheDocument();
  });

  it('handles Post button click', async () => {
    const handleReplySubmit = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postButton = screen.getByTestId('post-button');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(handleReplySubmit).toHaveBeenCalledTimes(1);
    });
  });
});

describe('DialogReplyInput - Snapshots', () => {
  const mockOnSuccess = vi.fn();
  const mockUseCurrentUserProfile = vi.mocked(Hooks.useCurrentUserProfile);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'snapshot-user-id:pubkey',
      userDetails: { name: 'Snapshot User' },
    });
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
  });

  it('matches snapshot in default state', () => {
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" onSuccessAction={mockOnSuccess} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with user details', () => {
    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'test-user-id:pubkey',
      userDetails: { name: 'Test User' },
    });
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" onSuccessAction={mockOnSuccess} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without user details', () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: null, userDetails: null });
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" onSuccessAction={mockOnSuccess} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
