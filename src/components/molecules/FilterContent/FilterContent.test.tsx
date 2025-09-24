import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterContent, type ContentTab } from './FilterContent';

vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
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
  // Icons needed by other molecules that may be imported via index
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
}));

describe('FilterContent', () => {
  it('renders with default selected tab', () => {
    render(<FilterContent />);

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
  });

  it('renders with custom selected tab', () => {
    render(<FilterContent selectedTab="videos" />);

    const videosItem = screen.getByText('Videos').closest('[data-testid="filter-item"]');
    expect(videosItem).toHaveClass('text-foreground');
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Images'));
    expect(onTabChange).toHaveBeenCalledWith('images');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterContent selectedTab="posts" />);

    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');
    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');

    expect(postsItem).toHaveClass('text-foreground');
    expect(allItem).toHaveClass('text-muted-foreground');
  });

  it('handles all tab types correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    const tabs: ContentTab[] = ['all', 'posts', 'articles', 'images', 'videos', 'links', 'files'];

    tabs.forEach((tab) => {
      const label =
        tab === 'all'
          ? 'All'
          : tab === 'posts'
            ? 'Posts'
            : tab === 'articles'
              ? 'Articles'
              : tab === 'images'
                ? 'Images'
                : tab === 'videos'
                  ? 'Videos'
                  : tab === 'links'
                    ? 'Links'
                    : 'Files';

      fireEvent.click(screen.getByText(label));
      expect(onTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterContent selectedTab="all" />);

    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');

    expect(allItem).toHaveClass('text-foreground', 'cursor-pointer', 'flex', 'gap-2');
    expect(postsItem).toHaveClass('text-muted-foreground', 'hover:text-secondary-foreground');
  });

  it('renders with correct icons', () => {
    render(<FilterContent />);

    expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sticky-note-icon')).toBeInTheDocument();
    expect(screen.getByTestId('newspaper-icon')).toBeInTheDocument();
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    expect(screen.getByTestId('circle-play-icon')).toBeInTheDocument();
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('applies correct icon classes', () => {
    render(<FilterContent />);

    expect(screen.getByTestId('layers-icon')).toHaveClass('w-5', 'h-5');
    expect(screen.getByTestId('sticky-note-icon')).toHaveClass('w-5', 'h-5');
    expect(screen.getByTestId('newspaper-icon')).toHaveClass('w-5', 'h-5');
    expect(screen.getByTestId('image-icon')).toHaveClass('w-5', 'h-5');
    expect(screen.getByTestId('circle-play-icon')).toHaveClass('w-5', 'h-5');
    expect(screen.getByTestId('link-icon')).toHaveClass('w-5', 'h-5');
    expect(screen.getByTestId('download-icon')).toHaveClass('w-5', 'h-5');
  });

  it('handles tab switching correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterContent selectedTab="all" onTabChange={onTabChange} />);

    // Click on articles tab
    fireEvent.click(screen.getByText('Articles'));
    expect(onTabChange).toHaveBeenCalledWith('articles');
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it('rerenders with different selected tabs', () => {
    const { rerender } = render(<FilterContent selectedTab="all" />);

    let allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');
    expect(allItem).toHaveClass('text-foreground');
    expect(postsItem).toHaveClass('text-muted-foreground');

    // Rerender with different selected tab
    rerender(<FilterContent selectedTab="videos" />);
    allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const videosItem = screen.getByText('Videos').closest('[data-testid="filter-item"]');
    expect(allItem).toHaveClass('text-muted-foreground');
    expect(videosItem).toHaveClass('text-foreground');
  });

  it('handles multiple tab clicks', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Images'));
    fireEvent.click(screen.getByText('Videos'));
    fireEvent.click(screen.getByText('Files'));

    expect(onTabChange).toHaveBeenCalledTimes(3);
    expect(onTabChange).toHaveBeenNthCalledWith(1, 'images');
    expect(onTabChange).toHaveBeenNthCalledWith(2, 'videos');
    expect(onTabChange).toHaveBeenNthCalledWith(3, 'files');
  });
});
