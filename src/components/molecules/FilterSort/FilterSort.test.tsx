import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterSort, type SortTab } from './FilterSort';

vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
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

describe('FilterSort', () => {
  it('renders with default selected tab', () => {
    render(<FilterSort />);

    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterSort selectedTab="popularity" />);

    const popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');
    expect(popularityItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort onTabChange={mockOnTabChange} />);

    const popularityElement = screen.getByText('Popularity');
    fireEvent.click(popularityElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('popularity');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterSort selectedTab="recent" />);

    const recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    const popularityItem2 = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem2).toMatchSnapshot();
  });

  it('handles all tab types correctly', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort onTabChange={mockOnTabChange} />);

    const tabs: SortTab[] = ['recent', 'popularity'];

    tabs.forEach((tab) => {
      const element = screen.getByText(tab === 'recent' ? 'Recent' : 'Popularity');

      fireEvent.click(element);
      expect(mockOnTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterSort selectedTab="recent" />);

    const recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    const popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem).toMatchSnapshot();
  });

  it('renders with correct icons', () => {
    render(<FilterSort />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('applies correct icon classes', () => {
    render(<FilterSort />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('handles tab switching correctly', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort selectedTab="recent" onTabChange={mockOnTabChange} />);

    // Click on popularity tab
    const popularityElement = screen.getByText('Popularity');
    fireEvent.click(popularityElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('popularity');
    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
  });

  it('renders with different selected tabs', () => {
    const { rerender } = render(<FilterSort selectedTab="recent" />);

    let recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    let popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem).toMatchSnapshot();

    // Rerender with different selected tab
    rerender(<FilterSort selectedTab="popularity" />);

    recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem).toMatchSnapshot();
  });
});
