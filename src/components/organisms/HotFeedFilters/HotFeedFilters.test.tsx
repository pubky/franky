import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterTimeframe, HotFeedSidebar, HotFeedDrawer, type TimeframeTab } from './HotFeedFilters';

// Mock Atoms
vi.mock('@/atoms', () => ({
  FilterRoot: ({ children }: { children: React.ReactNode }) => <div data-testid="filter-root">{children}</div>,
  FilterHeader: ({ title }: { title: string }) => <div data-testid="filter-header">{title}</div>,
  FilterList: ({ children }: { children: React.ReactNode }) => <ul data-testid="filter-list">{children}</ul>,
  FilterItem: ({
    children,
    isSelected,
    onClick,
  }: {
    children: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <li data-testid="filter-item" data-selected={isSelected} onClick={onClick}>
      {children}
    </li>
  ),
  FilterItemIcon: ({ icon: Icon }: { icon: React.ComponentType }) => (
    <span data-testid="filter-icon">
      <Icon />
    </span>
  ),
  FilterItemLabel: ({ children }: { children: React.ReactNode }) => <span data-testid="filter-label">{children}</span>,
}));

// Mock Molecules
vi.mock('@/molecules', () => ({
  FilterReach: () => <div data-testid="filter-reach">FilterReach</div>,
}));

// Mock Libs icons
vi.mock('@/libs', () => ({
  Star: () => <span>Star</span>,
  Calendar: () => <span>Calendar</span>,
  Clock: () => <span>Clock</span>,
}));

describe('FilterTimeframe', () => {
  it('renders all timeframe options', () => {
    render(<FilterTimeframe />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('calls onTabChange when clicking an option', () => {
    const onTabChange = vi.fn();
    render(<FilterTimeframe selectedTab="today" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('This Month'));
    expect(onTabChange).toHaveBeenCalledWith('thisMonth');
  });

  it('matches snapshot', () => {
    const { container } = render(<FilterTimeframe selectedTab="today" />);
    expect(container).toMatchSnapshot();
  });
});

describe('HotFeedSidebar', () => {
  const defaultProps = {
    reach: 'following' as const,
    setReach: vi.fn(),
    timeframe: 'today' as TimeframeTab,
    setTimeframe: vi.fn(),
  };

  it('renders FilterReach and FilterTimeframe', () => {
    render(<HotFeedSidebar {...defaultProps} />);

    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HotFeedSidebar {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});

describe('HotFeedDrawer', () => {
  const defaultProps = {
    reach: 'following' as const,
    setReach: vi.fn(),
    timeframe: 'today' as TimeframeTab,
    setTimeframe: vi.fn(),
  };

  it('renders FilterReach and FilterTimeframe', () => {
    render(<HotFeedDrawer {...defaultProps} />);

    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HotFeedDrawer {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
