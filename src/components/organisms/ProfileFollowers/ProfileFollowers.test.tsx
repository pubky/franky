import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFollowers } from './ProfileFollowers';
import * as Hooks from '@/hooks';
import * as Core from '@/core';

// Mock Providers
vi.mock('@/providers', () => ({
  useProfileContext: vi.fn(() => ({
    pubky: 'user123',
    isOwnProfile: true,
    isLoading: false,
  })),
}));

// Mock Core
vi.mock('@/core', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { currentUserPubky: 'current-user-123' };
    return selector ? selector(state) : state;
  }),
}));

// Mock Hooks
const mockUseProfileConnections = vi.fn(() => ({
  connections: [],
  count: 0,
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  loadMore: vi.fn(),
  refresh: vi.fn(),
  error: null,
}));

const mockUseInfiniteScroll = vi.fn(() => ({
  sentinelRef: { current: null },
}));

const mockUseFollowUser = vi.fn(() => ({
  toggleFollow: vi.fn(),
  isUserLoading: vi.fn(() => false),
  isLoading: false,
  error: null,
}));

vi.mock('@/hooks', () => ({
  useProfileConnections: vi.fn(),
  useInfiniteScroll: vi.fn(),
  useFollowUser: vi.fn(),
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

const mockConnections = [
  {
    id: 'user-1' as Core.Pubky,
    name: 'John Doe',
    bio: 'Test bio',
    image: null,
    status: 'active',
    links: null,
    indexed_at: 1704067200000,
    avatarUrl: null,
    tags: [],
    stats: { tags: 10, posts: 5 },
    isFollowing: false,
  },
  {
    id: 'user-2' as Core.Pubky,
    name: 'Jane Smith',
    bio: 'Another bio',
    image: null,
    status: 'active',
    links: null,
    indexed_at: 1704067200000,
    avatarUrl: null,
    tags: [],
    stats: { tags: 20, posts: 10 },
    isFollowing: true,
  },
];

const mockLoadingConnectionsResult = {
  connections: [],
  count: 0,
  isLoading: true,
  isLoadingMore: false,
  hasMore: false,
  loadMore: vi.fn(),
  refresh: vi.fn(),
  error: null,
};

const mockConnectionsResult = {
  connections: mockConnections,
  count: 2,
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  loadMore: vi.fn(),
  refresh: vi.fn(),
  error: null,
};

describe('ProfileFollowers', () => {
  beforeEach(() => {
    vi.mocked(Hooks.useProfileConnections).mockImplementation(mockUseProfileConnections);
    vi.mocked(Hooks.useInfiniteScroll).mockImplementation(mockUseInfiniteScroll);
    vi.mocked(Hooks.useFollowUser).mockImplementation(mockUseFollowUser);
  });

  it('renders empty state when no connections', () => {
    render(<ProfileFollowers />);
    expect(screen.getByTestId('followers-empty')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    vi.mocked(Hooks.useProfileConnections).mockReturnValue(mockLoadingConnectionsResult);
    render(<ProfileFollowers />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders connections when there are items', () => {
    vi.mocked(Hooks.useProfileConnections).mockReturnValue(mockConnectionsResult);

    render(<ProfileFollowers />);
    const userItems = screen.getAllByTestId('user-list-item');
    expect(userItems).toHaveLength(2);
    expect(userItems[0]).toHaveAttribute('data-user-id', 'user-1');
    expect(userItems[1]).toHaveAttribute('data-user-id', 'user-2');
  });
});

describe('ProfileFollowers - Snapshots', () => {
  beforeEach(() => {
    vi.mocked(Hooks.useProfileConnections).mockImplementation(mockUseProfileConnections);
    vi.mocked(Hooks.useInfiniteScroll).mockImplementation(mockUseInfiniteScroll);
    vi.mocked(Hooks.useFollowUser).mockImplementation(mockUseFollowUser);
  });

  it('matches snapshot with no connections', () => {
    const { container } = render(<ProfileFollowers />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    vi.mocked(Hooks.useProfileConnections).mockReturnValue(mockLoadingConnectionsResult);
    const { container } = render(<ProfileFollowers />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with connections', () => {
    vi.mocked(Hooks.useProfileConnections).mockReturnValue(mockConnectionsResult);

    const { container } = render(<ProfileFollowers />);
    expect(container).toMatchSnapshot();
  });
});
