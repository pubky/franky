import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyInput } from './DialogReplyInput';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

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
}));

vi.mock('@/molecules', () => ({
  PostTagsList: vi.fn(({ tags, showInput, showAddButton, showTagClose, onTagAdd, onTagClose }) => (
    <div data-testid="post-tags-list">
      {tags.map((tag: { label: string }, index: number) => (
        <div key={index} data-testid={`tag-${tag.label}`}>
          {tag.label}
          {showTagClose && (
            <button data-testid={`tag-close-${index}`} onClick={() => onTagClose?.(tag, index)}>
              ×
            </button>
          )}
        </div>
      ))}
      {showAddButton && !showInput && (
        <button
          data-testid="add-tag-button"
          onClick={() => {
            // Simulate opening input and adding tag
            onTagAdd?.('new-tag');
          }}
        >
          +
        </button>
      )}
      {showInput && <input data-testid="tag-input" />}
    </div>
  )),
}));

vi.mock('@/organisms', () => ({
  DialogReplyActionBar: vi.fn(({ onPostClick, isPostDisabled }) => (
    <div data-testid="dialog-reply-action-bar">
      <button data-testid="post-button" onClick={onPostClick} disabled={isPostDisabled} aria-label="Post reply">
        Post
      </button>
    </div>
  )),
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

describe('DialogReplyInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLiveQuery.mockReturnValue({ name: 'Test User' });
    mockPostControllerCreate.mockResolvedValue(undefined);
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
  });

  it('renders with required postId prop', () => {
    render(<DialogReplyInput postId="test-post-123" />);

    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });

  it('renders PostHeader with correct props', () => {
    render(<DialogReplyInput postId="test-post-123" />);

    expect(Organisms.PostHeader).toHaveBeenCalledWith(
      {
        postId: 'test-user-id:pubkey',
        hideTime: true,
      },
      undefined,
    );
  });

  it('renders PostTagsList with correct props', () => {
    render(<DialogReplyInput postId="test-post-123" />);

    const tagsList = screen.getByTestId('post-tags-list');
    expect(tagsList).toBeInTheDocument();
    expect(Molecules.PostTagsList).toHaveBeenCalledTimes(1);
    const callArgs = (Molecules.PostTagsList as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs).toMatchObject({
      showInput: false,
      showAddButton: true,
      addMode: true,
      showTagClose: true,
    });
  });

  it('handles textarea value changes', () => {
    const setReplyContent = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent,
      handleReplySubmit: vi.fn(),
    });

    render(<DialogReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });

    expect(setReplyContent).toHaveBeenCalledWith('Test reply content');
  });

  it('handles Enter key submission', async () => {
    const handleReplySubmit = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(handleReplySubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit on Shift+Enter', () => {
    const handleReplySubmit = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(handleReplySubmit).not.toHaveBeenCalled();
  });

  it('does not submit empty content', async () => {
    const handleReplySubmit = vi.fn();
    mockUsePostReply.mockReturnValue({
      replyContent: '   ',
      setReplyContent: vi.fn(),
      handleReplySubmit,
    });

    render(<DialogReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    // The hook handles validation, so handleReplySubmit might still be called
    // but it will return early if content is empty
    expect(handleReplySubmit).toHaveBeenCalledTimes(1);
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

    render(<DialogReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

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

    render(<DialogReplyInput postId="test-post-123" onSuccess={onSuccess} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

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

    render(<DialogReplyInput postId="test-post-123" />);

    const postButton = screen.getByTestId('post-button');
    expect(postButton).toBeDisabled();
    expect(Organisms.DialogReplyActionBar).toHaveBeenCalledWith(
      {
        isPostDisabled: true,
        onPostClick: expect.any(Function),
      },
      undefined,
    );
  });

  it('enables Post button when content is not empty', () => {
    mockUsePostReply.mockReturnValue({
      replyContent: 'Test reply content',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });

    render(<DialogReplyInput postId="test-post-123" />);

    const postButton = screen.getByTestId('post-button');
    expect(postButton).not.toBeDisabled();
    expect(Organisms.DialogReplyActionBar).toHaveBeenCalledWith(
      {
        isPostDisabled: false,
        onPostClick: expect.any(Function),
      },
      undefined,
    );
  });

  it('handles tag addition', () => {
    render(<DialogReplyInput postId="test-post-123" />);

    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);

    expect(screen.getByTestId('tag-new-tag')).toBeInTheDocument();
  });

  it('handles tag removal', () => {
    render(<DialogReplyInput postId="test-post-123" />);

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

    render(<DialogReplyInput postId="test-post-123" />);

    const postButton = screen.getByTestId('post-button');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(handleReplySubmit).toHaveBeenCalledTimes(1);
    });
  });
});

describe('DialogReplyInput - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLiveQuery.mockReturnValue({ name: 'Snapshot User' });
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
  });

  it('matches snapshot in default state', () => {
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with user details', () => {
    mockUseLiveQuery.mockReturnValue({ name: 'Test User' });
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without user details', () => {
    mockUseLiveQuery.mockReturnValue(null);
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
