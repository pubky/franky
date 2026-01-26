import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  WhoToFollowPageLeftSidebar,
  WhoToFollowPageLeftDrawer,
  WhoToFollowPageRightSidebar,
  WhoToFollowPageRightDrawer,
} from './WhoToFollowPageSidebar';

// Mock Molecules
vi.mock('@/molecules', () => ({
  FilterSortWhoToFollow: () => <div data-testid="filter-sort-who-to-follow">Sort Filter</div>,
}));

// Mock Atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock Organisms
vi.mock('@/organisms', () => ({
  ActiveUsers: () => <div data-testid="active-users">Active Users</div>,
  FeedbackCard: () => <div data-testid="feedback-card">Feedback Card</div>,
}));

describe('WhoToFollowPageLeftSidebar', () => {
  it('renders FilterSortWhoToFollow', () => {
    render(<WhoToFollowPageLeftSidebar />);
    expect(screen.getByTestId('filter-sort-who-to-follow')).toBeInTheDocument();
  });
});

describe('WhoToFollowPageLeftDrawer', () => {
  it('renders FilterSortWhoToFollow in container', () => {
    render(<WhoToFollowPageLeftDrawer />);
    expect(screen.getByTestId('filter-sort-who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });
});

describe('WhoToFollowPageRightSidebar', () => {
  it('renders ActiveUsers and FeedbackCard', () => {
    render(<WhoToFollowPageRightSidebar />);
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });
});

describe('WhoToFollowPageRightDrawer', () => {
  it('renders ActiveUsers and FeedbackCard in container', () => {
    render(<WhoToFollowPageRightDrawer />);
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });
});

describe('WhoToFollowPageSidebar - Snapshots', () => {
  it('matches snapshot for LeftSidebar', () => {
    const { container } = render(<WhoToFollowPageLeftSidebar />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for LeftDrawer', () => {
    const { container } = render(<WhoToFollowPageLeftDrawer />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for RightSidebar', () => {
    const { container } = render(<WhoToFollowPageRightSidebar />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for RightDrawer', () => {
    const { container } = render(<WhoToFollowPageRightDrawer />);
    expect(container).toMatchSnapshot();
  });
});
