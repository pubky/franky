import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeFeedSidebar, HomeFeedDrawer, HomeFeedDrawerMobile } from './HomeFeedSidebar';

// Mock Core.useHomeStore
vi.mock('@/core', () => ({
  useHomeStore: vi.fn(() => ({
    layout: 'column',
    setLayout: vi.fn(),
    reach: 'following',
    setReach: vi.fn(),
    sort: 'recent',
    setSort: vi.fn(),
    content: 'posts',
    setContent: vi.fn(),
  })),
}));

// Mock Atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock Molecules
vi.mock('@/molecules', () => ({
  FilterReach: () => <div data-testid="filter-reach">FilterReach</div>,
  FilterSort: () => <div data-testid="filter-sort">FilterSort</div>,
  FilterContent: () => <div data-testid="filter-content">FilterContent</div>,
  FilterLayout: () => <div data-testid="filter-layout">FilterLayout</div>,
}));

describe('HomeFeedSidebar', () => {
  it('renders all filter components', () => {
    render(<HomeFeedSidebar />);

    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    expect(screen.getByTestId('filter-layout')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeFeedSidebar />);
    expect(container).toMatchSnapshot();
  });
});

describe('HomeFeedDrawer', () => {
  it('renders all filter components', () => {
    render(<HomeFeedDrawer />);

    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    expect(screen.getByTestId('filter-layout')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeFeedDrawer />);
    expect(container).toMatchSnapshot();
  });
});

describe('HomeFeedDrawerMobile', () => {
  it('renders filter components without layout filter', () => {
    render(<HomeFeedDrawerMobile />);

    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    // Mobile doesn't show layout filter
    expect(screen.queryByTestId('filter-layout')).not.toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeFeedDrawerMobile />);
    expect(container).toMatchSnapshot();
  });
});
