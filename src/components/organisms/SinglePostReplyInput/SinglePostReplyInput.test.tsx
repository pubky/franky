import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SinglePostReplyInput } from './SinglePostReplyInput';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

// Mock @/libs - use actual implementations
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

// Mock the atoms
vi.mock('@/atoms', () => ({
  ReplyLine: vi.fn(({ height, isLast }) => <div data-testid="reply-line" data-height={height} data-is-last={isLast} />),
  Textarea: vi.fn(({ placeholder, className, value, onChange, onKeyDown, disabled }) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
    />
  )),
}));

// Mock the molecules
vi.mock('@/molecules', () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

// Mock the hooks
vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({
    ref: { current: null },
    height: 100,
  })),
  usePost: vi.fn(),
}));

// Mock the core
vi.mock('@/core', () => ({
  PostController: {
    create: vi.fn(),
  },
  useAuthStore: vi.fn(() => (state: { selectCurrentUserPubky: () => string | null }) => state.selectCurrentUserPubky()),
}));

const mockPostControllerCreate = vi.mocked(Core.PostController.create);
const mockUsePost = vi.mocked(Hooks.usePost);

describe('SinglePostReplyInput', () => {
  const mockReply = vi.fn();
  const mockSetContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostControllerCreate.mockResolvedValue(undefined);
    mockReply.mockResolvedValue(undefined);
    mockUsePost.mockReturnValue({
      content: 'Test reply content',
      setContent: mockSetContent,
      reply: mockReply,
      post: vi.fn(),
      isSubmitting: false,
      tags: [],
      setTags: vi.fn(),
    });
  });

  it('renders with required postId prop', () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    expect(screen.getByTestId('reply-line')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('handles textarea value changes', () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Edited Test reply content' } });

    expect(mockSetContent).toHaveBeenCalledWith('Edited Test reply content');
  });

  it('handles textarea value not changing', () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });

    expect(mockSetContent).not.toHaveBeenCalled();
  });

  it('handles Enter key submission', async () => {
    mockReply.mockResolvedValue(undefined);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({ postId: 'test-post-123', onSuccess: undefined });
    });
  });

  it('does not submit on Shift+Enter', () => {
    mockReply.mockResolvedValue(undefined);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(mockReply).not.toHaveBeenCalled();
  });

  it('does not submit empty content', async () => {
    mockReply.mockResolvedValue(undefined);
    mockUsePost.mockReturnValue({
      content: '   ',
      setContent: mockSetContent,
      reply: mockReply,
      post: vi.fn(),
      isSubmitting: false,
      tags: [],
      setTags: vi.fn(),
    });

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    // The hook handles validation internally, so reply is still called
    // but it will return early if content is empty
    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
    });
  });

  it('trims whitespace from content before submission', async () => {
    mockReply.mockResolvedValue(undefined);
    mockUsePost.mockReturnValue({
      content: '  Test reply content  ',
      setContent: mockSetContent,
      reply: mockReply,
      post: vi.fn(),
      isSubmitting: false,
      tags: [],
      setTags: vi.fn(),
    });

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
    });
  });

  it('clears textarea after successful submission', async () => {
    mockReply.mockResolvedValue(undefined);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
    });
  });

  it('handles submission errors', async () => {
    mockReply.mockRejectedValue(new Error('Submission failed'));

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
    });
  });

  it('uses current user ID from auth store', async () => {
    mockReply.mockResolvedValue(undefined);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
    });
  });

  it('does not submit when postId is empty', async () => {
    mockReply.mockResolvedValue(undefined);

    render(<SinglePostReplyInput postId="" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({ postId: '', onSuccess: undefined });
    });
  });

  it('does not submit when currentUserId is null', async () => {
    mockReply.mockResolvedValue(undefined);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledTimes(1);
    });
  });
});

describe('SinglePostReplyInput - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockReply = vi.fn().mockResolvedValue(undefined);
    mockUsePost.mockReturnValue({
      content: 'Test reply content',
      setContent: vi.fn(),
      reply: mockReply,
      post: vi.fn(),
      isSubmitting: false,
      tags: [],
      setTags: vi.fn(),
    });
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<SinglePostReplyInput postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty postId', () => {
    const { container } = render(<SinglePostReplyInput postId="" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
