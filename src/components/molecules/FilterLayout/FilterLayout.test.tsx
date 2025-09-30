import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterLayout, type LayoutTab } from './FilterLayout';

// Mock utilities and icons used directly or indirectly by molecules
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
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

describe('FilterLayout', () => {
  it('renders with default selected tab', () => {
    render(<FilterLayout />);

    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterLayout selectedTab="wide" />);

    const wideItem = screen.getByText('Wide').closest('[data-testid="filter-item"]');
    expect(wideItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Visual'));
    expect(onTabChange).toHaveBeenCalledWith('visual');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterLayout selectedTab="columns" />);

    const columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem2 = screen.getByText('Wide').closest('[data-testid="filter-item"]');

    expect(columnsItem).toMatchSnapshot();
    expect(wideItem2).toMatchSnapshot();
  });

  it('handles all tab types correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);

    (['columns', 'wide', 'visual'] as LayoutTab[]).forEach((tab) => {
      const label = tab === 'columns' ? 'Columns' : tab === 'wide' ? 'Wide' : 'Visual';
      fireEvent.click(screen.getByText(label));
      expect(onTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterLayout selectedTab="columns" />);

    const columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem = screen.getByText('Wide').closest('[data-testid="filter-item"]');

    expect(columnsItem).toMatchSnapshot();
    expect(wideItem).toMatchSnapshot();
  });

  it('renders with correct icons', () => {
    render(<FilterLayout />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('applies correct icon classes', () => {
    render(<FilterLayout />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('rerenders with different selected tabs', () => {
    const { rerender } = render(<FilterLayout selectedTab="columns" />);

    let columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem3 = screen.getByText('Wide').closest('[data-testid="filter-item"]');
    expect(columnsItem).toMatchSnapshot();
    expect(wideItem3).toMatchSnapshot();

    rerender(<FilterLayout selectedTab="visual" />);
    columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const visualItem = screen.getByText('Visual').closest('[data-testid="filter-item"]');
    expect(columnsItem).toMatchSnapshot();
    expect(visualItem).toMatchSnapshot();
  });
});
