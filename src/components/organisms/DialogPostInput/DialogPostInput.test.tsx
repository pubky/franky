import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogPostInput } from './DialogPostInput';
import { POST_ACTION_VARIANT } from '@/shared/postActionVariants';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

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
  DialogActionBar: vi.fn(({ variant, onActionClick, isActionDisabled }) => (
    <div data-testid="dialog-action-bar" data-variant={variant}>
      <button
        data-testid="post-button"
        onClick={onActionClick}
        disabled={isActionDisabled}
        aria-label={variant === 'reply' ? 'Post reply' : variant === 'repost' ? 'Repost' : 'Post'}
      >
        {variant === 'reply' ? 'Post' : variant === 'repost' ? 'Repost' : 'Post'}
      </button>
    </div>
  )),
  DialogPostPreview: vi.fn(({ postId, variant }) => (
    <div data-testid="dialog-post-preview" data-post-id={postId} data-variant={variant}>
      PostPreview {postId}
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
  ProfileController: {
    read: vi.fn(),
  },
}));

vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({ ref: { current: null } })),
  usePostAction: vi.fn(),
}));

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    extractInitials: vi.fn(({ name }) => name?.substring(0, 2).toUpperCase() || ''),
    formatPublicKey: vi.fn(({ key, length }) => key?.substring(0, length) || ''),
  };
});

const mockUsePostAction = vi.mocked(Hooks.usePostAction);

describe('DialogPostInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostAction.mockReturnValue({
      content: '',
      setContent: vi.fn(),
      handleSubmit: vi.fn(),
    });
  });

  describe('Reply variant', () => {
    it('renders with required props', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
      expect(screen.getByTestId('post-reply-connector')).toBeInTheDocument();
    });

    it('disables Post button when content is empty', () => {
      mockUsePostAction.mockReturnValue({
        content: '',
        setContent: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: POST_ACTION_VARIANT.REPLY,
          isActionDisabled: true,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('enables Post button when content is not empty', () => {
      mockUsePostAction.mockReturnValue({
        content: 'Test reply content',
        setContent: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).not.toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: POST_ACTION_VARIANT.REPLY,
          isActionDisabled: false,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('does not show preview inside for reply variant', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      expect(screen.queryByTestId('dialog-post-preview')).not.toBeInTheDocument();
    });
  });

  describe('Repost variant', () => {
    it('renders with required props', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPOST} postId="test-post-123" />);

      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Optional comment')).toBeInTheDocument();
      expect(screen.queryByTestId('post-reply-connector')).not.toBeInTheDocument();
    });

    it('shows preview inside for repost variant', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPOST} postId="test-post-123" />);

      expect(screen.getByTestId('dialog-post-preview')).toBeInTheDocument();
      expect(Organisms.DialogPostPreview).toHaveBeenCalledWith(
        {
          postId: 'test-post-123',
          variant: 'repost',
        },
        undefined,
      );
    });

    it('does not disable Repost button even when content is empty', () => {
      mockUsePostAction.mockReturnValue({
        content: '',
        setContent: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPOST} postId="test-post-123" />);

      const repostButton = screen.getByTestId('post-button');
      expect(repostButton).not.toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: POST_ACTION_VARIANT.REPOST,
          isActionDisabled: false,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });
  });

  describe('New Post variant', () => {
    it('renders with required props', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.NEW} />);

      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
      expect(screen.queryByTestId('post-reply-connector')).not.toBeInTheDocument();
    });

    it('does not show preview inside for new post variant', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.NEW} />);

      expect(screen.queryByTestId('dialog-post-preview')).not.toBeInTheDocument();
    });

    it('disables Post button when content is empty', () => {
      mockUsePostAction.mockReturnValue({
        content: '',
        setContent: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.NEW} />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: POST_ACTION_VARIANT.NEW,
          isActionDisabled: true,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('enables Post button when content is not empty', () => {
      mockUsePostAction.mockReturnValue({
        content: 'Test post content',
        setContent: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.NEW} />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).not.toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: POST_ACTION_VARIANT.NEW,
          isActionDisabled: false,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('handles textarea value changes for new post', () => {
      const setContent = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: '',
        setContent,
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.NEW} />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test post content' } });

      expect(setContent).toHaveBeenCalledWith('Test post content');
    });

    it('handles Enter key submission for new post', async () => {
      const handleSubmit = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: 'Test post content',
        setContent: vi.fn(),
        handleSubmit,
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.NEW} />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Common functionality', () => {
    it('handles textarea value changes for reply', () => {
      const setContent = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: '',
        setContent,
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test reply content' } });

      expect(setContent).toHaveBeenCalledWith('Test reply content');
    });

    it('handles textarea value changes for repost', () => {
      const setContent = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: '',
        setContent,
        handleSubmit: vi.fn(),
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPOST} postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test repost comment' } });

      expect(setContent).toHaveBeenCalledWith('Test repost comment');
    });

    it('handles Enter key submission for reply', async () => {
      const handleSubmit = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: 'Test reply content',
        setContent: vi.fn(),
        handleSubmit,
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('handles Enter key submission for repost', async () => {
      const handleSubmit = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: 'Test repost comment',
        setContent: vi.fn(),
        handleSubmit,
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPOST} postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit on Shift+Enter', () => {
      const handleSubmit = vi.fn();
      mockUsePostAction.mockReturnValue({
        content: 'Test reply content',
        setContent: vi.fn(),
        handleSubmit,
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('handles tag addition', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const addButton = screen.getByTestId('add-tag-button');
      fireEvent.click(addButton);

      expect(screen.getByTestId('tag-new-tag')).toBeInTheDocument();
    });

    it('handles tag removal', () => {
      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" />);

      const addButton = screen.getByTestId('add-tag-button');
      fireEvent.click(addButton);

      const closeButton = screen.getByTestId('tag-close-0');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('tag-new-tag')).not.toBeInTheDocument();
    });

    it('calls onSuccess callback after successful submission', async () => {
      const onSuccess = vi.fn();
      const handleSubmit = vi.fn(async () => {
        onSuccess();
      });
      mockUsePostAction.mockReturnValue({
        content: 'Test reply content',
        setContent: vi.fn(),
        handleSubmit,
      });

      render(<DialogPostInput variant={POST_ACTION_VARIANT.REPLY} postId="test-post-123" onSuccess={onSuccess} />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
