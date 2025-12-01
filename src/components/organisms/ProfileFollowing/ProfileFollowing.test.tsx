import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFollowing } from './ProfileFollowing';

// Mock Hooks
vi.mock('@/hooks', () => ({
  useProfileConnections: vi.fn(() => ({
    connections: [],
    count: 0,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    loadMore: vi.fn(),
    refresh: vi.fn(),
  })),
  useInfiniteScroll: vi.fn(() => ({
    sentinelRef: { current: null },
  })),
  CONNECTION_TYPE: {
    FOLLOWERS: 'followers',
    FOLLOWING: 'following',
    FRIENDS: 'friends',
  },
}));

// Mock Atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({ children }: { children: React.ReactNode }) => <h5 data-testid="heading">{children}</h5>,
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock Molecules
vi.mock('@/molecules', () => ({
  FollowingEmpty: () => <div data-testid="following-empty">No following</div>,
  UserConnectionsList: ({ connections }: { connections: unknown[] }) => (
    <div data-testid="user-connections-list">{connections.length} connections</div>
  ),
}));

describe('ProfileFollowing', () => {
  it('renders empty state when no connections', () => {
    render(<ProfileFollowing />);
    expect(screen.getByTestId('following-empty')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfileFollowing />);
    expect(container).toMatchSnapshot();
  });
});
