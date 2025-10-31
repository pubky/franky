import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SinglePostReplyInput } from './SinglePostReplyInput';
import * as Core from '@/core';

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
  Textarea: vi.fn(({ placeholder, className, value, onChange, onKeyDown }) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  )),
}));

// Mock the hooks
vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({
    ref: { current: null },
    height: 100,
  })),
}));

// Mock the core
vi.mock('@/core', () => ({
  useAuthStore: vi.fn(),
  PostController: {
    create: vi.fn(),
  },
}));

// Mock console.error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

const mockUseAuthStore = vi.mocked(Core.useAuthStore);
const mockPostControllerCreate = vi.mocked(Core.PostController.create);

describe('SinglePostReplyInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue('test-user-id');
    mockPostControllerCreate.mockResolvedValue(undefined);
  });

  it('renders with required postId prop', () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    expect(screen.getByTestId('reply-line')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('handles textarea value changes', () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });

    expect(textarea).toHaveValue('Test reply content');
  });

  it('handles Enter key submission', async () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Test reply content',
        authorId: 'test-user-id',
      });
    });
  });

  it('does not submit on Shift+Enter', () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('does not submit empty content', async () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('trims whitespace from content before submission', async () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: '  Test reply content  ' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Test reply content',
        authorId: 'test-user-id',
      });
    });
  });

  it('clears textarea after successful submission', async () => {
    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('handles submission errors', async () => {
    const error = new Error('Submission failed');
    mockPostControllerCreate.mockRejectedValueOnce(error);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to submit reply:', error);
    });
  });

  it('uses current user ID from auth store', async () => {
    mockUseAuthStore.mockReturnValue('different-user-id');

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockPostControllerCreate).toHaveBeenCalledWith({
        parentPostId: 'test-post-123',
        content: 'Test reply content',
        authorId: 'different-user-id',
      });
    });
  });

  it('does not submit when postId is empty', async () => {
    render(<SinglePostReplyInput postId="" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });

  it('does not submit when currentUserId is null', async () => {
    mockUseAuthStore.mockReturnValue(null);

    render(<SinglePostReplyInput postId="test-post-123" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Test reply content' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(mockPostControllerCreate).not.toHaveBeenCalled();
  });
});

describe('SinglePostReplyInput - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<SinglePostReplyInput postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    const { container } = render(<SinglePostReplyInput postId="different-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty postId', () => {
    const { container } = render(<SinglePostReplyInput postId="" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
