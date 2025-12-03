import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFollowers } from './ProfileFollowers';

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
  FollowersEmpty: () => <div data-testid="followers-empty">No followers</div>,
  UserListItem: ({ user }: { user: { id: string } }) => (
    <div data-testid="user-list-item" data-user-id={user.id}>
      User item
    </div>
  ),
}));

describe('ProfileFollowers', () => {
  it('renders empty state when no connections', () => {
    render(<ProfileFollowers />);
    expect(screen.getByTestId('followers-empty')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfileFollowers />);
    expect(container).toMatchSnapshot();
  });
});
