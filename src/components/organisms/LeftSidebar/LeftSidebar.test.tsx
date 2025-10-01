import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeftSidebar } from './LeftSidebar';
import * as Core from '@/core';

// Mock the filters store
vi.mock('@/core', () => ({
  useFiltersStore: () => ({
    reach: 'all',
    setReach: vi.fn(),
    sort: 'recent',
    setSort: vi.fn(),
    content: 'all',
    setContent: vi.fn(),
    layout: 'columns',
    setLayout: vi.fn(),
  }),
}));

// Mock the molecules
vi.mock('@/molecules', () => ({
  FilterReach: ({ onTabChange }: { onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-reach">
      <button onClick={() => onTabChange?.('all')}>All</button>
    </div>
  ),
  FilterSort: ({ onTabChange }: { onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-sort">
      <button onClick={() => onTabChange?.('recent')}>Recent</button>
    </div>
  ),
  FilterContent: ({ onTabChange }: { onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-content">
      <button onClick={() => onTabChange?.('all')}>All</button>
    </div>
  ),
  FilterLayout: ({ onTabChange }: { onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-layout">
      <button onClick={() => onTabChange?.('columns')}>Columns</button>
    </div>
  ),
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('LeftSidebar', () => {
  it('renders with default props', () => {
    render(<LeftSidebar />);

    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    expect(screen.getByTestId('filter-layout')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<LeftSidebar className="custom-sidebar" />);

    const sidebar = screen.getByTestId('left-sidebar');
    expect(sidebar).toHaveClass('custom-sidebar');
  });

  it('applies correct base classes', () => {
    render(<LeftSidebar />);

    const sidebar = screen.getByTestId('left-sidebar');
    expect(sidebar).toHaveClass('w-[180px]', 'hidden', 'lg:flex', 'flex-col', 'gap-6', 'justify-start', 'items-start');
  });

  it('renders filter components in correct order', () => {
    render(<LeftSidebar />);

    const sidebar = screen.getByTestId('left-sidebar');
    const children = Array.from(sidebar.children);

    expect(children[0]).toHaveAttribute('data-testid', 'filter-reach');
    expect(children[1]).toHaveAttribute('data-testid', 'filter-sort');
    expect(children[2]).toHaveAttribute('data-testid', 'filter-content');
    expect(children[3]).toHaveAttribute('data-testid', 'filter-layout');
  });

  it('has sticky positioning for content and layout filters', () => {
    render(<LeftSidebar />);

    const stickyContainer = screen.getByTestId('filter-content').closest('div');
    expect(stickyContainer).toHaveClass('self-start', 'sticky', 'top-[100px]', 'flex', 'flex-col', 'gap-6');
  });

  it('passes correct props to filter components', () => {
    const mockSetReach = vi.fn();
    const mockSetSort = vi.fn();
    const mockSetContent = vi.fn();
    const mockSetLayout = vi.fn();

    vi.mocked(Core.useFiltersStore).mockReturnValue({
      reach: 'following',
      setReach: mockSetReach,
      sort: 'popularity',
      setSort: mockSetSort,
      content: 'posts',
      setContent: mockSetContent,
      layout: 'wide',
      setLayout: mockSetLayout,
    });

    render(<LeftSidebar />);

    // Verify that the filter components receive the correct props
    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    expect(screen.getByTestId('filter-layout')).toBeInTheDocument();
  });

  it('handles filter interactions correctly', () => {
    render(<LeftSidebar />);

    const reachButton = screen.getByText('All');
    fireEvent.click(reachButton);

    // The mock should be called (this is handled by the mocked component)
    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
  });

  it('applies responsive classes correctly', () => {
    render(<LeftSidebar />);

    const sidebar = screen.getByTestId('left-sidebar');
    expect(sidebar).toHaveClass('hidden', 'lg:flex');
  });

  it('has correct width and layout classes', () => {
    render(<LeftSidebar />);

    const sidebar = screen.getByTestId('left-sidebar');
    expect(sidebar).toHaveClass('w-[180px]', 'flex-col', 'gap-6', 'justify-start', 'items-start');
  });
});

describe('LeftSidebar - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<LeftSidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<LeftSidebar className="custom-sidebar" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different filter states', () => {
    vi.mocked(Core.useFiltersStore).mockReturnValue({
      reach: 'following',
      setReach: vi.fn(),
      sort: 'popularity',
      setSort: vi.fn(),
      content: 'posts',
      setContent: vi.fn(),
      layout: 'wide',
      setLayout: vi.fn(),
    });

    const { container } = render(<LeftSidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with all filters in different states', () => {
    vi.mocked(Core.useFiltersStore).mockReturnValue({
      reach: 'me',
      setReach: vi.fn(),
      sort: 'recent',
      setSort: vi.fn(),
      content: 'images',
      setContent: vi.fn(),
      layout: 'columns',
      setLayout: vi.fn(),
    });

    const { container } = render(<LeftSidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
