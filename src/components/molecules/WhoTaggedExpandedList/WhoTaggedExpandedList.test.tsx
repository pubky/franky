import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhoTaggedExpandedList } from './WhoTaggedExpandedList';
import type { TaggerWithAvatar } from '@/molecules/TaggedItem/TaggedItem.types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useFollowUser hook
const mockToggleFollow = vi.fn();
const mockIsUserLoading = vi.fn().mockReturnValue(false);
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useFollowUser: vi.fn(() => ({
      toggleFollow: mockToggleFollow,
      isUserLoading: mockIsUserLoading,
    })),
    useRequireAuth: vi.fn(() => ({
      isAuthenticated: true,
      requireAuth: vi.fn((action: () => void) => action()),
    })),
  };
});

// Mock core auth store
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useAuthStore: vi.fn(() => ({
      currentUserPubky: 'current-user-pubky',
    })),
  };
});

// Mock UserListItem
vi.mock('@/organisms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/organisms')>();
  return {
    ...actual,
    UserListItem: ({
      user,
      onUserClick,
      onFollowClick,
      isLoading,
      isCurrentUser,
    }: {
      user: { id: string; name?: string };
      onUserClick?: (id: string) => void;
      onFollowClick?: (id: string, isFollowing: boolean) => void;
      isLoading?: boolean;
      isCurrentUser?: boolean;
    }) => (
      <div data-testid={`user-list-item-${user.id}`} data-loading={isLoading} data-current-user={isCurrentUser}>
        <span>{user.name || user.id}</span>
        <button data-testid={`user-click-${user.id}`} onClick={() => onUserClick?.(user.id)}>
          View Profile
        </button>
        <button data-testid={`follow-click-${user.id}`} onClick={() => onFollowClick?.(user.id, false)}>
          Follow
        </button>
      </div>
    ),
  };
});

const mockTaggers: TaggerWithAvatar[] = [
  { id: 'user1', avatarUrl: 'https://cdn.example.com/avatar/user1', name: 'Alice' },
  { id: 'user2', avatarUrl: 'https://cdn.example.com/avatar/user2', name: 'Bob' },
  { id: 'user3', avatarUrl: 'https://cdn.example.com/avatar/user3' },
];

describe('WhoTaggedExpandedList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders with default props', () => {
    render(<WhoTaggedExpandedList taggers={mockTaggers} />);
    expect(screen.getByTestId('who-tagged-expanded-list')).toBeInTheDocument();
  });

  it('renders all taggers as UserListItems', () => {
    render(<WhoTaggedExpandedList taggers={mockTaggers} />);
    expect(screen.getByTestId('user-list-item-user1')).toBeInTheDocument();
    expect(screen.getByTestId('user-list-item-user2')).toBeInTheDocument();
    expect(screen.getByTestId('user-list-item-user3')).toBeInTheDocument();
  });

  it('returns null when taggers array is empty', () => {
    const { container } = render(<WhoTaggedExpandedList taggers={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('navigates to user profile when user is clicked', () => {
    render(<WhoTaggedExpandedList taggers={mockTaggers} />);
    fireEvent.click(screen.getByTestId('user-click-user1'));
    expect(mockPush).toHaveBeenCalledWith('/profile/user1');
  });

  it('calls toggleFollow when follow button is clicked', () => {
    render(<WhoTaggedExpandedList taggers={mockTaggers} />);
    fireEvent.click(screen.getByTestId('follow-click-user1'));
    expect(mockToggleFollow).toHaveBeenCalledWith('user1', false);
  });

  it('applies custom data-testid', () => {
    render(<WhoTaggedExpandedList taggers={mockTaggers} data-testid="custom-test-id" />);
    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});

describe('WhoTaggedExpandedList - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with single user', () => {
    const singleTagger: TaggerWithAvatar[] = [
      { id: 'user1', avatarUrl: 'https://cdn.example.com/avatar/user1', name: 'Alice' },
    ];
    const { container } = render(<WhoTaggedExpandedList taggers={singleTagger} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiple users', () => {
    const { container } = render(<WhoTaggedExpandedList taggers={mockTaggers} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty taggers', () => {
    const { container } = render(<WhoTaggedExpandedList taggers={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
