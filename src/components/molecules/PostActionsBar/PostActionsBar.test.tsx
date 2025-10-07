import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostActionsBar } from './PostActionsBar';

// Mock @/libs to intercept icons
vi.mock('@/libs', () => ({
  Tag: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <div data-testid="tag-icon" className={className} data-stroke-width={strokeWidth}>
      Tag
    </div>
  ),
  MessageCircle: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <div data-testid="message-circle-icon" className={className} data-stroke-width={strokeWidth}>
      MessageCircle
    </div>
  ),
  Repeat: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <div data-testid="repeat-icon" className={className} data-stroke-width={strokeWidth}>
      Repeat
    </div>
  ),
  Bookmark: ({ className, strokeWidth, fill }: { className?: string; strokeWidth?: number; fill?: string }) => (
    <div data-testid="bookmark-icon" className={className} data-stroke-width={strokeWidth} data-fill={fill}>
      Bookmark
    </div>
  ),
  Ellipsis: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <div data-testid="ellipsis-icon" className={className} data-stroke-width={strokeWidth}>
      Ellipsis
    </div>
  ),
  LogIn: ({ className }: { className?: string }) => (
    <div data-testid="login-icon" className={className}>
      LogIn
    </div>
  ),
  UserRoundPlus: ({ className }: { className?: string }) => (
    <div data-testid="user-plus-icon" className={className}>
      UserRoundPlus
    </div>
  ),
  Radio: ({ className }: { className?: string }) => (
    <div data-testid="radio-icon" className={className}>
      Radio
    </div>
  ),
  UsersRound2: ({ className }: { className?: string }) => (
    <div data-testid="users-round2-icon" className={className}>
      UsersRound2
    </div>
  ),
  HeartHandshake: ({ className }: { className?: string }) => (
    <div data-testid="heart-handshake-icon" className={className}>
      HeartHandshake
    </div>
  ),
  UserRound: ({ className }: { className?: string }) => (
    <div data-testid="user-round-icon" className={className}>
      UserRound
    </div>
  ),
  SquareAsterisk: ({ className }: { className?: string }) => (
    <div data-testid="square-asterisk-icon" className={className}>
      SquareAsterisk
    </div>
  ),
  Flame: ({ className }: { className?: string }) => (
    <div data-testid="flame-icon" className={className}>
      Flame
    </div>
  ),
  Columns3: ({ className }: { className?: string }) => (
    <div data-testid="columns3-icon" className={className}>
      Columns3
    </div>
  ),
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className}>
      Menu
    </div>
  ),
  LayoutGrid: ({ className }: { className?: string }) => (
    <div data-testid="layout-grid-icon" className={className}>
      LayoutGrid
    </div>
  ),
  Layers: ({ className }: { className?: string }) => (
    <div data-testid="layers-icon" className={className}>
      Layers
    </div>
  ),
  StickyNote: ({ className }: { className?: string }) => (
    <div data-testid="sticky-note-icon" className={className}>
      StickyNote
    </div>
  ),
  Newspaper: ({ className }: { className?: string }) => (
    <div data-testid="newspaper-icon" className={className}>
      Newspaper
    </div>
  ),
  Image: ({ className }: { className?: string }) => (
    <div data-testid="image-icon" className={className}>
      Image
    </div>
  ),
  CirclePlay: ({ className }: { className?: string }) => (
    <div data-testid="circle-play-icon" className={className}>
      CirclePlay
    </div>
  ),
  Link: ({ className }: { className?: string }) => (
    <div data-testid="link-icon" className={className}>
      Link
    </div>
  ),
  Download: ({ className }: { className?: string }) => (
    <div data-testid="download-icon" className={className}>
      Download
    </div>
  ),
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
}));

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
