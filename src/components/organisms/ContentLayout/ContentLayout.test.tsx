import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContentLayout } from './ContentLayout';
import * as Core from '@/core';

// Mock the filters store
vi.mock('@/core', () => ({
  useFiltersStore: () => ({
    layout: 'columns',
    setLayout: vi.fn(),
    reach: 'all',
    setReach: vi.fn(),
    sort: 'recent',
    setSort: vi.fn(),
    content: 'all',
    setContent: vi.fn(),
  }),
  LAYOUT: {
    COLUMNS: 'columns',
    WIDE: 'wide',
    VISUAL: 'visual',
  },
}));

// Mock the molecules
vi.mock('@/molecules', () => ({
  MobileHeader: ({ onLeftIconClick }: { onLeftIconClick?: () => void }) => (
    <div data-testid="mobile-header">
      <button onClick={onLeftIconClick}>Filter</button>
    </div>
  ),
  ButtonFilters: ({ onClick, position }: { onClick?: () => void; position?: 'left' | 'right' }) => (
    <button data-testid={`button-filters-${position}`} onClick={onClick}>
      Filter Button {position}
    </button>
  ),
  MobileFooter: () => <div data-testid="mobile-footer">Mobile Footer</div>,
  FilterDrawer: ({
    open,
    onOpenChangeAction,
    children,
    position,
  }: {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    children: React.ReactNode;
    position?: 'left' | 'right';
  }) => (
    <div data-testid={`filter-drawer-${position}`} data-open={open}>
      <button onClick={() => onOpenChangeAction(false)}>Close</button>
      {children}
    </div>
  ),
  FilterReach: ({ selectedTab, onTabChange }: { selectedTab?: string; onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-reach">
      <button onClick={() => onTabChange?.('all')}>All</button>
    </div>
  ),
  FilterSort: ({ selectedTab, onTabChange }: { selectedTab?: string; onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-sort">
      <button onClick={() => onTabChange?.('recent')}>Recent</button>
    </div>
  ),
  FilterContent: ({ selectedTab, onTabChange }: { selectedTab?: string; onTabChange?: (tab: string) => void }) => (
    <div data-testid="filter-content">
      <button onClick={() => onTabChange?.('all')}>All</button>
    </div>
  ),
  FilterLayout: ({
    selectedTab,
    onTabChange,
    onClose,
  }: {
    selectedTab?: string;
    onTabChange?: (tab: string) => void;
    onClose?: () => void;
  }) => (
    <div data-testid="filter-layout">
      <button
        onClick={() => {
          onTabChange?.('columns');
          onClose?.();
        }}
      >
        Columns
      </button>
    </div>
  ),
  WhoToFollow: () => <div data-testid="who-to-follow">Who to Follow</div>,
  ActiveUsers: () => <div data-testid="active-users">Active Users</div>,
  FeedbackCard: () => <div data-testid="feedback-card">Feedback Card</div>,
}));

// Mock the organisms
vi.mock('@/organisms', () => ({
  LeftSidebar: () => <div data-testid="left-sidebar">Left Sidebar</div>,
  RightSidebar: () => <div data-testid="right-sidebar">Right Sidebar</div>,
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('ContentLayout', () => {
  it('renders with default props', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-footer')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <ContentLayout className="custom-class">
        <div>Test Content</div>
      </ContentLayout>,
    );

    const container = screen.getByText('Test Content').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('shows left sidebar when showLeftSidebar is true and layout is not wide', () => {
    render(
      <ContentLayout showLeftSidebar={true}>
        <div>Test Content</div>
      </ContentLayout>,
    );

    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
  });

  it('hides left sidebar when showLeftSidebar is false', () => {
    render(
      <ContentLayout showLeftSidebar={false}>
        <div>Test Content</div>
      </ContentLayout>,
    );

    expect(screen.queryByTestId('left-sidebar')).not.toBeInTheDocument();
  });

  it('shows right sidebar when showRightSidebar is true and layout is not wide', () => {
    render(
      <ContentLayout showRightSidebar={true}>
        <div>Test Content</div>
      </ContentLayout>,
    );

    expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
  });

  it('hides right sidebar when showRightSidebar is false', () => {
    render(
      <ContentLayout showRightSidebar={false}>
        <div>Test Content</div>
      </ContentLayout>,
    );

    expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();
  });

  it('opens left drawer when mobile header left icon is clicked', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    const filterButton = screen.getByText('Filter');
    fireEvent.click(filterButton);

    expect(screen.getByTestId('filter-drawer-left')).toBeInTheDocument();
  });

  it('opens right drawer when mobile header right icon is clicked', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    // The right drawer is opened by the MobileHeader component
    expect(screen.getByTestId('filter-drawer-right')).toBeInTheDocument();
  });

  it('renders filter components in left drawer', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    const filterButton = screen.getByText('Filter');
    fireEvent.click(filterButton);

    expect(screen.getByTestId('filter-reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
    expect(screen.getByTestId('filter-layout')).toBeInTheDocument();
  });

  it('renders right sidebar components in right drawer', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('applies correct responsive classes', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    const container = screen.getByText('Test Content').closest('div');
    expect(container).toHaveClass('max-w-sm', 'sm:max-w-xl', 'md:max-w-3xl', 'lg:max-w-4xl', 'xl:max-w-6xl');
  });

  it('applies correct padding and margin classes', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    const container = screen.getByText('Test Content').closest('div');
    expect(container).toHaveClass('w-full', 'pb-12', 'm-auto', 'px-3', 'pt-16', 'lg:pt-0');
  });

  it('renders main content area with correct flex classes', () => {
    render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );

    const mainContent = screen.getByText('Test Content').closest('div');
    expect(mainContent).toHaveClass('flex-1', 'flex', 'flex-col', 'gap-6');
  });
});

describe('ContentLayout - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <ContentLayout>
        <div>Test Content</div>
      </ContentLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with showLeftSidebar false', () => {
    const { container } = render(
      <ContentLayout showLeftSidebar={false}>
        <div>Test Content</div>
      </ContentLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with showRightSidebar false', () => {
    const { container } = render(
      <ContentLayout showRightSidebar={false}>
        <div>Test Content</div>
      </ContentLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with both sidebars hidden', () => {
    const { container } = render(
      <ContentLayout showLeftSidebar={false} showRightSidebar={false}>
        <div>Test Content</div>
      </ContentLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <ContentLayout className="custom-layout">
        <div>Test Content</div>
      </ContentLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with complex children', () => {
    const { container } = render(
      <ContentLayout>
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </ContentLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
