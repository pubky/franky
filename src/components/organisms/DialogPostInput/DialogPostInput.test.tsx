import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogPostInput } from './DialogPostInput';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
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
  usePostRepost: vi.fn(),
  usePostCreate: vi.fn(),
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

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockPostControllerCreate = vi.mocked(Core.PostController.create);
const mockUsePostReply = vi.mocked(Hooks.usePostReply);
const mockUsePostRepost = vi.mocked(Hooks.usePostRepost);
const mockUsePostCreate = vi.mocked(Hooks.usePostCreate);

describe('DialogPostInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLiveQuery.mockReturnValue({ name: 'Test User' });
    mockPostControllerCreate.mockResolvedValue(undefined);
    mockUsePostReply.mockReturnValue({
      replyContent: '',
      setReplyContent: vi.fn(),
      handleReplySubmit: vi.fn(),
    });
    mockUsePostRepost.mockReturnValue({
      repostContent: '',
      setRepostContent: vi.fn(),
      handleRepostSubmit: vi.fn(),
    });
    mockUsePostCreate.mockReturnValue({
      postContent: '',
      setPostContent: vi.fn(),
      handlePostSubmit: vi.fn(),
    });
  });

  describe('Reply variant', () => {
    it('renders with required props', () => {
      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
      expect(screen.getByTestId('post-reply-connector')).toBeInTheDocument();
    });

    it('disables Post button when content is empty', () => {
      mockUsePostReply.mockReturnValue({
        replyContent: '',
        setReplyContent: vi.fn(),
        handleReplySubmit: vi.fn(),
      });

      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: 'reply',
          isActionDisabled: true,
          onActionClick: expect.any(Function),
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

      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).not.toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: 'reply',
          isActionDisabled: false,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('does not show preview inside for reply variant', () => {
      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      expect(screen.queryByTestId('dialog-post-preview')).not.toBeInTheDocument();
    });
  });

  describe('Repost variant', () => {
    it('renders with required props', () => {
      render(<DialogPostInput variant="repost" postId="test-post-123" />);

      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Optional comment')).toBeInTheDocument();
      expect(screen.queryByTestId('post-reply-connector')).not.toBeInTheDocument();
    });

    it('shows preview inside for repost variant', () => {
      render(<DialogPostInput variant="repost" postId="test-post-123" />);

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
      mockUsePostRepost.mockReturnValue({
        repostContent: '',
        setRepostContent: vi.fn(),
        handleRepostSubmit: vi.fn(),
      });

      render(<DialogPostInput variant="repost" postId="test-post-123" />);

      const repostButton = screen.getByTestId('post-button');
      expect(repostButton).not.toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: 'repost',
          isActionDisabled: false,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });
  });

  describe('New Post variant', () => {
    it('renders with required props', () => {
      render(<DialogPostInput variant="new" />);

      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
      expect(screen.queryByTestId('post-reply-connector')).not.toBeInTheDocument();
    });

    it('does not show preview inside for new post variant', () => {
      render(<DialogPostInput variant="new" />);

      expect(screen.queryByTestId('dialog-post-preview')).not.toBeInTheDocument();
    });

    it('disables Post button when content is empty', () => {
      mockUsePostCreate.mockReturnValue({
        postContent: '',
        setPostContent: vi.fn(),
        handlePostSubmit: vi.fn(),
      });

      render(<DialogPostInput variant="new" />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: 'new',
          isActionDisabled: true,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('enables Post button when content is not empty', () => {
      mockUsePostCreate.mockReturnValue({
        postContent: 'Test post content',
        setPostContent: vi.fn(),
        handlePostSubmit: vi.fn(),
      });

      render(<DialogPostInput variant="new" />);

      const postButton = screen.getByTestId('post-button');
      expect(postButton).not.toBeDisabled();
      expect(Organisms.DialogActionBar).toHaveBeenCalledWith(
        {
          variant: 'new',
          isActionDisabled: false,
          onActionClick: expect.any(Function),
        },
        undefined,
      );
    });

    it('handles textarea value changes for new post', () => {
      const setPostContent = vi.fn();
      mockUsePostCreate.mockReturnValue({
        postContent: '',
        setPostContent,
        handlePostSubmit: vi.fn(),
      });

      render(<DialogPostInput variant="new" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test post content' } });

      expect(setPostContent).toHaveBeenCalledWith('Test post content');
    });

    it('handles Enter key submission for new post', async () => {
      const handlePostSubmit = vi.fn();
      mockUsePostCreate.mockReturnValue({
        postContent: 'Test post content',
        setPostContent: vi.fn(),
        handlePostSubmit,
      });

      render(<DialogPostInput variant="new" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(handlePostSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Common functionality', () => {
    it('handles textarea value changes for reply', () => {
      const setReplyContent = vi.fn();
      mockUsePostReply.mockReturnValue({
        replyContent: '',
        setReplyContent,
        handleReplySubmit: vi.fn(),
      });

      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test reply content' } });

      expect(setReplyContent).toHaveBeenCalledWith('Test reply content');
    });

    it('handles textarea value changes for repost', () => {
      const setRepostContent = vi.fn();
      mockUsePostRepost.mockReturnValue({
        repostContent: '',
        setRepostContent,
        handleRepostSubmit: vi.fn(),
      });

      render(<DialogPostInput variant="repost" postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: 'Test repost comment' } });

      expect(setRepostContent).toHaveBeenCalledWith('Test repost comment');
    });

    it('handles Enter key submission for reply', async () => {
      const handleReplySubmit = vi.fn();
      mockUsePostReply.mockReturnValue({
        replyContent: 'Test reply content',
        setReplyContent: vi.fn(),
        handleReplySubmit,
      });

      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(handleReplySubmit).toHaveBeenCalledTimes(1);
    });

    it('handles Enter key submission for repost', async () => {
      const handleRepostSubmit = vi.fn();
      mockUsePostRepost.mockReturnValue({
        repostContent: 'Test repost comment',
        setRepostContent: vi.fn(),
        handleRepostSubmit,
      });

      render(<DialogPostInput variant="repost" postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(handleRepostSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit on Shift+Enter', () => {
      const handleReplySubmit = vi.fn();
      mockUsePostReply.mockReturnValue({
        replyContent: 'Test reply content',
        setReplyContent: vi.fn(),
        handleReplySubmit,
      });

      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(handleReplySubmit).not.toHaveBeenCalled();
    });

    it('handles tag addition', () => {
      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const addButton = screen.getByTestId('add-tag-button');
      fireEvent.click(addButton);

      expect(screen.getByTestId('tag-new-tag')).toBeInTheDocument();
    });

    it('handles tag removal', () => {
      render(<DialogPostInput variant="reply" postId="test-post-123" />);

      const addButton = screen.getByTestId('add-tag-button');
      fireEvent.click(addButton);

      const closeButton = screen.getByTestId('tag-close-0');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('tag-new-tag')).not.toBeInTheDocument();
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

      render(<DialogPostInput variant="reply" postId="test-post-123" onSuccess={onSuccess} />);

      const textarea = screen.getByTestId('textarea');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(handleReplySubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
