import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterReach, type ReachTab } from './FilterReach';

vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
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
}));

describe('FilterReach', () => {
  it('renders with default selected tab', () => {
    render(<FilterReach />);

    expect(screen.getByText('Reach')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Me')).toBeInTheDocument();
  });

  it('renders with custom selected tab', () => {
    render(<FilterReach selectedTab="following" />);

    const followingItem = screen.getByText('Following').closest('[data-testid="filter-item"]');
    expect(followingItem).toHaveClass('text-foreground');
  });

  it('calls onTabChange when tab is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterReach onTabChange={mockOnTabChange} />);

    const friendsElement = screen.getByText('Friends');
    fireEvent.click(friendsElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('friends');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterReach selectedTab="me" />);

    const meItem = screen.getByText('Me').closest('[data-testid="filter-item"]');
    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');

    expect(meItem).toHaveClass('text-foreground');
    expect(allItem).toHaveClass('text-muted-foreground');
  });

  it('handles all tab types correctly', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterReach onTabChange={mockOnTabChange} />);

    const tabs: ReachTab[] = ['all', 'following', 'friends', 'me'];

    tabs.forEach((tab) => {
      const element = screen.getByText(
        tab === 'all' ? 'All' : tab === 'following' ? 'Following' : tab === 'friends' ? 'Friends' : 'Me',
      );

      fireEvent.click(element);
      expect(mockOnTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterReach selectedTab="all" />);

    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const followingItem = screen.getByText('Following').closest('[data-testid="filter-item"]');

    expect(allItem).toHaveClass('text-foreground', 'cursor-pointer', 'flex', 'gap-2');
    expect(followingItem).toHaveClass('text-muted-foreground', 'hover:text-secondary-foreground');
  });
});
