import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterContent, type ContentTab } from './FilterContent';
import { CONTENT } from '@/core/stores/filters/filters.types';

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
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterContent selectedTab={CONTENT.VIDEOS} />);

    const videosItem = screen.getByText('Videos').closest('[data-testid="filter-item"]');
    expect(videosItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Images'));
    expect(onTabChange).toHaveBeenCalledWith('images');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterContent selectedTab={CONTENT.POSTS} />);

    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');
    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');

    expect(postsItem).toMatchSnapshot();
    expect(allItem).toMatchSnapshot();
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
    render(<FilterContent selectedTab={CONTENT.ALL} />);

    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');

    expect(allItem).toMatchSnapshot();
    expect(postsItem).toMatchSnapshot();
  });

  it('renders with correct icons', () => {
    render(<FilterContent />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('applies correct icon classes', () => {
    render(<FilterContent />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('handles tab switching correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterContent selectedTab={CONTENT.ALL} onTabChange={onTabChange} />);

    // Click on articles tab
    fireEvent.click(screen.getByText('Articles'));
    expect(onTabChange).toHaveBeenCalledWith('articles');
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it('rerenders with different selected tabs', () => {
    const { rerender } = render(<FilterContent selectedTab="all" />);

    let allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');
    expect(allItem).toMatchSnapshot();
    expect(postsItem).toMatchSnapshot();

    // Rerender with different selected tab
    rerender(<FilterContent selectedTab="videos" />);
    allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const videosItem2 = screen.getByText('Videos').closest('[data-testid="filter-item"]');
    expect(allItem).toMatchSnapshot();
    expect(videosItem2).toMatchSnapshot();
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
