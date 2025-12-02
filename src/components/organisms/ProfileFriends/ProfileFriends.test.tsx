import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFriends } from './ProfileFriends';

// Mock Providers
vi.mock('@/providers', () => ({
  useProfileContext: vi.fn(() => ({
    pubky: 'user123',
    isOwnProfile: true,
    isLoading: false,
  })),
}));

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
  useFollowUser: vi.fn(() => ({
    toggleFollow: vi.fn(),
    isLoading: false,
    error: null,
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
  FriendsEmpty: () => <div data-testid="friends-empty">No friends</div>,
  UserConnectionsList: ({ connections }: { connections: unknown[] }) => (
    <div data-testid="user-connections-list">{connections.length} connections</div>
  ),
}));

describe('ProfileFriends', () => {
  it('renders empty state when no connections', () => {
    render(<ProfileFriends />);
    expect(screen.getByTestId('friends-empty')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfileFriends />);
    expect(container).toMatchSnapshot();
  });
});
