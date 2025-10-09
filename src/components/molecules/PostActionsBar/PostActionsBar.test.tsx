import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostActionsBar } from './PostActionsBar';

// Mock @/libs - use actual implementations
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('PostActionsBar', () => {
  it('calls onTagClick when tag button is clicked', () => {
    const mockOnTagClick = vi.fn();
    render(<PostActionsBar tagCount={15} onTagClick={mockOnTagClick} />);

    const tagButton = screen.getByLabelText(/tag post/i);
    fireEvent.click(tagButton);

    expect(mockOnTagClick).toHaveBeenCalledTimes(1);
  });

  it('calls onReplyClick when reply button is clicked', () => {
    const mockOnReplyClick = vi.fn();
    render(<PostActionsBar replyCount={7} onReplyClick={mockOnReplyClick} />);

    const replyButton = screen.getByLabelText(/reply to post/i);
    fireEvent.click(replyButton);

    expect(mockOnReplyClick).toHaveBeenCalledTimes(1);
  });

  it('calls onRepostClick when repost button is clicked', () => {
    const mockOnRepostClick = vi.fn();
    render(<PostActionsBar repostCount={3} onRepostClick={mockOnRepostClick} />);

    const repostButton = screen.getByLabelText(/repost/i);
    fireEvent.click(repostButton);

    expect(mockOnRepostClick).toHaveBeenCalledTimes(1);
  });

  it('calls onBookmarkClick when bookmark button is clicked', () => {
    const mockOnBookmarkClick = vi.fn();
    render(<PostActionsBar onBookmarkClick={mockOnBookmarkClick} />);

    const bookmarkButton = screen.getByLabelText(/add bookmark/i);
    fireEvent.click(bookmarkButton);

    expect(mockOnBookmarkClick).toHaveBeenCalledTimes(1);
  });

  it('calls onMoreClick when more button is clicked', () => {
    const mockOnMoreClick = vi.fn();
    render(<PostActionsBar onMoreClick={mockOnMoreClick} />);

    const moreButton = screen.getByLabelText(/more options/i);
    fireEvent.click(moreButton);

    expect(mockOnMoreClick).toHaveBeenCalledTimes(1);
  });

  it('updates aria-label for bookmark based on isBookmarked state', () => {
    const { rerender } = render(<PostActionsBar isBookmarked={false} />);
    expect(screen.getByLabelText(/add bookmark/i)).toBeInTheDocument();

    rerender(<PostActionsBar isBookmarked={true} />);
    expect(screen.getByLabelText(/remove bookmark/i)).toBeInTheDocument();
  });
});

describe('PostActionsBar - Snapshots', () => {
  it('matches snapshot with default state', () => {
    const { container } = render(<PostActionsBar tagCount={15} replyCount={7} repostCount={3} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when bookmarked', () => {
    const { container } = render(<PostActionsBar isBookmarked={true} tagCount={15} replyCount={7} repostCount={3} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with high engagement', () => {
    const { container } = render(
      <PostActionsBar tagCount={142} replyCount={89} repostCount={56} isBookmarked={true} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
