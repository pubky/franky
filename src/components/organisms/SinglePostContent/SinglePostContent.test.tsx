import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SinglePostContent } from './SinglePostContent';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock the atoms
vi.mock('@/atoms', () => ({
  Typography: vi.fn(({ children, className }) => (
    <div data-testid="typography" className={className}>
      {children}
    </div>
  )),
}));

// Mock the core
vi.mock('@/core', () => ({
  db: {
    post_details: {
      get: vi.fn().mockResolvedValue({ content: 'Mock content' }),
    },
  },
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockDbGet = vi.mocked(Core.db.post_details.get);

describe('SinglePostContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required postId prop', () => {
    const mockPostDetails = { content: 'Test post content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<SinglePostContent postId="test-post-123" />);

    expect(screen.getByTestId('typography')).toBeInTheDocument();
    expect(screen.getByText('Test post content')).toBeInTheDocument();
  });

  it('renders null when postDetails is not available', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { container } = render(<SinglePostContent postId="test-post-123" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders null when postDetails is undefined', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    const { container } = render(<SinglePostContent postId="test-post-123" />);

    expect(container.firstChild).toBeNull();
  });

  it('handles empty content', () => {
    const mockPostDetails = { content: '' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<SinglePostContent postId="test-post-123" />);

    const typography = screen.getByTestId('typography');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveTextContent('');
  });

  it('handles different postId values', () => {
    const mockPostDetails = { content: 'Content for different post' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { rerender } = render(<SinglePostContent postId="post-1" />);
    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), ['post-1']);

    rerender(<SinglePostContent postId="post-2" />);
    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), ['post-2']);
  });

  it('calls Core.db.post_details.get with correct postId', async () => {
    const mockPostDetails = { content: 'Test content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<SinglePostContent postId="test-post-123" />);

    // The useLiveQuery callback should call Core.db.post_details.get
    const callback = mockUseLiveQuery.mock.calls[0][0];
    await callback();

    expect(mockDbGet).toHaveBeenCalledWith('test-post-123');
  });
});

describe('SinglePostContent - Snapshots', () => {
  it('matches snapshot with content', () => {
    const mockPostDetails = { content: 'Test post content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<SinglePostContent postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiline content', () => {
    const mockPostDetails = { content: 'Line 1\nLine 2\nLine 3' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<SinglePostContent postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty content', () => {
    const mockPostDetails = { content: '' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<SinglePostContent postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with long content', () => {
    const longContent =
      'This is a very long post content that spans multiple lines and contains a lot of text to test how the component handles longer content. It should still render properly and maintain the whitespace-pre-line styling.';
    const mockPostDetails = { content: longContent };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<SinglePostContent postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with special characters', () => {
    const specialContent = 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
    const mockPostDetails = { content: specialContent };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<SinglePostContent postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    const mockPostDetails = { content: 'Content for different post' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<SinglePostContent postId="different-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
